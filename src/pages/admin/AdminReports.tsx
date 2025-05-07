
import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ReportHeader } from '@/components/admin/reports/ReportHeader';
import { ReportTabs } from '@/components/admin/reports/ReportCharts';
import { mockAdminReports } from '@/data/mock-admin-reports';

export default function AdminReports() {
  const [periodFilter, setPeriodFilter] = useState('year');
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <ReportHeader 
          periodFilter={periodFilter} 
          setPeriodFilter={setPeriodFilter} 
        />
        
        <ReportTabs 
          revenueData={mockAdminReports.revenueData}
          appointmentsData={mockAdminReports.appointmentsData}
          userTypesData={mockAdminReports.userTypesData}
          barbershopStatusData={mockAdminReports.barbershopStatusData}
        />
      </div>
    </AdminLayout>
  );
}
