
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useEvents } from '@/context/EventContext';
import { Event, CompanyType } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EventFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  event?: Event;
  isEditing?: boolean;
}

const EventFormDialog: React.FC<EventFormDialogProps> = ({ 
  isOpen, 
  onClose, 
  selectedDate,
  event,
  isEditing = false
}) => {
  const { addEvent, updateEvent } = useEvents();
  
  const [title, setTitle] = useState(event?.title || '');
  const [date, setDate] = useState<Date>(event?.date || selectedDate);
  const [description, setDescription] = useState(event?.description || '');
  const [company, setCompany] = useState<CompanyType | undefined>(event?.company);
  
  // Set color based on company
  useEffect(() => {
    if (company === 'YATTA') {
      setColor('yellow');
    } else if (company === 'FORBEL') {
      setColor('blue');
    }
  }, [company]);
  
  const [color, setColor] = useState(event?.color || 'blue');
  
  const colors = [
    { name: 'Azul', value: 'blue' },
    { name: 'Verde', value: 'green' },
    { name: 'Vermelho', value: 'red' },
    { name: 'Roxo', value: 'purple' },
    { name: 'Laranja', value: 'orange' },
    { name: 'Amarelo', value: 'yellow' },
    { name: 'Turquesa', value: 'teal' },
  ];

  const companies: { name: string; value: CompanyType }[] = [
    { name: 'YATTA', value: 'YATTA' },
    { name: 'FORBEL', value: 'FORBEL' },
  ];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    if (isEditing && event) {
      updateEvent({
        ...event,
        title,
        date,
        description,
        color,
        company
      });
    } else {
      addEvent({
        title,
        date,
        description,
        tasks: [],
        color,
        company
      });
    }
    
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do evento abaixo.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título do evento"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP', { locale: ptBR }) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Select 
              value={company} 
              onValueChange={(value) => setCompany(value as CompanyType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.value} value={company.value}>
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full bg-kanban-${company.value === 'YATTA' ? 'yellow' : 'blue'} mr-2`}></div>
                      {company.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do evento"
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventFormDialog;
