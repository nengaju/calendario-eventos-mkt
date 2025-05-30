import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Event, Task, CompanyType, AssigneeType } from '@/types';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface EventContextType {
  events: Event[];
  addEvent: (event: Omit<Event, "id">) => Promise<string | null>;
  updateEvent: (event: Event) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
  getEventById: (id: string) => Event | undefined;
  addTaskToEvent: (eventId: string, task: Omit<Task, "id">) => Promise<boolean>;
  updateTaskInEvent: (eventId: string, task: Task) => Promise<boolean>;
  deleteTaskFromEvent: (eventId: string, taskId: string) => Promise<boolean>;
  moveEventToDate: (eventId: string, newDate: Date) => Promise<boolean>;
  toggleTaskCompletion: (eventId: string, taskId: string) => Promise<boolean>;
  loading: boolean;
  addTaskAssignee: (taskId: string, userId: string) => Promise<boolean>;
  removeTaskAssignee: (taskId: string, userId: string) => Promise<boolean>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  // Load events from Supabase on mount and when user changes
  useEffect(() => {
    if (user) {
      loadEvents();
    } else {
      setEvents([]);
      setLoading(false);
    }
    
    // Set up realtime subscription for events only if user is logged in
    if (user) {
      const channel = supabase
        .channel('public:events')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'events' }, 
          () => {
            loadEvents();
          }
        )
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'tasks' }, 
          () => {
            loadEvents();
          }
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'task_assignees' },
          () => {
            loadEvents();
          }
        )
        .subscribe((status, err) => {
          if (status !== 'SUBSCRIBED' || err) {
            console.error('Error subscribing to events:', status, err);
          }
        });
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  // Function to load events from Supabase
  const loadEvents = async () => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*');

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        throw eventsError;
      }

      // If no events data, set empty array and return early
      if (!eventsData || eventsData.length === 0) {
        setEvents([]);
        setLoading(false);
        return;
      }

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*');

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        throw tasksError;
      }

      // Fetch task assignees - Fixed query to avoid the foreign key error
      const { data: assigneesData, error: assigneesError } = await supabase
        .from('task_assignees')
        .select('*');

      if (assigneesError) {
        console.error('Error fetching task assignees:', assigneesError);
        throw assigneesError;
      }

      // Fetch profiles separately to get usernames
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, role');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Process data with proper error handling
      const processedEvents = eventsData.map(event => {
        // Find tasks for this event
        const eventTasks = tasksData
          ? tasksData
              .filter(task => task && task.event_id === event.id)
              .map(task => {
                // Find assignees for this task
                const taskAssignees = assigneesData
                  ? assigneesData
                      .filter(assignee => assignee && assignee.task_id === task.id)
                      .map(assignee => {
                        // Find profile data for this assignee
                        const profile = profilesData.find(p => p.id === assignee.user_id);
                        if (profile) {
                          return {
                            id: profile.id,
                            username: profile.username,
                            role: profile.role
                          };
                        }
                        // Fallback to just the user_id as string
                        return assignee.user_id;
                      })
                      // Filter out any null or undefined values
                      .filter(Boolean) as AssigneeType[]
                  : [];

                // Check if current user is assignee or creator
                const isAssignee = taskAssignees.some(a => {
                  if (typeof a === 'string') {
                    return a === user?.id;
                  }
                  return a && a.id === user?.id;
                });
                const isCreator = task.created_by === user?.id;
                const isAdmin = profile?.role === 'admin';
                const isEditor = profile?.role === 'editor';
                
                // Determine if the task is editable by this user
                const editable = isAdmin || isCreator || (isAssignee && isEditor);

                return {
                  id: task.id,
                  title: task.title,
                  completed: task.completed,
                  assignees: taskAssignees,
                  editable
                };
              })
          : [];

        return {
          id: event.id,
          title: event.title,
          date: new Date(event.date),
          description: event.description || '',
          tasks: eventTasks,
          color: event.color || 'blue',
          company: event.company as CompanyType || undefined
        };
      });

      setEvents(processedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar eventos. Por favor, tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (eventData: Omit<Event, "id">): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: eventData.title,
          date: eventData.date.toISOString(),
          description: eventData.description,
          color: eventData.color,
          company: eventData.company,
          created_by: user.id
        })
        .select('id')
        .single();

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Evento criado com sucesso"
      });
      
      return data.id;
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar evento",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateEvent = async (updatedEvent: Event): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('events')
        .update({
          title: updatedEvent.title,
          date: updatedEvent.date.toISOString(),
          description: updatedEvent.description,
          color: updatedEvent.color,
          company: updatedEvent.company
        })
        .eq('id', updatedEvent.id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Evento atualizado com sucesso"
      });
      
      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar evento",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteEvent = async (id: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Evento removido com sucesso"
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover evento",
        variant: "destructive"
      });
      return false;
    }
  };

  const getEventById = (id: string) => {
    return events.find(event => event.id === id);
  };

  const addTaskToEvent = async (eventId: string, taskData: Omit<Task, "id">): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Insert task
      const { data: taskResult, error: taskError } = await supabase
        .from('tasks')
        .insert({
          event_id: eventId,
          title: taskData.title,
          completed: false,
          created_by: user.id
        })
        .select('id')
        .single();

      if (taskError) throw taskError;
      
      // Add assignees if provided
      if (taskData.assignees && taskData.assignees.length > 0) {
        const assigneePromises = taskData.assignees.map(assigneeId => {
          // Ensure assigneeId is a string, not an object
          let userId: string | null = null;
          
          if (typeof assigneeId === 'string') {
            userId = assigneeId;
          } else if (assigneeId && typeof assigneeId === 'object' && 'id' in assigneeId) {
            userId = assigneeId.id;
          }
          
          if (!userId) return Promise.resolve(); // Skip if userId is null
          
          return supabase
            .from('task_assignees')
            .insert({
              task_id: taskResult.id,
              user_id: userId
            });
        });
        
        // Filter out any undefined promises before awaiting them
        await Promise.all(assigneePromises.filter(Boolean));
      }
      
      toast({
        title: "Sucesso",
        description: "Tarefa adicionada com sucesso"
      });
      
      return true;
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar tarefa",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateTaskInEvent = async (eventId: string, updatedTask: Task): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: updatedTask.title,
          completed: updatedTask.completed
        })
        .eq('id', updatedTask.id);

      if (error) throw error;
      
      toast({
        title: "Sucesso", 
        description: "Tarefa atualizada com sucesso"
      });
      
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar tarefa",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteTaskFromEvent = async (eventId: string, taskId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Tarefa removida com sucesso"
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover tarefa",
        variant: "destructive"
      });
      return false;
    }
  };

  const moveEventToDate = async (eventId: string, newDate: Date): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('events')
        .update({
          date: newDate.toISOString()
        })
        .eq('id', eventId);

      if (error) throw error;
      
      toast({
        title: "Evento movido",
        description: `Evento movido para ${format(newDate, 'dd/MM/yyyy')}`
      });
      
      return true;
    } catch (error) {
      console.error('Error moving event:', error);
      toast({
        title: "Erro",
        description: "Erro ao mover evento",
        variant: "destructive"
      });
      return false;
    }
  };

  const toggleTaskCompletion = async (eventId: string, taskId: string): Promise<boolean> => {
    if (!user) return false;
    
    const event = events.find(e => e.id === eventId);
    if (!event) return false;
    
    const task = event.tasks.find(t => t.id === taskId);
    if (!task) return false;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          completed: !task.completed
        })
        .eq('id', taskId);

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error toggling task completion:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar tarefa",
        variant: "destructive"
      });
      return false;
    }
  };

  const addTaskAssignee = async (taskId: string, userId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('task_assignees')
        .insert({
          task_id: taskId,
          user_id: userId
        });

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Responsável adicionado com sucesso"
      });
      
      return true;
    } catch (error) {
      console.error('Error adding assignee:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar responsável",
        variant: "destructive"
      });
      return false;
    }
  };

  const removeTaskAssignee = async (taskId: string, userId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('task_assignees')
        .delete()
        .eq('task_id', taskId)
        .eq('user_id', userId);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Responsável removido com sucesso"
      });
      
      return true;
    } catch (error) {
      console.error('Error removing assignee:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover responsável",
        variant: "destructive"
      });
      return false;
    }
  };

  const value = {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    addTaskToEvent,
    updateTaskInEvent,
    deleteTaskFromEvent,
    moveEventToDate,
    toggleTaskCompletion,
    loading,
    addTaskAssignee,
    removeTaskAssignee
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
