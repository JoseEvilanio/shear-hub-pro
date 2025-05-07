
import { Button } from '@/components/ui/button';
import { DownloadIcon } from 'lucide-react';
import { PeriodSelector } from './PeriodSelector';

interface ReportHeaderProps {
  periodFilter: string;
  setPeriodFilter: (value: string) => void;
}

export function ReportHeader({ periodFilter, setPeriodFilter }: ReportHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <p className="text-muted-foreground">
          Análise de dados e estatísticas
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <PeriodSelector 
          periodFilter={periodFilter} 
          setPeriodFilter={setPeriodFilter} 
        />
        
        <Button variant="outline" className="flex items-center gap-2">
          <DownloadIcon className="h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>
    </div>
  );
}
