
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Event, Task, CompanyType } from '@/types';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

interface EventContextType {
  events: Event[];
  addEvent: (event: Omit<Event, "id">) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
  getEventById: (id: string) => Event | undefined;
  addTaskToEvent: (eventId: string, task: Omit<Task, "id">) => void;
  updateTaskInEvent: (eventId: string, task: Task) => void;
  deleteTaskFromEvent: (eventId: string, taskId: string) => void;
  moveEventToDate: (eventId: string, newDate: Date) => void;
  toggleTaskCompletion: (eventId: string, taskId: string) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'kanban-events';

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);

  // Load events from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents);
        // Convert date strings back to Date objects
        const eventsWithDateObjects = parsedEvents.map((event: any) => ({
          ...event,
          date: new Date(event.date)
        }));
        setEvents(eventsWithDateObjects);
      } catch (error) {
        console.error('Error parsing events from localStorage:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar eventos salvos",
          variant: "destructive"
        });
      }
    }
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const addEvent = (eventData: Omit<Event, "id">) => {
    const newEvent: Event = {
      ...eventData,
      id: crypto.randomUUID(),
      tasks: eventData.tasks || []
    };
    
    setEvents(prev => [...prev, newEvent]);
    toast({
      title: "Sucesso",
      description: "Evento criado com sucesso"
    });
  };

  const updateEvent = (updatedEvent: Event) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
    toast({
      title: "Sucesso",
      description: "Evento atualizado com sucesso"
    });
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
    toast({
      title: "Sucesso",
      description: "Evento removido com sucesso"
    });
  };

  const getEventById = (id: string) => {
    return events.find(event => event.id === id);
  };

  const addTaskToEvent = (eventId: string, taskData: Omit<Task, "id">) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
    };
    
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { ...event, tasks: [...event.tasks, newTask] } 
          : event
      )
    );
    toast({
      title: "Sucesso",
      description: "Tarefa adicionada com sucesso"
    });
  };

  const updateTaskInEvent = (eventId: string, updatedTask: Task) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { 
              ...event, 
              tasks: event.tasks.map(task => 
                task.id === updatedTask.id ? updatedTask : task
              ) 
            } 
          : event
      )
    );
    toast({
      title: "Sucesso", 
      description: "Tarefa atualizada com sucesso"
    });
  };

  const deleteTaskFromEvent = (eventId: string, taskId: string) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { ...event, tasks: event.tasks.filter(task => task.id !== taskId) } 
          : event
      )
    );
    toast({
      title: "Sucesso",
      description: "Tarefa removida com sucesso"
    });
  };

  const moveEventToDate = (eventId: string, newDate: Date) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { ...event, date: newDate } 
          : event
      )
    );
    toast({
      title: "Evento movido",
      description: `Evento movido para ${format(newDate, 'dd/MM/yyyy')}`
    });
  };

  const toggleTaskCompletion = (eventId: string, taskId: string) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { 
              ...event, 
              tasks: event.tasks.map(task => 
                task.id === taskId ? { ...task, completed: !task.completed } : task
              ) 
            } 
          : event
      )
    );
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
    toggleTaskCompletion
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
