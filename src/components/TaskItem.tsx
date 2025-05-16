
import React, { useState, useEffect } from 'react';
import { Task } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Pencil, Trash, User, Check, X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEvents } from '@/context/EventContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from '@/components/ui/scroll-area';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  eventId?: string;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onToggleComplete,
  onUpdateTask,
  onDeleteTask,
  eventId
}) => {
  const { user, profile, isAdmin, isEditor } = useAuth();
  const { addTaskAssignee, removeTaskAssignee } = useEvents();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [availableUsers, setAvailableUsers] = useState<{id: string, username: string, role: string}[]>([]);
  
  // Check if the current user has permission to interact with this task
  const canInteract = isAdmin || isEditor || task.editable;
  
  // Fetch available users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, role')
          .order('username');
          
        if (error) throw error;
        setAvailableUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);
  
  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      onUpdateTask({
        ...task,
        title: editTitle
      });
      setIsEditing(false);
    }
  };
  
  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setIsEditing(false);
  };
  
  const handleAddAssignee = async (userId: string) => {
    if (task.id && eventId) {
      await addTaskAssignee(task.id, userId);
    }
  };
  
  const handleRemoveAssignee = async (userId: string) => {
    if (task.id && eventId) {
      await removeTaskAssignee(task.id, userId);
    }
  };
  
  const isAssigned = (userId: string): boolean => {
    if (!task.assignees) return false;
    return task.assignees.some(assignee => assignee.id === userId);
  };
  
  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 p-2 border rounded-md bg-gray-50">
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full"
          placeholder="Título da tarefa"
          autoFocus
        />
        
        <div className="flex justify-end gap-2 mt-2">
          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
            <X className="h-4 w-4 mr-1" /> Cancelar
          </Button>
          <Button size="sm" onClick={handleSaveEdit}>
            <Check className="h-4 w-4 mr-1" /> Salvar
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex items-center justify-between p-2 border rounded-md ${task.completed ? 'bg-gray-50' : canInteract ? 'bg-white' : 'bg-gray-50 opacity-75'}`}>
      <div className="flex items-center gap-3">
        <Checkbox 
          checked={task.completed} 
          onCheckedChange={() => canInteract && onToggleComplete(task.id)}
          className={`${task.completed ? 'opacity-75' : ''} ${!canInteract ? 'cursor-not-allowed opacity-50' : ''}`}
          disabled={!canInteract}
        />
        
        <span className={`${task.completed ? 'line-through text-gray-500' : canInteract ? '' : 'text-gray-500'}`}>
          {task.title}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        {task.assignees && task.assignees.length > 0 && (
          <div className="flex -space-x-1 overflow-hidden mr-1">
            {task.assignees.slice(0, 3).map((assignee, index) => (
              <Badge key={index} variant="outline" className={`${assignee.id === user?.id ? 'bg-blue-100' : ''}`}>
                {assignee.username.substring(0, 2)}
              </Badge>
            ))}
            
            {task.assignees.length > 3 && (
              <Badge variant="outline">
                +{task.assignees.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        {isAdmin && task.id && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <User className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2">
              <h3 className="font-medium text-sm mb-2">Responsáveis</h3>
              <ScrollArea className="max-h-60">
                {availableUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between py-1">
                    <span className="text-sm">{user.username}</span>
                    {isAssigned(user.id) ? (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 px-2" 
                        onClick={() => handleRemoveAssignee(user.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 px-2" 
                        onClick={() => handleAddAssignee(user.id)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </ScrollArea>
            </PopoverContent>
          </Popover>
        )}
        
        {canInteract && (
          <>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={() => onDeleteTask(task.id)}>
              <Trash className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
