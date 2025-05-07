
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Printer, Calendar, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function PaymentReportModal() {
  const [open, setOpen] = useState(false);
  const [reportPeriod, setReportPeriod] = useState("week");
  const [reportTab, setReportTab] = useState("summary");
  
  const handleGenerateReport = () => {
    toast.success(`Relatório ${reportPeriod === 'week' ? 'semanal' : reportPeriod === 'month' ? 'mensal' : 'anual'} gerado com sucesso!`);
    // In a real application, this would generate and download a report
  };
  
  const handlePrintReport = () => {
    toast.success("Enviando para impressão...");
    // In a real application, this would print the report
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Relatório
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Relatório de Pagamentos</DialogTitle>
          <DialogDescription>
            Selecione o período e formato do relatório
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Relatório Semanal</SelectItem>
                  <SelectItem value="month">Relatório Mensal</SelectItem>
                  <SelectItem value="year">Relatório Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Tabs value={reportTab} onValueChange={setReportTab}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="summary">Resumo</TabsTrigger>
              <TabsTrigger value="details">Detalhado</TabsTrigger>
              <TabsTrigger value="chart">Gráfico</TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="space-y-4 py-4">
              <div className="text-center">
                <h3 className="text-lg font-medium">Resumo de Pagamentos</h3>
                <p className="text-sm text-muted-foreground">
                  {reportPeriod === 'week' ? 'Últimos 7 dias' : reportPeriod === 'month' ? 'Últimos 30 dias' : 'Últimos 12 meses'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded p-4">
                  <div className="text-sm text-muted-foreground">Total de Pagamentos</div>
                  <div className="text-2xl font-bold">42</div>
                </div>
                <div className="border rounded p-4">
                  <div className="text-sm text-muted-foreground">Valor Total</div>
                  <div className="text-2xl font-bold">R$ 3.850,00</div>
                </div>
                <div className="border rounded p-4">
                  <div className="text-sm text-muted-foreground">Pagos</div>
                  <div className="text-2xl font-bold text-green-600">38</div>
                </div>
                <div className="border rounded p-4">
                  <div className="text-sm text-muted-foreground">Pendentes</div>
                  <div className="text-2xl font-bold text-amber-600">4</div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="details" className="space-y-4 py-4">
              <div className="text-center">
                <h3 className="text-lg font-medium">Detalhamento de Pagamentos</h3>
                <p className="text-sm text-muted-foreground">Visualize o detalhamento completo dos pagamentos</p>
              </div>
              <div className="text-muted-foreground text-center py-6">
                Pré-visualização do relatório detalhado estará disponível aqui
              </div>
            </TabsContent>
            <TabsContent value="chart" className="space-y-4 py-4">
              <div className="text-center">
                <h3 className="text-lg font-medium">Gráfico de Pagamentos</h3>
                <p className="text-sm text-muted-foreground">Visualização gráfica de tendências de pagamentos</p>
              </div>
              <div className="text-muted-foreground text-center py-6">
                Pré-visualização do gráfico estará disponível aqui
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="outline" onClick={handlePrintReport}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button className="bg-barber-gold hover:bg-barber-gold/80" onClick={handleGenerateReport}>
            <Download className="mr-2 h-4 w-4" />
            Baixar Relatório
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
