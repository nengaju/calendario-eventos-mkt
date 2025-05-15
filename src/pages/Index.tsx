
import React, { useState } from 'react';
import CalendarHeader from '@/components/CalendarHeader';
import CalendarGrid from '@/components/CalendarGrid';
import EventFormDialog from '@/components/EventFormDialog';
import { EventProvider, useEvents } from '@/context/EventContext';

const CalendarView = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  
  const { moveEventToDate } = useEvents();
  
  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    setShowEventForm(true);
  };
  
  const handleDrop = (date: Date, eventId: string) => {
    moveEventToDate(eventId, date);
  };
  
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <CalendarHeader currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
      
      <CalendarGrid 
        currentMonth={currentMonth} 
        onDateClick={handleDateClick}
        onDrop={handleDrop}
      />
      
      {showEventForm && selectedDate && (
        <EventFormDialog
          isOpen={showEventForm}
          onClose={() => setShowEventForm(false)}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
};

const Index = () => {
  return (
    <EventProvider>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900">Calendário de Eventos Kanban</h1>
          </div>
        </header>
        
        <main>
          <CalendarView />
        </main>
      </div>
    </EventProvider>
  );
};

export default Index;
