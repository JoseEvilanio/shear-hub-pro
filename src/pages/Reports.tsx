
import { useState } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { mockReports } from "@/data/mock-reports";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { ReportSummaryCards } from "@/components/reports/ReportSummaryCards";
import { ReportTabs } from "@/components/reports/ReportTabs";

const Reports = () => {
  // State for the report period
  const [reportPeriod, setReportPeriod] = useState("month");
  
  // Function to handle period change
  const handlePeriodChange = (period: string) => {
    setReportPeriod(period);
    toast.success(`Relatório alterado para ${
      period === 'week' ? 'semanal' : 
      period === 'month' ? 'mensal' : 
      period === 'quarter' ? 'trimestral' : 'anual'
    }`);
  };
  
  // Function to handle report download
  const handleDownloadReport = () => {
    toast.success(`Relatório ${
      reportPeriod === 'week' ? 'semanal' : 
      reportPeriod === 'month' ? 'mensal' : 
      reportPeriod === 'quarter' ? 'trimestral' : 'anual'
    } baixado com sucesso!`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ReportHeader 
          onPeriodChange={handlePeriodChange} 
          onDownload={handleDownloadReport} 
        />

        <ReportSummaryCards 
          reportPeriod={reportPeriod}
          revenueData={{
            value: mockReports.monthlyRevenue,
            change: mockReports.revenueChange
          }}
          appointmentsData={{
            value: mockReports.totalAppointments,
            change: mockReports.appointmentsChange
          }}
          clientsData={{
            value: mockReports.newClients,
            change: mockReports.clientsChange
          }}
          ticketData={{
            value: mockReports.averageTicket,
            change: mockReports.ticketChange
          }}
        />

        <ReportTabs 
          reportPeriod={reportPeriod}
          revenueData={mockReports.revenueData}
          serviceData={mockReports.serviceData}
          barberData={mockReports.barberData}
        />
      </div>
    </DashboardLayout>
  );
};

export default Reports;
