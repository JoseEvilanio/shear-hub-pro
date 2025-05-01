
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { BarberAddModal } from "@/components/barbers/barber-add-modal";
import { BarberViewScheduleModal } from "@/components/barbers/barber-view-schedule-modal";
import { BarberMetrics } from "@/components/barbers/barber-metrics";
import { BarberCardView } from "@/components/barbers/barber-card-view";
import { BarberTableView } from "@/components/barbers/barber-table-view";
import { mockBarbers } from "@/data/mock-barbers";

const Barbers = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<any>(null);

  const handleOpenSchedule = (barber: any) => {
    setSelectedBarber(barber);
    setIsScheduleModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Barbeiros</h2>
            <p className="text-muted-foreground">
              Gerencie os barbeiros cadastrados em sua barbearia
            </p>
          </div>
          <Button className="bg-barber-gold hover:bg-barber-gold/80" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Barbeiro
          </Button>
        </div>

        <BarberMetrics barbers={mockBarbers} />

        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="table">Tabela</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cards" className="space-y-4">
            <BarberCardView barbers={mockBarbers} onOpenSchedule={handleOpenSchedule} />
          </TabsContent>
          
          <TabsContent value="table">
            <BarberTableView barbers={mockBarbers} onOpenSchedule={handleOpenSchedule} />
          </TabsContent>
        </Tabs>
      </div>

      <BarberAddModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      <BarberViewScheduleModal 
        isOpen={isScheduleModalOpen} 
        onClose={() => setIsScheduleModalOpen(false)} 
        barber={selectedBarber}
      />
    </DashboardLayout>
  );
};

export default Barbers;
