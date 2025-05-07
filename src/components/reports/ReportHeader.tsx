
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ReportPeriodSelector } from "./report-period-selector";

interface ReportHeaderProps {
  onPeriodChange: (period: string) => void;
  onDownload: () => void;
}

export function ReportHeader({ onPeriodChange, onDownload }: ReportHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <p className="text-muted-foreground">
          Análise de desempenho e estatísticas da sua barbearia
        </p>
      </div>
      <div className="flex space-x-2">
        <ReportPeriodSelector onPeriodChange={onPeriodChange} />
        <Button variant="outline" onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>
    </div>
  );
}
