
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Pencil, Trash, Download, BarChart2, Filter } from 'lucide-react';
import { useEvents } from '@/context/EventContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskList from './TaskList';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import EventFormDialog from './EventFormDialog';
import { useAuth } from '@/context/AuthContext';
import { generatePdf } from '@/lib/pdf-generator';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import EventAnalytics from './EventAnalytics';

interface EventDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

const EventDetailDialog: React.FC<EventDetailDialogProps> = ({ isOpen, onClose, eventId }) => {
  const { 
    getEventById, 
    deleteEvent, 
    addTaskToEvent, 
    updateTaskInEvent, 
    deleteTaskFromEvent,
    toggleTaskCompletion 
  } = useEvents();
  
  const { isAdmin, isEditor } = useAuth();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const event = getEventById(eventId);
  
  if (!event) {
    return null;
  }

  const handleDialogClick = (e: React.MouseEvent) => {
    // Prevent event bubbling to parent elements
    e.stopPropagation();
  };
  
  const handleDelete = async () => {
    const success = await deleteEvent(eventId);
    if (success) {
      setShowDeleteConfirm(false);
      onClose();
    }
  };
  
  const completedTasks = event.tasks.filter(task => task.completed);
  const incompleteTasks = event.tasks.filter(task => !task.completed);
  const progress = event.tasks.length > 0 
    ? Math.round((completedTasks.length / event.tasks.length) * 100) 
    : 0;

  const companyLabel = event.company ? `Empresa: ${event.company}` : null;
  
  const handleExportPdf = () => {
    generatePdf(event);
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-auto" onClick={handleDialogClick}>
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-xl">{event.title}</DialogTitle>
                <DialogDescription className="flex items-center mt-1">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {format(new Date(event.date), 'PPP', { locale: ptBR })}
                </DialogDescription>
                {companyLabel && (
                  <div className="mt-1 text-sm text-gray-500">
                    {companyLabel}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                {(isAdmin || isEditor) && (
                  <>
                    <Button variant="outline" size="icon" onClick={() => setShowEditForm(true)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setShowDeleteConfirm(true)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                <Button variant="outline" size="icon" onClick={handleExportPdf}>
                  <Download className="h-4 w-4" />
                </Button>
                
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                      <BarChart2 className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:w-[600px] max-w-full">
                    <SheetHeader>
                      <SheetTitle>Análise do Evento</SheetTitle>
                      <SheetDescription>
                        Estatísticas e gráficos para {event.title}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-8">
                      <EventAnalytics event={event} />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </DialogHeader>
          
          {event.description && (
            <div className="mt-2 text-sm text-gray-600 border-t pt-2">
              {event.description}
            </div>
          )}
          
          {event.tasks.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Progresso</span>
                <span>{completedTasks.length} de {event.tasks.length} ({progress}%)</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-green-500 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <Tabs defaultValue="all" className="mt-6">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="all">
                Todas ({event.tasks.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pendentes ({incompleteTasks.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Concluídas ({completedTasks.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <TaskList
                tasks={event.tasks}
                onToggleComplete={(taskId) => toggleTaskCompletion(event.id, taskId)}
                onUpdateTask={(task) => updateTaskInEvent(event.id, task)}
                onDeleteTask={(taskId) => deleteTaskFromEvent(event.id, taskId)}
                onAddTask={(task) => addTaskToEvent(event.id, task)}
                eventId={event.id}
              />
            </TabsContent>
            
            <TabsContent value="pending">
              <TaskList
                tasks={incompleteTasks}
                onToggleComplete={(taskId) => toggleTaskCompletion(event.id, taskId)}
                onUpdateTask={(task) => updateTaskInEvent(event.id, task)}
                onDeleteTask={(taskId) => deleteTaskFromEvent(event.id, taskId)}
                onAddTask={(task) => addTaskToEvent(event.id, task)}
                eventId={event.id}
              />
            </TabsContent>
            
            <TabsContent value="completed">
              <TaskList
                tasks={completedTasks}
                onToggleComplete={(taskId) => toggleTaskCompletion(event.id, taskId)}
                onUpdateTask={(task) => updateTaskInEvent(event.id, task)}
                onDeleteTask={(taskId) => deleteTaskFromEvent(event.id, taskId)}
                onAddTask={(task) => addTaskToEvent(event.id, task)}
                eventId={event.id}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir evento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o evento "{event.title}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {showEditForm && (
        <EventFormDialog
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          selectedDate={event.date}
          event={event}
          isEditing={true}
        />
      )}
    </>
  );
};

export default EventDetailDialog;
