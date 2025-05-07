
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PeriodSelectorProps {
  periodFilter: string;
  setPeriodFilter: (value: string) => void;
}

export function PeriodSelector({ periodFilter, setPeriodFilter }: PeriodSelectorProps) {
  return (
    <Select value={periodFilter} onValueChange={setPeriodFilter}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Selecione o período" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="month">Este mês</SelectItem>
        <SelectItem value="quarter">Este trimestre</SelectItem>
        <SelectItem value="year">Este ano</SelectItem>
        <SelectItem value="all">Todo período</SelectItem>
      </SelectContent>
    </Select>
  );
}
