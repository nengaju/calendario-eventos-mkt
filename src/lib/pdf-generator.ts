
import { Event } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/components/ui/use-toast';

export const generatePdf = async (event: Event) => {
  try {
    // Create a new window for the printable content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Erro",
        description: "Não foi possível abrir a janela de impressão",
        variant: "destructive"
      });
      return;
    }
    
    // Build the content
    const completedTasks = event.tasks.filter(task => task.completed);
    const progress = event.tasks.length > 0 
      ? Math.round((completedTasks.length / event.tasks.length) * 100) 
      : 0;
      
    const content = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório do Evento - ${event.title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 10px;
            border-bottom: 1px solid #ccc;
          }
          .event-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .event-date {
            font-size: 16px;
            color: #666;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #eee;
          }
          .event-details p {
            margin: 5px 0;
          }
          .progress-container {
            width: 100%;
            background-color: #f1f1f1;
            margin: 10px 0;
            height: 20px;
            border-radius: 5px;
          }
          .progress-bar {
            height: 20px;
            background-color: #4caf50;
            border-radius: 5px;
            text-align: center;
            line-height: 20px;
            color: white;
          }
          .task-list {
            list-style-type: none;
            padding: 0;
          }
          .task-item {
            padding: 8px 0;
            border-bottom: 1px solid #eee;
            display: flex;
            align-items: center;
          }
          .task-status {
            margin-right: 10px;
            font-weight: bold;
          }
          .task-completed {
            color: green;
          }
          .task-pending {
            color: orange;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          @media print {
            body {
              padding: 0;
            }
            .print-button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="event-title">CALENDÁRIO DE EVENTOS - MKT</div>
          <div class="event-date">Relatório gerado em ${format(new Date(), 'PPP', { locale: ptBR })}</div>
        </div>
        
        <div class="section">
          <div class="section-title">Detalhes do Evento</div>
          <div class="event-details">
            <p><strong>Título:</strong> ${event.title}</p>
            <p><strong>Data:</strong> ${format(new Date(event.date), 'PPP', { locale: ptBR })}</p>
            ${event.company ? `<p><strong>Empresa:</strong> ${event.company}</p>` : ''}
            ${event.description ? `<p><strong>Descrição:</strong> ${event.description}</p>` : ''}
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Progresso das Tarefas</div>
          <p>${completedTasks.length} de ${event.tasks.length} tarefas concluídas (${progress}%)</p>
          <div class="progress-container">
            <div class="progress-bar" style="width: ${progress}%">${progress}%</div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Lista de Tarefas</div>
          <ul class="task-list">
            ${event.tasks.map(task => `
              <li class="task-item">
                <span class="task-status ${task.completed ? 'task-completed' : 'task-pending'}">
                  ${task.completed ? '✓' : '○'}
                </span>
                <span>${task.title}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        
        <div class="footer">
          <p>CALENDÁRIO DE EVENTOS - MKT • Relatório de Evento</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <button class="print-button" onclick="window.print(); window.close();" style="padding: 10px 20px; background-color: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Imprimir / Salvar como PDF
          </button>
        </div>
      </body>
      </html>
    `;
    
    // Write the content to the new window and prepare for printing
    printWindow.document.write(content);
    printWindow.document.close();
    
    toast({
      title: "Relatório gerado",
      description: "Prepare-se para imprimir ou salvar como PDF"
    });
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast({
      title: "Erro",
      description: "Erro ao gerar o relatório",
      variant: "destructive"
    });
  }
};

export const generateMonthlyReport = async (events: Event[], month: Date) => {
  try {
    const monthName = format(month, 'MMMM yyyy', { locale: ptBR });
    
    // Create a new window for the printable content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Erro",
        description: "Não foi possível abrir a janela de impressão",
        variant: "destructive"
      });
      return;
    }
    
    // Filter events for the selected month
    const monthEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === month.getMonth() && 
             eventDate.getFullYear() === month.getFullYear();
    });
    
    // Count completed tasks
    let totalTasks = 0;
    let completedTasks = 0;
    
    monthEvents.forEach(event => {
      totalTasks += event.tasks.length;
      completedTasks += event.tasks.filter(task => task.completed).length;
    });
    
    const progress = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;
      
    // Build the content
    const content = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório Mensal - ${monthName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 10px;
            border-bottom: 1px solid #ccc;
          }
          .report-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .report-date {
            font-size: 18px;
            color: #666;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .report-subtitle {
            font-size: 16px;
            color: #666;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #eee;
          }
          .progress-container {
            width: 100%;
            background-color: #f1f1f1;
            margin: 10px 0;
            height: 20px;
            border-radius: 5px;
          }
          .progress-bar {
            height: 20px;
            background-color: #4caf50;
            border-radius: 5px;
            text-align: center;
            line-height: 20px;
            color: white;
          }
          .event-list {
            list-style-type: none;
            padding: 0;
          }
          .event-item {
            padding: 15px;
            margin-bottom: 15px;
            border: 1px solid #eee;
            border-radius: 5px;
            background-color: #f9f9f9;
          }
          .event-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .event-date {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
          }
          .task-list {
            list-style-type: none;
            padding-left: 20px;
          }
          .task-item {
            padding: 5px 0;
            border-bottom: 1px solid #eee;
            display: flex;
            align-items: center;
          }
          .task-status {
            margin-right: 10px;
            font-weight: bold;
          }
          .task-completed {
            color: green;
          }
          .task-pending {
            color: orange;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .summary-stats {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            text-align: center;
          }
          .stat-box {
            flex: 1;
            padding: 15px;
            border: 1px solid #eee;
            border-radius: 5px;
            margin: 0 5px;
            background-color: #f9f9f9;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #333;
          }
          .stat-label {
            font-size: 14px;
            color: #666;
          }
          @media print {
            body {
              padding: 0;
            }
            .print-button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="report-title">CALENDÁRIO DE EVENTOS - MKT</div>
          <div class="report-date">Relatório Mensal: ${monthName}</div>
          <div class="report-subtitle">Gerado em ${format(new Date(), 'PPP', { locale: ptBR })}</div>
        </div>
        
        <div class="section">
          <div class="section-title">Resumo do Mês</div>
          
          <div class="summary-stats">
            <div class="stat-box">
              <div class="stat-value">${monthEvents.length}</div>
              <div class="stat-label">Eventos</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${totalTasks}</div>
              <div class="stat-label">Tarefas Totais</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${completedTasks}</div>
              <div class="stat-label">Tarefas Concluídas</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${progress}%</div>
              <div class="stat-label">Progresso</div>
            </div>
          </div>
          
          <div class="progress-container">
            <div class="progress-bar" style="width: ${progress}%">${progress}%</div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Eventos do Mês</div>
          
          ${monthEvents.length > 0 ? `
            <ul class="event-list">
              ${monthEvents.map(event => {
                const eventCompletedTasks = event.tasks.filter(task => task.completed).length;
                const eventProgress = event.tasks.length > 0 
                  ? Math.round((eventCompletedTasks / event.tasks.length) * 100) 
                  : 0;
                  
                return `
                  <li class="event-item">
                    <div class="event-title">${event.title}</div>
                    <div class="event-date">${format(new Date(event.date), 'PPP', { locale: ptBR })}</div>
                    
                    <p><strong>Progresso:</strong> ${eventCompletedTasks} de ${event.tasks.length} tarefas concluídas (${eventProgress}%)</p>
                    <div class="progress-container">
                      <div class="progress-bar" style="width: ${eventProgress}%">${eventProgress}%</div>
                    </div>
                    
                    ${event.tasks.length > 0 ? `
                      <div style="margin-top: 10px;"><strong>Tarefas:</strong></div>
                      <ul class="task-list">
                        ${event.tasks.map(task => `
                          <li class="task-item">
                            <span class="task-status ${task.completed ? 'task-completed' : 'task-pending'}">
                              ${task.completed ? '✓' : '○'}
                            </span>
                            <span>${task.title}</span>
                          </li>
                        `).join('')}
                      </ul>
                    ` : '<p>Nenhuma tarefa cadastrada</p>'}
                  </li>
                `;
              }).join('')}
            </ul>
          ` : '<p>Nenhum evento encontrado para este mês.</p>'}
        </div>
        
        <div class="footer">
          <p>CALENDÁRIO DE EVENTOS - MKT • Relatório Mensal</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <button class="print-button" onclick="window.print(); window.close();" style="padding: 10px 20px; background-color: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Imprimir / Salvar como PDF
          </button>
        </div>
      </body>
      </html>
    `;
    
    // Write the content to the new window and prepare for printing
    printWindow.document.write(content);
    printWindow.document.close();
    
    toast({
      title: "Relatório mensal gerado",
      description: "Prepare-se para imprimir ou salvar como PDF"
    });
    
  } catch (error) {
    console.error('Error generating monthly report:', error);
    toast({
      title: "Erro",
      description: "Erro ao gerar o relatório mensal",
      variant: "destructive"
    });
  }
};
