
import React, { useState, useEffect } from 'react';
import { Task } from '@/types';
import TaskItem from './TaskItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, User } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/context/AuthContext';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (task: Omit<Task, "id">) => void;
  eventId?: string;
}

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  onToggleComplete, 
  onUpdateTask, 
  onDeleteTask,
  onAddTask,
  eventId
}) => {
  const { user, profile, isAdmin, isEditor } = useAuth();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignees, setNewTaskAssignees] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<{id: string, username: string}[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<{[key: string]: boolean}>({});
  
  // Fetch available users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username')
          .order('username');
          
        if (error) throw error;
        setAvailableUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    fetchUsers();
  }, []);
  
  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask({
        title: newTaskTitle.trim(),
        completed: false,
        assignees: Object.keys(selectedUsers).filter(id => selectedUsers[id])
      });
      setNewTaskTitle('');
      setNewTaskAssignees([]);
      setSelectedUsers({});
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTaskTitle.trim()) {
      handleAddTask();
    }
  };
  
  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };
  
  // Filter tasks based on user role
  const filteredTasks = tasks.filter(task => {
    // Admins see all tasks
    if (isAdmin) return true;
    
    // If the task has assignees, check if current user is assigned
    if (task.assignees && task.assignees.length > 0) {
      return task.assignees.some(assignee => assignee === user?.id);
    }
    
    // If no assignees, show task to everyone (assuming public task)
    return true;
  });
  
  return (
    <div className="space-y-4">
      {(isAdmin || isEditor) && (
        <div className="space-y-2">
          <div className="font-medium text-base">Adicionar nova tarefa</div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input 
              placeholder="Título da tarefa"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1"
            />
            
            <Button type="button" onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar
            </Button>
          </div>
          
          {newTaskTitle.trim() && isAdmin && (
            <div className="border p-2 rounded-md mt-2">
              <div className="font-medium text-sm mb-2">Designar responsáveis:</div>
              <div className="max-h-32 overflow-y-auto">
                {availableUsers.map(user => (
                  <div key={user.id} className="flex items-center space-x-2 mb-1">
                    <Checkbox 
                      id={`user-${user.id}`}
                      checked={!!selectedUsers[user.id]} 
                      onCheckedChange={() => handleUserToggle(user.id)}
                    />
                    <label 
                      htmlFor={`user-${user.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {user.username}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="font-medium text-base">Tarefas ({filteredTasks.length})</div>
      
      {filteredTasks.length > 0 ? (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              eventId={eventId}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-4">
          Nenhuma tarefa adicionada ainda
        </div>
      )}
    </div>
  );
};

export default TaskList;
