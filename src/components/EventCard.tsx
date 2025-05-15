
import React, { useState } from 'react';
import { Event } from '@/types';
import { Badge } from '@/components/ui/badge';
import { getEventColorClass } from '@/lib/utils';
import EventDetailDialog from './EventDetailDialog';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const [showDetail, setShowDetail] = useState(false);
  
  const completedTasks = event.tasks ? event.tasks.filter(task => task.completed).length : 0;
  const totalTasks = event.tasks ? event.tasks.length : 0;
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('event_id', event.id);
    e.stopPropagation(); // Prevent event bubbling
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    setShowDetail(true);
  };
  
  return (
    <>
      <div
        className={`${getEventColorClass(event.color)} p-2 rounded-md text-white cursor-pointer shadow-sm animate-fade-in`}
        onClick={handleClick}
        draggable
        onDragStart={handleDragStart}
      >
        <div className="text-sm font-semibold truncate">{event.title}</div>
        <div className="flex justify-between items-center mt-1">
          {event.company && (
            <span className="text-xs opacity-80">{event.company}</span>
          )}
          
          {totalTasks > 0 && (
            <Badge variant="outline" className="text-white border-white/30 hover:bg-white/10">
              {completedTasks}/{totalTasks}
            </Badge>
          )}
        </div>
      </div>
      
      {showDetail && (
        <EventDetailDialog 
          isOpen={showDetail}
          onClose={() => setShowDetail(false)}
          eventId={event.id}
        />
      )}
    </>
  );
};

export default EventCard;
