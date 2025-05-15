
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar, CheckCircle, AlertCircle, CalendarClock } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { events } = useEvents();
  
  // Count tasks assigned to the current user
  const userTasks = events.flatMap(event => 
    event.tasks.filter(task => 
      task.assignee === user?.assignee
    )
  );
  
  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  
  // Calculate completion percentage
  const completionPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo(a), {user?.username}! Aqui está um resumo das suas atividades.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">
              Eventos cadastrados no sistema
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              Tarefas atribuídas a você
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {completionPercentage}% de conclusão
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">
              Tarefas aguardando conclusão
            </p>
          </CardContent>
        </Card>
      </div>
      
      {totalTasks === 0 && (
        <Alert>
          <AlertTitle>Nenhuma tarefa atribuída</AlertTitle>
          <AlertDescription>
            Você não possui tarefas atribuídas no momento. As tarefas atribuídas aparecerão aqui.
          </AlertDescription>
        </Alert>
      )}
      
      {/* You can add more sections here like recent activities, upcoming events, etc. */}
    </div>
  );
};

export default Dashboard;
