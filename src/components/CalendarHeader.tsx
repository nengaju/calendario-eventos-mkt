
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import EventFormDialog from './EventFormDialog';

interface CalendarHeaderProps {
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ currentMonth, setCurrentMonth }) => {
  const [showEventForm, setShowEventForm] = useState(false);
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 p-2 bg-white rounded-lg shadow">
      <div className="flex items-center mb-2 sm:mb-0">
        <Button variant="outline" size="icon" onClick={prevMonth} className="mr-2">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <Button variant="outline" size="icon" onClick={nextMonth} className="ml-2">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div>
        <Button onClick={() => setShowEventForm(true)} className="bg-kanban-blue text-white">
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      </div>
      
      {showEventForm && (
        <EventFormDialog
          isOpen={showEventForm}
          onClose={() => setShowEventForm(false)}
          selectedDate={currentMonth}
        />
      )}
    </div>
  );
};

export default CalendarHeader;
