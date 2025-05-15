
import React, { useState } from 'react';
import { Event } from '@/types';
import { format } from 'date-fns';
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
  };
  
  return (
    <>
      <div
        className={`${getEventColorClass(event.color)} p-2 rounded-md text-white cursor-pointer shadow-sm animate-fade-in`}
        onClick={() => setShowDetail(true)}
        draggable
        onDragStart={handleDragStart}
      >
        <div className="text-sm font-semibold truncate">{event.title}</div>
        {totalTasks > 0 && (
          <div className="text-xs mt-1 flex items-center justify-between">
            <Badge variant="outline" className="text-white border-white/30 hover:bg-white/10">
              {completedTasks}/{totalTasks}
            </Badge>
          </div>
        )}
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
