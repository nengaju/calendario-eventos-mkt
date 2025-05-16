
import React, { useState } from 'react';
import CalendarHeader from '@/components/CalendarHeader';
import CalendarGrid from '@/components/CalendarGrid';
import EventFormDialog from '@/components/EventFormDialog';
import { useEvents } from '@/context/EventContext';
import { Button } from '@/components/ui/button';
import { Calendar, Download, Filter, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateMonthlyReport } from '@/lib/pdf-generator';

const CalendarView = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  
  // Filtering
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const { events, moveEventToDate, loading } = useEvents();
  
  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    setShowEventForm(true);
  };
  
  const handleDrop = (date: Date, eventId: string) => {
    moveEventToDate(eventId, date);
  };
  
  const clearFilters = () => {
    setCompanyFilter(null);
    setDateFilter(null);
  };
  
  const handleExportMonthlyReport = () => {
    generateMonthlyReport(events, currentMonth);
  };
  
  // Filter events based on current filters
  const filteredEvents = events.filter(event => {
    // Company filter
    if (companyFilter && event.company !== companyFilter) {
      return false;
    }
    
    // Date filter
    if (dateFilter) {
      const eventDate = new Date(event.date);
      if (
        eventDate.getDate() !== dateFilter.getDate() ||
        eventDate.getMonth() !== dateFilter.getMonth() ||
        eventDate.getFullYear() !== dateFilter.getFullYear()
      ) {
        return false;
      }
    }
    
    return true;
  });
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <CalendarHeader currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
        
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
                {(companyFilter || dateFilter) && (
                  <Badge variant="secondary" className="ml-1">
                    {(companyFilter ? 1 : 0) + (dateFilter ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h4 className="font-medium">Filtrar Eventos</h4>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Empresa</label>
                  <Select
                    value={companyFilter || ""}
                    onValueChange={val => setCompanyFilter(val || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as empresas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as empresas</SelectItem>
                      <SelectItem value="YATTA">YATTA</SelectItem>
                      <SelectItem value="FORBEL">FORBEL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data específica</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {dateFilter ? format(dateFilter, 'PPP', { locale: ptBR }) : <span>Selecionar data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateFilter || undefined}
                        onSelect={setDateFilter}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" /> Limpar filtros
                  </Button>
                  <Button size="sm" onClick={() => setShowFilters(false)}>
                    Aplicar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button variant="outline" onClick={handleExportMonthlyReport}>
            <Download className="h-4 w-4 mr-1" /> Relatório Mensal
          </Button>
        </div>
      </div>
      
      {(companyFilter || dateFilter) && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-500">Filtros ativos:</span>
          {companyFilter && (
            <Badge 
              variant="outline" 
              className="cursor-pointer"
              onClick={() => setCompanyFilter(null)}
            >
              Empresa: {companyFilter} <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          {dateFilter && (
            <Badge 
              variant="outline" 
              className="cursor-pointer"
              onClick={() => setDateFilter(null)}
            >
              Data: {format(dateFilter, 'dd/MM/yyyy')} <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpar todos
          </Button>
        </div>
      )}
      
      <CalendarGrid 
        currentMonth={currentMonth} 
        onDateClick={handleDateClick}
        onDrop={handleDrop}
        filteredEvents={filteredEvents}
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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">CALENDÁRIO DE EVENTOS - MKT</h1>
        </div>
      </header>
      
      <main>
        <CalendarView />
      </main>
    </div>
  );
};

export default Index;
