
export interface BarbershopStats {
  id: string;
  name: string;
  city: string;
  status: 'active' | 'inactive' | 'blocked';
  payment_status: 'active' | 'late' | 'blocked';
  clientCount: number;
  barberCount: number;
  appointmentCount: number;
  revenue: number;
  next_payment_date?: string;
}

export interface UserStats {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'client' | 'barber' | 'owner' | 'admin' | 'superuser';
  created_at: string;
  appointmentCount: number;
  avatar_url?: string;
}

export interface PaymentStats {
  id: string;
  barbershop_id: string;
  barbershop_name: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_date: string;
  payment_method?: string;
  invoice_url?: string;
}

export interface AppStats {
  total_barbershops: number;
  active_barbershops: number;
  blocked_barbershops: number;
  total_clients: number;
  total_barbers: number;
  total_appointments: number;
  total_revenue: number;
  monthly_revenue: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  description?: string;
  features?: Record<string, any>;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_email?: string;
  action: string;
  target_type: string;
  target_id: string;
  metadata?: Record<string, any>;
  created_at: string;
}
