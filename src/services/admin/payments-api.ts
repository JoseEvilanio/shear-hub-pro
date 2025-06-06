import { supabase } from '@/integrations/supabase/client';
import { PaymentStats } from '@/types/admin';

export const paymentsAdminApi = {
  // Fetch payments
  async getPayments(): Promise<PaymentStats[]> {
    // 1. Fetch all payments
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('id, barbershop_id, amount, status, processed_at, payment_method, invoice_url');

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      return [];
    }
    if (!payments || payments.length === 0) {
      return [];
    }

    // 2. Extract all unique barbershop_id's
    const uniqueBarbershopIds = Array.from(
      new Set(payments.map(p => p.barbershop_id).filter(id => id !== null && id !== undefined))
    );

    let barbershopMap = new Map<string, string>();

    // 3. Fetch all barbershops whose IDs are in the extracted list
    if (uniqueBarbershopIds.length > 0) {
      const { data: barbershops, error: barbershopsError } = await supabase
        .from('barbershops')
        .select('id, name')
        .in('id', uniqueBarbershopIds);

      if (barbershopsError) {
        console.error('Error fetching barbershops:', barbershopsError);
        // Decide if you want to return payments without names or empty array
        // For now, we'll proceed and use 'Unknown' for names
      }

      // 4. Create a map of barbershop_id to barbershop_name
      if (barbershops) {
        barbershops.forEach(shop => {
          if (shop.id && shop.name) { // Ensure id and name are not null
            barbershopMap.set(shop.id.toString(), shop.name);
          }
        });
      }
    }

    // 5. Map payments data to PaymentStats structure
    const paymentStats: PaymentStats[] = payments.map(p => ({
      id: p.id,
      barbershop_id: p.barbershop_id || '',
      barbershop_name: barbershopMap.get(p.barbershop_id?.toString() || '') || 'Barbearia Desconhecida',
      amount: p.amount || 0,
      status: p.status || 'pending', // Usar um valor padrão se status for nulo
      // Ajustar para usar processed_at para a data
      payment_date: p.processed_at ? new Date(p.processed_at).toLocaleDateString('pt-BR') : 'Sem data',
      payment_method: p.payment_method || 'Desconhecido',
      invoice_url: p.invoice_url,
      // Adicionar outras propriedades conforme necessário, com valores padrão
    }));

    return paymentStats;
  }
};
