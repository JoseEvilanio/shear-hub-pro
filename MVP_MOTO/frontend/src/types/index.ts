// Tipos principais do sistema
// Sistema de Gestão de Oficina Mecânica de Motos

// Tipos de usuário e autenticação
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'manager' | 'operator' | 'mechanic';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

// Tipos de cliente
export interface Client {
  id: string;
  name: string;
  cpf?: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  address?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tipos de veículo
export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year?: number;
  color?: string;
  engineSize?: string;
  fuelType?: string;
  clientId: string;
  client?: Client;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tipos de produto
export interface Product {
  id: string;
  code: string;
  barcode?: string;
  name: string;
  description?: string;
  type: 'product' | 'service';
  price: number;
  cost?: number;
  stockQuantity: number;
  minStock: number;
  maxStock?: number;
  unit: string;
  category?: string;
  brand?: string;
  imageUrl?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tipos de ordem de serviço
export interface ServiceOrder {
  id: string;
  number: string;
  clientId: string;
  client?: Client;
  vehicleId: string;
  vehicle?: Vehicle;
  mechanicId?: string;
  mechanic?: Mechanic;
  userId?: string;
  user?: User;
  descriptionLine1?: string;
  descriptionLine2?: string;
  descriptionLine3?: string;
  descriptionLine4?: string;
  descriptionLine5?: string;
  descriptionLine6?: string;
  descriptionLine7?: string;
  descriptionLine8?: string;
  descriptionLine9?: string;
  status: ServiceOrderStatus;
  priority: 1 | 2 | 3;
  laborAmount: number;
  partsAmount: number;
  discountAmount: number;
  totalAmount: number;
  scheduledDate?: string;
  startedAt?: string;
  completedAt?: string;
  deliveredAt?: string;
  internalNotes?: string;
  customerNotes?: string;
  items?: ServiceOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export type ServiceOrderStatus = 
  | 'pending' 
  | 'in_progress' 
  | 'waiting_parts' 
  | 'completed' 
  | 'delivered' 
  | 'cancelled';

export interface ServiceOrderItem {
  id: string;
  serviceOrderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  totalPrice: number;
  notes?: string;
  createdAt: string;
}

// Tipos de venda
export interface Sale {
  id: string;
  number: string;
  clientId?: string;
  client?: Client;
  userId: string;
  user?: User;
  type: 'sale' | 'quote';
  status: 'pending' | 'completed' | 'cancelled';
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod?: PaymentMethod;
  installments: number;
  paid: boolean;
  paidAmount: number;
  saleDate: string;
  dueDate?: string;
  notes?: string;
  internalNotes?: string;
  items?: SaleItem[];
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'cash' | 'card' | 'pix' | 'installment';

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  totalPrice: number;
  notes?: string;
  createdAt: string;
}

// Tipos de mecânico
export interface Mechanic {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  specialties: string[];
  hourlyRate?: number;
  commissionRate: number;
  active: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos de fornecedor
export interface Supplier {
  id: string;
  name: string;
  cnpj?: string;
  phone?: string;
  email?: string;
  address?: string;
  contactPerson?: string;
  paymentTerms?: string;
  category?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tipos de relatório
export interface ReportData {
  summary: Record<string, any>;
  data: any[];
}

export interface DashboardData {
  financial: {
    monthly: {
      sales: { totalSales: number; totalAmount: number };
      netCashFlow: number;
      netResult: number;
      overdueReceivable: number;
      overduePayable: number;
    };
    yearly: {
      sales: { totalSales: number; totalAmount: number };
      netCashFlow: number;
      netResult: number;
    };
  };
  inventory: {
    lowStockProducts: number;
    outOfStockProducts: number;
    totalInventoryValue: number;
    lowStockItems: Product[];
  };
  clients: {
    birthdaysThisMonth: number;
    upcomingBirthdays: Client[];
  };
}

// Tipos de API
export interface ApiResponse<T = any> {
  message: string;
  data: T;
}

export interface ApiError {
  error: string;
  code: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Tipos de componentes
export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  options?: { value: string | number; label: string }[];
  validation?: Record<string, any>;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
}

// Tipos de estado global
export interface RootState {
  auth: AuthState;
  ui: UIState;
}

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  loading: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  createdAt: string;
}

// Tipos de configuração
export interface AppConfig {
  apiBaseUrl: string;
  appName: string;
  version: string;
  features: {
    darkMode: boolean;
    notifications: boolean;
    analytics: boolean;
  };
}

// Tipos de permissão
export type Permission = 
  | 'users:create' | 'users:read' | 'users:update' | 'users:delete'
  | 'clients:create' | 'clients:read' | 'clients:update' | 'clients:delete'
  | 'vehicles:create' | 'vehicles:read' | 'vehicles:update' | 'vehicles:delete'
  | 'products:create' | 'products:read' | 'products:update' | 'products:delete'
  | 'service_orders:create' | 'service_orders:read' | 'service_orders:update' | 'service_orders:delete'
  | 'sales:create' | 'sales:read' | 'sales:update' | 'sales:delete'
  | 'inventory:create' | 'inventory:read' | 'inventory:update' | 'inventory:delete'
  | 'financial:create' | 'financial:read' | 'financial:update' | 'financial:delete'
  | 'reports:read'
  | 'config:read' | 'config:update';

export interface UserPermissions {
  role: UserRole;
  permissions: Permission[];
}