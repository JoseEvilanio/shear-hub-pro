
import { supabase } from '@/integrations/supabase/client';

export const appointmentsAdminApi = {
  // Função para obter todos os agendamentos
  async getAppointments() {
    const { data, error } = await supabase
      .from('appointments')
      .select('*');
      
    if (error) {
      console.error('Erro ao buscar agendamentos:', error);
      return [];
    }
    
    return data || [];
  },
  
  // Função para criar um novo agendamento
  async createAppointment(appointmentData: {
    client_id?: string;
    client_name: string;
    service_id: string;
    barber_id: string;
    date: string;
    time: string;
    status: string;
    payment_status: string;
  }) {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();
      
    if (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
    
    return data;
  },
  
  // Função para atualizar o status de um agendamento
  async updateAppointmentStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Erro ao atualizar status do agendamento:', error);
      throw error;
    }
    
    return data;
  }
};
