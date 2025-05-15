
import React, { useState } from 'react';
import { Task, AssigneeType } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Pencil, Trash, User, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { getAssigneeColor } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onToggleComplete,
  onUpdateTask,
  onDeleteTask 
}) => {
  const { user, isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editAssignee, setEditAssignee] = useState<AssigneeType | undefined>(task.assignee);
  
  const assignees: AssigneeType[] = ["MARIANO", "RUBENS", "GIOVANNA", "YAGO", "JÚNIOR"];
  
  // Check if the current user has permission to interact with this task
  const canInteract = isAdmin || user?.assignee === task.assignee;
  
  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      onUpdateTask({
        ...task,
        title: editTitle,
        assignee: editAssignee
      });
      setIsEditing(false);
    }
  };
  
  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditAssignee(task.assignee);
    setIsEditing(false);
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
        
        {isAdmin && (
          <Select
            value={editAssignee}
            onValueChange={(value) => setEditAssignee(value as AssigneeType)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Designar responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem responsável</SelectItem>
              {assignees.map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
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
    <div className={`flex items-center justify-between p-2 border rounded-md ${task.completed ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="flex items-center gap-3">
        <Checkbox 
          checked={task.completed} 
          onCheckedChange={() => canInteract && onToggleComplete(task.id)}
          className={`${task.completed ? 'opacity-75' : ''} ${!canInteract ? 'cursor-not-allowed opacity-50' : ''}`}
          disabled={!canInteract}
        />
        
        <span className={`${task.completed ? 'line-through text-gray-500' : ''}`}>
          {task.title}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        {task.assignee && (
          <Badge variant="outline" className={`${getAssigneeColor(task.assignee)}`}>
            <User className="h-3 w-3 mr-1" />
            {task.assignee}
          </Badge>
        )}
        
        {canInteract && (
          <>
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={() => onDeleteTask(task.id)}>
              <Trash className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
