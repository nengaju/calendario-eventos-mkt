
import React, { useState } from 'react';
import { Task, AssigneeType } from '@/types';
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

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (task: Omit<Task, "id">) => void;
}

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  onToggleComplete, 
  onUpdateTask, 
  onDeleteTask,
  onAddTask 
}) => {
  const { user, isAdmin } = useAuth();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState<AssigneeType | undefined>(
    isAdmin ? undefined : user?.assignee
  );
  
  const assignees: AssigneeType[] = ["MARIANO", "RUBENS", "GIOVANNA", "YAGO", "JÚNIOR"];
  
  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask({
        title: newTaskTitle.trim(),
        completed: false,
        assignee: newTaskAssignee
      });
      setNewTaskTitle('');
      setNewTaskAssignee(isAdmin ? undefined : user?.assignee);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTaskTitle.trim()) {
      handleAddTask();
    }
  };
  
  // Filter tasks based on user role
  const filteredTasks = isAdmin 
    ? tasks 
    : tasks.filter(task => !task.assignee || task.assignee === user?.assignee);
  
  return (
    <div className="space-y-4">
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
          
          {isAdmin && (
            <Select
              value={newTaskAssignee}
              onValueChange={(value) => setNewTaskAssignee(value as AssigneeType)}
            >
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="Designar responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {assignees.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Button type="button" onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </div>
      </div>
      
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
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-4">
          {isAdmin 
            ? "Nenhuma tarefa adicionada ainda" 
            : "Nenhuma tarefa atribuída a você ainda"}
        </div>
      )}
    </div>
  );
};

export default TaskList;
