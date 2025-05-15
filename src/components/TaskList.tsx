
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
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState<AssigneeType | undefined>(undefined);
  
  const assignees: AssigneeType[] = ["MARIANO", "RUBENS", "GIOVANNA", "YAGO", "JÚNIOR"];
  
  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask({
        title: newTaskTitle.trim(),
        completed: false,
        assignee: newTaskAssignee
      });
      setNewTaskTitle('');
      setNewTaskAssignee(undefined);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTaskTitle.trim()) {
      handleAddTask();
    }
  };
  
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
          
          <Select
            value={newTaskAssignee}
            onValueChange={(value) => setNewTaskAssignee(value as AssigneeType)}
          >
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Designar responsável" />
            </SelectTrigger>
            <SelectContent>
              {assignees.map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button type="button" onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </div>
      </div>
      
      <div className="font-medium text-base">Tarefas ({tasks.length})</div>
      
      {tasks.length > 0 ? (
        <div className="space-y-2">
          {tasks.map((task) => (
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
          Nenhuma tarefa adicionada ainda
        </div>
      )}
    </div>
  );
};

export default TaskList;
