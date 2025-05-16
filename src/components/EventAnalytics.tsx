
import React from 'react';
import { Event, AssigneeType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface EventAnalyticsProps {
  event: Event;
}

const EventAnalytics: React.FC<EventAnalyticsProps> = ({ event }) => {
  // Calculate task stats
  const completedTasks = event.tasks.filter(task => task.completed);
  const totalTasks = event.tasks.length;
  const completedCount = completedTasks.length;
  const pendingCount = totalTasks - completedCount;
  
  // For pie chart - task completion status
  const taskStatusData = [
    { name: 'Concluídas', value: completedCount },
    { name: 'Pendentes', value: pendingCount }
  ];
  
  const COLORS = ['#10b981', '#f59e0b'];
  
  // For bar chart - assignees distribution
  const assigneeMap = new Map<string, { total: number, completed: number }>();
  
  event.tasks.forEach(task => {
    if (task.assignees && task.assignees.length > 0) {
      task.assignees.forEach(assignee => {
        // Handle both string and object assignee types
        const key = typeof assignee === 'string' ? assignee : assignee.username || 'Unknown';
        
        if (!assigneeMap.has(key)) {
          assigneeMap.set(key, { total: 0, completed: 0 });
        }
        
        const assigneeStats = assigneeMap.get(key)!;
        assigneeStats.total += 1;
        
        if (task.completed) {
          assigneeStats.completed += 1;
        }
      });
    }
  });
  
  const assigneeData = Array.from(assigneeMap.entries()).map(([name, stats]) => ({
    name,
    Total: stats.total,
    Concluídas: stats.completed
  }));
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Progresso das Tarefas</CardTitle>
        </CardHeader>
        <CardContent>
          {totalTasks > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center text-sm text-gray-500 mt-4">
                {completedCount} de {totalTasks} tarefas concluídas ({Math.round((completedCount/totalTasks) * 100)}%)
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhuma tarefa encontrada para este evento
            </div>
          )}
        </CardContent>
      </Card>
      
      {assigneeData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Tarefas por Responsável</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={assigneeData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Total" stackId="a" fill="#8884d8" />
                  <Bar dataKey="Concluídas" stackId="b" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas do Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-md p-4 text-center">
              <div className="text-2xl font-bold">{event.tasks.length}</div>
              <div className="text-sm text-gray-500">Total de Tarefas</div>
            </div>
            <div className="border rounded-md p-4 text-center">
              <div className="text-2xl font-bold">{assigneeMap.size || 0}</div>
              <div className="text-sm text-gray-500">Responsáveis</div>
            </div>
            <div className="border rounded-md p-4 text-center">
              <div className="text-2xl font-bold">{completedCount}</div>
              <div className="text-sm text-gray-500">Tarefas Concluídas</div>
            </div>
            <div className="border rounded-md p-4 text-center">
              <div className="text-2xl font-bold">{pendingCount}</div>
              <div className="text-sm text-gray-500">Tarefas Pendentes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventAnalytics;
