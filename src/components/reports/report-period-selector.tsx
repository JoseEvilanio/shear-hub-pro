
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Calendar } from "lucide-react";

interface ReportPeriodSelectorProps {
  onPeriodChange: (period: string) => void;
}

export function ReportPeriodSelector({ onPeriodChange }: ReportPeriodSelectorProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    onPeriodChange(value);
  };

  return (
    <div className="flex space-x-2">
      <Select 
        value={selectedPeriod} 
        onValueChange={handlePeriodChange}
      >
        <SelectTrigger className="w-[180px]">
          <Calendar className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Selecione o período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="week">Esta semana</SelectItem>
          <SelectItem value="month">Este mês</SelectItem>
          <SelectItem value="quarter">Este trimestre</SelectItem>
          <SelectItem value="year">Este ano</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
