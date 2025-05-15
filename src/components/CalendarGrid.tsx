
import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEvents } from '@/context/EventContext';
import EventCard from './EventCard';

interface CalendarGridProps {
  currentMonth: Date;
  onDateClick: (day: Date) => void;
  onDrop: (date: Date, eventId: string) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ currentMonth, onDateClick, onDrop }) => {
  const { events } = useEvents();
  
  const renderDays = () => {
    const dateFormat = 'EEEEEE';
    const days = [];
    
    let startDate = startOfWeek(currentMonth, { weekStartsOn: 0 });
    
    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="col-span-1 h-10 flex items-center justify-center font-semibold text-sm" key={i}>
          {format(addDays(startDate, i), dateFormat, { locale: ptBR }).toUpperCase()}
        </div>
      );
    }
    
    return days;
  };
  
  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    const rows = [];
    let days = [];
    let day = startDate;
    
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const formattedDate = format(cloneDay, 'd');
        
        // Find events for this date
        const dayEvents = events.filter(event => 
          isSameDay(new Date(event.date), cloneDay)
        );
        
        days.push(
          <div
            className={`border min-h-[120px] p-1 relative col-span-1 
              ${!isSameMonth(day, monthStart) ? 'bg-gray-50 text-gray-400' : 'bg-white'} 
              hover:bg-gray-50 transition-colors cursor-pointer`}
            key={day.toString()}
            onClick={() => onDateClick(cloneDay)}
            onDrop={(e) => {
              e.preventDefault();
              const eventId = e.dataTransfer.getData('event_id');
              onDrop(cloneDay, eventId);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="sticky top-0 right-1 font-medium text-sm z-10">
              {formattedDate}
            </div>
            <div className="mt-2 flex flex-col gap-1">
              {dayEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        );
        
        day = addDays(day, 1);
      }
      
      rows.push(
        <div className="grid grid-cols-7 h-auto" key={day.toString()}>
          {days}
        </div>
      );
      
      days = [];
    }
    
    return rows;
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="grid grid-cols-7 border-b">
        {renderDays()}
      </div>
      {renderCells()}
    </div>
  );
};

export default CalendarGrid;
