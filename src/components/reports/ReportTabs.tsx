
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "lucide-react";
import { RevenueChart } from "./RevenueChart";
import { ServicesChart } from "./ServicesChart";
import { BarbersChart } from "./BarbersChart";

interface ReportTabsProps {
  reportPeriod: string;
  revenueData: Array<{
    name: string;
    value: number;
  }>;
  serviceData: Array<{
    name: string;
    value: number;
  }>;
  barberData: Array<{
    name: string;
    value: number;
  }>;
}

export function ReportTabs({ 
  reportPeriod, 
  revenueData, 
  serviceData, 
  barberData 
}: ReportTabsProps) {
  return (
    <Tabs defaultValue="revenue" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="revenue">
          <LineChart className="h-4 w-4 mr-2" />
          Faturamento
        </TabsTrigger>
        <TabsTrigger value="services">
          <BarChart className="h-4 w-4 mr-2" />
          Serviços
        </TabsTrigger>
        <TabsTrigger value="barbers">
          <PieChart className="h-4 w-4 mr-2" />
          Barbeiros
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="revenue">
        <RevenueChart data={revenueData} period={reportPeriod} />
      </TabsContent>
      
      <TabsContent value="services">
        <ServicesChart data={serviceData} />
      </TabsContent>
      
      <TabsContent value="barbers">
        <BarbersChart data={barberData} />
      </TabsContent>
    </Tabs>
  );
}
