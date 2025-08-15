import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './index.css';

// Ícones SVG personalizados
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  Package: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Motorcycle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Tool: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  ShoppingCart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="20" cy="19" r="1" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  X: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Bell: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.07 2.82l3.93 3.93-3.93 3.93-3.93-3.93 3.93-3.93z" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  CreditCard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  Cash: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  TrendingDown: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  )
};

// Modal profissional inspirado no Untitled UI
const Modal = ({ isOpen, onClose, title, children, size = 'md' }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
    '2xl': 'sm:max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className={`relative transform overflow-hidden rounded-xl bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full ${sizeClasses[size]} sm:p-6 max-h-[90vh] overflow-y-auto`}>
          <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block z-10 bg-white">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={onClose}
            >
              <span className="sr-only">Fechar</span>
              <Icons.X />
            </button>
          </div>
          
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:ml-0 sm:mt-0 sm:text-left w-full">
              <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-6 pr-8">
                {title}
              </h3>
              <div className="mt-2">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Formulário profissional de Cliente
const ClientForm = ({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (data: any) => void;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    cpf: '',
    birthDate: '',
    address: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">Informações Básicas</h4>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome completo *
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Digite o nome completo"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            />
          </div>
          
          <div>
            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
              CPF
            </label>
            <input
              type="text"
              name="cpf"
              id="cpf"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefone *
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="cliente@email.com"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
              Data de nascimento
            </label>
            <input
              type="date"
              name="birthDate"
              id="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            />
          </div>
          
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Endereço
            </label>
            <input
              type="text"
              name="address"
              id="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Rua, número, bairro"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            name="notes"
            id="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Informações adicionais sobre o cliente..."
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
          />
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Icons.Plus />
          <span className="ml-2">Salvar Cliente</span>
        </button>
      </div>
    </form>
  );
};

// Layout profissional inspirado no Untitled UI
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Icons.Dashboard, badge: null },
    { path: '/clients', label: 'Clientes', icon: Icons.Users, badge: null },
    { path: '/products', label: 'Produtos', icon: Icons.Package, badge: 'Novo' },
    { path: '/services', label: 'Serviços', icon: Icons.Tool, badge: null },
    { path: '/vehicles', label: 'Veículos', icon: Icons.Motorcycle, badge: null },
    { path: '/service-orders', label: 'Ordens de Serviço', icon: Icons.Tool, badge: '3' },
    { path: '/sales', label: 'Vendas', icon: Icons.ShoppingCart, badge: null },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar para mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between px-4">
              <div className="flex items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                  <Icons.Motorcycle className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-lg font-semibold text-gray-900">MotoTech</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-500">
                <Icons.X />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setSidebarOpen(false);
                    }}
                    className={`${
                      isActive(item.path)
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex w-full items-center rounded-lg border-l-4 py-2 pl-3 pr-4 text-sm font-medium`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                    {item.badge && (
                      <span className="ml-auto inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Sidebar para desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                <Icons.Motorcycle className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900">MotoTech Pro</span>
            </div>
            <nav className="mt-8 flex-1 space-y-1 px-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`${
                      isActive(item.path)
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex w-full items-center rounded-lg border-l-4 py-2 pl-3 pr-4 text-sm font-medium transition-colors duration-150`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                    {item.badge && (
                      <span className={`ml-auto inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.badge === 'Novo' ? 'bg-green-100 text-green-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* User section */}
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <div className="group block w-full flex-shrink-0">
              <div className="flex items-center">
                <div className="inline-block h-9 w-9 rounded-full bg-indigo-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">AD</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">Administrador</p>
                  <p className="text-xs font-medium text-gray-500">admin@mototech.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white shadow-sm">
          <button
            type="button"
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Abrir sidebar</span>
            <Icons.Menu />
          </button>
          
          <div className="flex flex-1 justify-end px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                type="button"
                className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="sr-only">Ver notificações</span>
                <Icons.Bell className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// Componente para processar pagamento da Ordem de Serviço
const ServiceOrderPayment = ({ order, onClose, onPayment }: {
  order: any;
  onClose: () => void;
  onPayment: (paymentData: any) => void;
}) => {
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'money',
    installments: '1',
    discount: '',
    paidAmount: order.totalValue.toFixed(2),
    changeAmount: '0.00',
    notes: ''
  });

  const paymentMethods = [
    { value: 'money', label: '💵 Dinheiro', icon: Icons.Cash },
    { value: 'card', label: '💳 Cartão de Crédito/Débito', icon: Icons.CreditCard },
    { value: 'pix', label: '📱 PIX', icon: Icons.Bell },
    { value: 'transfer', label: '🏦 Transferência', icon: Icons.Bell },
    { value: 'check', label: '📄 Cheque', icon: Icons.Bell }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalAmount = calculateFinalAmount();
    const changeAmount = paymentData.paymentMethod === 'money' ? 
      Math.max(0, parseFloat(paymentData.paidAmount) - finalAmount) : 0;

    const payment = {
      orderId: order.id,
      originalAmount: order.totalValue,
      discount: parseFloat(paymentData.discount) || 0,
      finalAmount: finalAmount,
      paymentMethod: paymentData.paymentMethod,
      installments: parseInt(paymentData.installments) || 1,
      paidAmount: parseFloat(paymentData.paidAmount) || 0,
      changeAmount: changeAmount,
      notes: paymentData.notes,
      paymentDate: new Date().toISOString(),
      paymentId: `PAY-${String(Date.now()).slice(-6)}`
    };

    onPayment(payment);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPaymentData({ ...paymentData, [name]: value });

    // Calcular troco automaticamente para dinheiro
    if (name === 'paidAmount' && paymentData.paymentMethod === 'money') {
      const finalAmount = calculateFinalAmount();
      const change = Math.max(0, parseFloat(value) - finalAmount);
      setPaymentData(prev => ({ ...prev, [name]: value, changeAmount: change.toFixed(2) }));
    }
  };

  const calculateFinalAmount = () => {
    const discount = parseFloat(paymentData.discount) || 0;
    return Math.round(order.totalValue * (1 - discount / 100) * 100) / 100;
  };

  const calculateInstallmentValue = () => {
    const installments = parseInt(paymentData.installments) || 1;
    return calculateFinalAmount() / installments;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <Icons.CreditCard className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-medium text-green-900">Pagamento da OS {order.id}</h3>
        </div>
        <p className="mt-1 text-sm text-green-700">Processe o pagamento da ordem de serviço.</p>
      </div>

      {/* Resumo da OS */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">📋 Resumo da Ordem</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Cliente:</span>
            <span className="ml-2 font-medium">{order.clientName}</span>
          </div>
          <div>
            <span className="text-gray-600">Veículo:</span>
            <span className="ml-2 font-medium">{order.vehicleInfo}</span>
          </div>
          <div>
            <span className="text-gray-600">Serviços:</span>
            <span className="ml-2 font-medium">{order.services.length} item(s)</span>
          </div>
          <div>
            <span className="text-gray-600">Peças:</span>
            <span className="ml-2 font-medium">{order.parts.length} item(s)</span>
          </div>
        </div>
      </div>

      {/* Valores */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-3">💰 Valores</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Valor original:</span>
            <span className="font-medium">R$ {order.totalValue.toFixed(2)}</span>
          </div>
          {parseFloat(paymentData.discount) > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Desconto ({paymentData.discount}%):</span>
              <span>- R$ {(order.totalValue * (parseFloat(paymentData.discount) / 100)).toFixed(2)}</span>
            </div>
          )}
          <div className="border-t pt-2">
            <div className="flex justify-between text-lg font-semibold">
              <span className="text-gray-900">Total a pagar:</span>
              <span className="text-blue-600">R$ {calculateFinalAmount().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desconto */}
      <div>
        <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
          🏷️ Desconto (%)
        </label>
        <input
          type="number"
          name="discount"
          id="discount"
          min="0"
          max="100"
          step="0.01"
          value={paymentData.discount}
          onChange={handleChange}
          placeholder="0"
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      {/* Forma de Pagamento */}
      <div>
        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
          💳 Forma de Pagamento *
        </label>
        <select
          name="paymentMethod"
          id="paymentMethod"
          required
          value={paymentData.paymentMethod}
          onChange={handleChange}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {paymentMethods.map(method => (
            <option key={method.value} value={method.value}>{method.label}</option>
          ))}
        </select>
      </div>

      {/* Parcelas (apenas para cartão) */}
      {paymentData.paymentMethod === 'card' && (
        <div>
          <label htmlFor="installments" className="block text-sm font-medium text-gray-700 mb-1">
            📊 Parcelas
          </label>
          <select
            name="installments"
            id="installments"
            value={paymentData.installments}
            onChange={handleChange}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {[1, 2, 3, 4, 5, 6, 10, 12].map(num => (
              <option key={num} value={num}>
                {num}x {num > 1 ? `de R$ ${calculateInstallmentValue().toFixed(2)}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Valor Pago (apenas para dinheiro) */}
      {paymentData.paymentMethod === 'money' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="paidAmount" className="block text-sm font-medium text-gray-700 mb-1">
              💵 Valor Recebido (R$) *
            </label>
            <input
              type="number"
              name="paidAmount"
              id="paidAmount"
              min="0"
              step="0.01"
              required
              value={paymentData.paidAmount}
              onChange={handleChange}
              placeholder="0,00"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="changeAmount" className="block text-sm font-medium text-gray-700 mb-1">
              💰 Troco (R$)
            </label>
            <input
              type="text"
              name="changeAmount"
              id="changeAmount"
              value={`R$ ${parseFloat(paymentData.changeAmount || '0').toFixed(2)}`}
              readOnly
              className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm sm:text-sm font-medium text-green-600"
            />
          </div>
        </div>
      )}

      {/* Observações */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          📝 Observações do Pagamento
        </label>
        <textarea
          name="notes"
          id="notes"
          rows={3}
          value={paymentData.notes}
          onChange={handleChange}
          placeholder="Observações sobre o pagamento..."
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      {/* Resumo Final */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h4 className="text-sm font-medium text-green-900 mb-3">✅ Confirmação do Pagamento</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Método:</span>
            <span className="font-medium">
              {paymentMethods.find(m => m.value === paymentData.paymentMethod)?.label}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Valor final:</span>
            <span className="font-medium">R$ {calculateFinalAmount().toFixed(2)}</span>
          </div>
          {paymentData.paymentMethod === 'card' && parseInt(paymentData.installments) > 1 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Parcelas:</span>
              <span className="font-medium">
                {paymentData.installments}x de R$ {calculateInstallmentValue().toFixed(2)}
              </span>
            </div>
          )}
          {paymentData.paymentMethod === 'money' && parseFloat(paymentData.changeAmount) > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Troco:</span>
              <span className="font-medium">R$ {parseFloat(paymentData.changeAmount).toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-lg border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          <Icons.CreditCard className="mr-2 h-4 w-4" />
          Processar Pagamento
        </button>
      </div>
    </form>
  );
};

// Componente para visualizar detalhes da Ordem de Serviço
const ServiceOrderDetails = ({ order }: { order: any }) => {
  const getStatusBadge = (status: string) => {
    const badges = {
      'Em andamento': { color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
      'Aguardando peças': { color: 'bg-orange-100 text-orange-800', icon: '🟠' },
      'Aguardando aprovação': { color: 'bg-blue-100 text-blue-800', icon: '🔵' },
      'Finalizada': { color: 'bg-green-100 text-green-800', icon: '🟢' },
      'Cancelada': { color: 'bg-red-100 text-red-800', icon: '🔴' }
    };
    return badges[status as keyof typeof badges] || badges['Em andamento'];
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      'low': { color: 'bg-green-100 text-green-800', label: '🟢 Baixa' },
      'normal': { color: 'bg-yellow-100 text-yellow-800', label: '🟡 Normal' },
      'high': { color: 'bg-orange-100 text-orange-800', label: '🟠 Alta' },
      'urgent': { color: 'bg-red-100 text-red-800', label: '🔴 Urgente' }
    };
    return badges[priority as keyof typeof badges] || badges['normal'];
  };

  const statusBadge = getStatusBadge(order.status);
  const priorityBadge = getPriorityBadge(order.priority);

  return (
    <div className="space-y-6">
      {/* Header com Status */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Ordem de Serviço {order.id}</h3>
            <p className="text-sm text-gray-600">Criada em {new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusBadge.color}`}>
              {statusBadge.icon} {order.status}
            </span>
            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${priorityBadge.color}`}>
              {priorityBadge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Informações do Cliente e Veículo */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-3">👤 Cliente</h4>
          <div className="space-y-2 text-sm">
            <div><strong>Nome:</strong> {order.clientName}</div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-green-900 mb-3">🏍️ Veículo</h4>
          <div className="space-y-2 text-sm">
            <div><strong>Modelo:</strong> {order.vehicleInfo}</div>
          </div>
        </div>
      </div>

      {/* Descrição do Problema */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-yellow-900 mb-3">📝 Descrição do Problema</h4>
        <p className="text-sm text-gray-700">{order.description}</p>
      </div>

      {/* Serviços Realizados */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">🔧 Serviços Realizados</h4>
        <div className="space-y-2">
          {order.services.map((service: string, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <Icons.Tool className="h-4 w-4 text-indigo-500" />
              <span className="text-sm text-gray-700">{service}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Peças Utilizadas */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">📦 Peças Utilizadas</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Peça</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qtd</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Preço Unit.</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.parts.map((part: any, index: number) => (
                <tr key={index}>
                  <td className="px-3 py-2 text-sm text-gray-900">{part.name}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{part.quantity}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">R$ {part.price.toFixed(2)}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">R$ {(part.quantity * part.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">💰 Resumo Financeiro</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Peças:</span>
            <span className="font-medium">R$ {order.parts.reduce((acc: number, part: any) => acc + (part.quantity * part.price), 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Mão de obra:</span>
            <span className="font-medium">R$ {order.laborCost.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between text-lg font-semibold">
              <span className="text-gray-900">Total:</span>
              <span className="text-indigo-600">R$ {order.totalValue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status de Pagamento */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">💳 Status de Pagamento</h4>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">Status:</span>
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
            order.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {order.paymentStatus === 'paid' ? '✅ Pago' :
             order.paymentStatus === 'partial' ? '🟡 Pagamento Parcial' :
             '❌ Pendente'}
          </span>
        </div>
        
        {order.payments && order.payments.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-gray-700">Histórico de Pagamentos:</h5>
            {order.payments.map((payment: any, index: number) => (
              <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                <div className="flex justify-between">
                  <span>Pagamento #{payment.paymentId}</span>
                  <span className="font-medium">R$ {payment.amount.toFixed(2)}</span>
                </div>
                <div className="text-gray-500">
                  {payment.method === 'money' ? '💵 Dinheiro' :
                   payment.method === 'card' ? '💳 Cartão' :
                   payment.method === 'pix' ? '📱 PIX' : payment.method} - 
                  {new Date(payment.date).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Informações Adicionais */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {order.estimatedCompletion && (
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-indigo-900 mb-2">📅 Previsão de Conclusão</h4>
            <p className="text-sm text-gray-700">{new Date(order.estimatedCompletion).toLocaleDateString('pt-BR')}</p>
          </div>
        )}

        {order.notes && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-purple-900 mb-2">📋 Observações</h4>
            <p className="text-sm text-gray-700">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para editar Ordem de Serviço
const EditServiceOrderForm = ({ order, onClose, onSubmit }: {
  order: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
}) => {
  const [formData, setFormData] = useState({
    ...order,
    estimatedCompletion: order.estimatedCompletion || '',
    notes: order.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Icons.Tool className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-blue-900">Editar Ordem de Serviço {order.id}</h3>
        </div>
        <p className="mt-1 text-sm text-blue-700">Atualize as informações da ordem de serviço.</p>
      </div>

      {/* Status e Prioridade */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            📊 Status *
          </label>
          <select
            name="status"
            id="status"
            required
            value={formData.status}
            onChange={handleChange}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="Em andamento">🟡 Em andamento</option>
            <option value="Aguardando peças">🟠 Aguardando peças</option>
            <option value="Aguardando aprovação">🔵 Aguardando aprovação</option>
            <option value="Finalizada">🟢 Finalizada</option>
            <option value="Cancelada">🔴 Cancelada</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            ⚡ Prioridade
          </label>
          <select
            name="priority"
            id="priority"
            value={formData.priority}
            onChange={handleChange}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="low">🟢 Baixa</option>
            <option value="normal">🟡 Normal</option>
            <option value="high">🟠 Alta</option>
            <option value="urgent">🔴 Urgente</option>
          </select>
        </div>
      </div>

      {/* Valores */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="laborCost" className="block text-sm font-medium text-gray-700 mb-1">
            💰 Mão de Obra (R$)
          </label>
          <input
            type="number"
            name="laborCost"
            id="laborCost"
            min="0"
            step="0.01"
            value={formData.laborCost || ''}
            onChange={handleChange}
            placeholder="0,00"
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="totalValue" className="block text-sm font-medium text-gray-700 mb-1">
            💵 Valor Total (R$)
          </label>
          <input
            type="number"
            name="totalValue"
            id="totalValue"
            min="0"
            step="0.01"
            value={formData.totalValue || ''}
            onChange={handleChange}
            placeholder="0,00"
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Previsão de Conclusão */}
      <div>
        <label htmlFor="estimatedCompletion" className="block text-sm font-medium text-gray-700 mb-1">
          📅 Previsão de Conclusão
        </label>
        <input
          type="date"
          name="estimatedCompletion"
          id="estimatedCompletion"
          value={formData.estimatedCompletion}
          onChange={handleChange}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      {/* Observações */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          📝 Observações
        </label>
        <textarea
          name="notes"
          id="notes"
          rows={4}
          value={formData.notes}
          onChange={handleChange}
          placeholder="Observações adicionais sobre a ordem de serviço..."
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      {/* Resumo Atual */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">📋 Resumo Atual</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Cliente:</span>
            <span className="ml-2 font-medium">{order.clientName}</span>
          </div>
          <div>
            <span className="text-gray-600">Veículo:</span>
            <span className="ml-2 font-medium">{order.vehicleInfo}</span>
          </div>
          <div>
            <span className="text-gray-600">Serviços:</span>
            <span className="ml-2 font-medium">{order.services.length} item(s)</span>
          </div>
          <div>
            <span className="text-gray-600">Peças:</span>
            <span className="ml-2 font-medium">{order.parts.length} item(s)</span>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Icons.Tool className="mr-2 h-4 w-4" />
          Atualizar Ordem
        </button>
      </div>
    </form>
  );
};

// Formulário profissional de Serviços
const ServiceForm = ({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (data: any) => void;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    estimatedTime: '',
    difficulty: 'normal',
    requirements: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const serviceData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      estimatedTime: parseInt(formData.estimatedTime) || 0,
      id: `SERV-${String(Date.now()).slice(-3)}`,
      createdAt: new Date().toISOString(),
      status: 'Ativo'
    };
    onSubmit(serviceData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const categories = [
    'Manutenção Preventiva',
    'Manutenção Corretiva',
    'Elétrica',
    'Motor',
    'Freios',
    'Suspensão',
    'Transmissão',
    'Carroceria',
    'Diagnóstico',
    'Outros'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Icons.Tool className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-blue-900">Informações do Serviço</h3>
          </div>
          <p className="mt-1 text-sm text-blue-700">Defina os detalhes básicos do serviço.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              🔧 Nome do Serviço *
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Troca de Óleo, Revisão Completa, Regulagem de Motor..."
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              📂 Categoria *
            </label>
            <select
              name="category"
              id="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              💰 Preço (R$) *
            </label>
            <input
              type="number"
              name="price"
              id="price"
              min="0"
              step="0.01"
              required
              value={formData.price || ''}
              onChange={handleChange}
              placeholder="0,00"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            📝 Descrição *
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            required
            value={formData.description}
            onChange={handleChange}
            placeholder="Descreva detalhadamente o que inclui este serviço..."
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Detalhes Técnicos */}
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Icons.Tool className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-medium text-yellow-900">Detalhes Técnicos</h3>
          </div>
          <p className="mt-1 text-sm text-yellow-700">Informações sobre execução e complexidade.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700 mb-1">
              ⏱️ Tempo Estimado (minutos)
            </label>
            <input
              type="number"
              name="estimatedTime"
              id="estimatedTime"
              min="0"
              value={formData.estimatedTime || ''}
              onChange={handleChange}
              placeholder="Ex: 60, 120, 180..."
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
              📊 Nível de Dificuldade
            </label>
            <select
              name="difficulty"
              id="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="easy">🟢 Fácil</option>
              <option value="normal">🟡 Normal</option>
              <option value="hard">🔴 Difícil</option>
              <option value="expert">⚫ Especialista</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
            🛠️ Ferramentas/Equipamentos Necessários
          </label>
          <textarea
            name="requirements"
            id="requirements"
            rows={2}
            value={formData.requirements}
            onChange={handleChange}
            placeholder="Ex: Chaves de fenda, multímetro, elevador hidráulico..."
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            📋 Observações Adicionais
          </label>
          <textarea
            name="notes"
            id="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Informações adicionais, cuidados especiais, garantias..."
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Icons.Plus className="mr-2 h-4 w-4" />
          Cadastrar Serviço
        </button>
      </div>
    </form>
  );
};

// Formulário profissional de Ordem de Serviço
const ServiceOrderForm = ({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (data: any) => void;
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    clientId: '',
    vehicleId: '',
    description: '',
    services: [{ serviceId: '', name: '', price: '', estimatedTime: '' }],
    parts: [{ productId: '', name: '', quantity: '1', price: '' }],
    laborCost: '',
    priority: 'normal',
    estimatedCompletion: '',
    notes: '',
    status: 'Em andamento'
  });

  // Mock data para clientes e veículos
  const clients = [
    { id: '1', name: 'João Silva', vehicles: [{ id: '1', model: 'Honda CG 160', plate: 'ABC-1234' }] },
    { id: '2', name: 'Maria Santos', vehicles: [{ id: '2', model: 'Yamaha YBR 125', plate: 'DEF-5678' }] },
    { id: '3', name: 'Carlos Lima', vehicles: [{ id: '3', model: 'Suzuki Intruder', plate: 'GHI-9012' }] }
  ];

  // Produtos disponíveis no estoque
  const products = [
    { id: 'PROD-001', name: 'Óleo Motul 20W50', price: 45.90, stock: 12, barcode: '7891234567890' },
    { id: 'PROD-002', name: 'Filtro de Ar Honda CG 160', price: 28.50, stock: 3, barcode: '7891234567891' },
    { id: 'PROD-003', name: 'Pastilha de Freio', price: 65.00, stock: 8, barcode: '7891234567892' },
    { id: 'PROD-004', name: 'Correia Dentada', price: 85.00, stock: 5, barcode: '7891234567893' },
    { id: 'PROD-005', name: 'Filtro de Óleo', price: 15.50, stock: 15, barcode: '7891234567894' },
    { id: 'PROD-006', name: 'Vela de Ignição NGK', price: 12.90, stock: 20, barcode: '7891234567895' }
  ];

  // Serviços disponíveis
  const availableServices = [
    { id: 'SERV-001', name: 'Troca de Óleo', price: 50.00, estimatedTime: 30, category: 'Manutenção Preventiva' },
    { id: 'SERV-002', name: 'Revisão Completa', price: 150.00, estimatedTime: 120, category: 'Manutenção Preventiva' },
    { id: 'SERV-003', name: 'Regulagem de Motor', price: 80.00, estimatedTime: 90, category: 'Motor' },
    { id: 'SERV-004', name: 'Troca de Pastilha de Freio', price: 60.00, estimatedTime: 45, category: 'Freios' },
    { id: 'SERV-005', name: 'Diagnóstico Elétrico', price: 100.00, estimatedTime: 60, category: 'Elétrica' },
    { id: 'SERV-006', name: 'Troca de Correia', price: 40.00, estimatedTime: 30, category: 'Transmissão' }
  ];

  const selectedClient = clients.find(c => c.id === formData.clientId);
  const availableVehicles = selectedClient ? selectedClient.vehicles : [];

  const steps = [
    { id: 1, name: 'Cliente & Veículo', icon: Icons.Users },
    { id: 2, name: 'Serviços & Peças', icon: Icons.Tool },
    { id: 3, name: 'Valores & Finalização', icon: Icons.ShoppingCart }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const laborCost = parseFloat(formData.laborCost) || 0;
    
    const servicesTotal = formData.services.reduce((acc, service) => {
      const price = parseFloat(service.price) || 0;
      return acc + price;
    }, 0);
    
    const partsTotal = formData.parts.reduce((acc, part) => {
      const quantity = parseFloat(part.quantity) || 0;
      const price = parseFloat(part.price) || 0;
      return acc + (price * quantity);
    }, 0);
    
    const totalValue = servicesTotal + partsTotal + laborCost;
    
    const orderData = {
      ...formData,
      laborCost: laborCost,
      services: formData.services.map(service => ({
        ...service,
        price: parseFloat(service.price) || 0
      })),
      parts: formData.parts.map(part => ({
        ...part,
        quantity: parseFloat(part.quantity) || 0,
        price: parseFloat(part.price) || 0
      })),
      id: `OS-${String(Date.now()).slice(-3)}`,
      status: 'Em andamento',
      createdAt: new Date().toISOString(),
      totalValue: totalValue
    };
    onSubmit(orderData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addService = () => {
    setFormData({ 
      ...formData, 
      services: [...formData.services, { serviceId: '', name: '', price: '', estimatedTime: '' }] 
    });
  };

  const updateService = (index: number, field: string, value: any) => {
    const newServices = [...formData.services];
    newServices[index] = { ...newServices[index], [field]: value };
    
    // Auto-fill data when service is selected
    if (field === 'serviceId' && value) {
      const selectedService = availableServices.find(service => service.id === value);
      if (selectedService) {
        newServices[index].name = selectedService.name;
        newServices[index].price = selectedService.price.toString();
        newServices[index].estimatedTime = selectedService.estimatedTime.toString();
      }
    }
    
    setFormData({ ...formData, services: newServices });
  };

  const removeService = (index: number) => {
    const newServices = formData.services.filter((_, i) => i !== index);
    setFormData({ ...formData, services: newServices });
  };

  const addPart = () => {
    setFormData({ 
      ...formData, 
      parts: [...formData.parts, { productId: '', name: '', quantity: '1', price: '' }] 
    });
  };

  const updatePart = (index: number, field: string, value: any) => {
    const newParts = [...formData.parts];
    newParts[index] = { ...newParts[index], [field]: value };
    
    // Auto-fill data when product is selected
    if (field === 'productId' && value) {
      const selectedProduct = products.find(product => product.id === value);
      if (selectedProduct) {
        newParts[index].name = selectedProduct.name;
        newParts[index].price = selectedProduct.price.toString();
      }
    }
    
    setFormData({ ...formData, parts: newParts });
  };

  const removePart = (index: number) => {
    const newParts = formData.parts.filter((_, i) => i !== index);
    setFormData({ ...formData, parts: newParts });
  };

  // Estado para pesquisa de produtos
  const [productSearch, setProductSearch] = useState('');
  
  // Função para filtrar produtos por nome ou código de barras
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.barcode.includes(productSearch) ||
    product.id.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Funções para calcular totais
  const calculateServicesTotal = () => {
    return formData.services.reduce((acc, service) => {
      const price = parseFloat(service.price) || 0;
      return acc + price;
    }, 0);
  };

  const calculatePartsTotal = () => {
    return formData.parts.reduce((acc, part) => {
      const quantity = parseFloat(part.quantity) || 0;
      const price = parseFloat(part.price) || 0;
      return acc + (price * quantity);
    }, 0);
  };

  const calculateTotalValue = () => {
    const servicesTotal = calculateServicesTotal();
    const partsTotal = calculatePartsTotal();
    const laborCost = parseFloat(formData.laborCost) || 0;
    return servicesTotal + partsTotal + laborCost;
  };

  const canProceedToStep2 = formData.clientId && formData.vehicleId && formData.description;
  const canProceedToStep3 = formData.services.some(s => s.serviceId) || formData.parts.some(p => p.productId);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, stepIdx) => {
            const StepIcon = step.icon;
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    currentStep >= step.id 
                      ? 'border-indigo-600 bg-indigo-600 text-white' 
                      : 'border-gray-300 bg-white text-gray-500'
                  }`}>
                    <StepIcon className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-indigo-600' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </p>
                  </div>
                </div>
                {stepIdx < steps.length - 1 && (
                  <div className={`ml-4 h-0.5 w-16 ${
                    currentStep > step.id ? 'bg-indigo-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Cliente e Veículo */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Icons.Users className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-blue-900">Informações do Cliente e Veículo</h3>
              </div>
              <p className="mt-1 text-sm text-blue-700">Selecione o cliente e o veículo para esta ordem de serviço.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
                    Cliente *
                  </label>
                  <select
                    name="clientId"
                    id="clientId"
                    required
                    value={formData.clientId}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-3"
                  >
                    <option value="">Selecione um cliente</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700 mb-2">
                    Veículo *
                  </label>
                  <select
                    name="vehicleId"
                    id="vehicleId"
                    required
                    value={formData.vehicleId}
                    onChange={handleChange}
                    disabled={!formData.clientId}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-3 disabled:bg-gray-100"
                  >
                    <option value="">Selecione um veículo</option>
                    {availableVehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.model} - {vehicle.plate}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição do Problema *
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={6}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descreva detalhadamente o problema relatado pelo cliente..."
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Serviços e Peças */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <Icons.Tool className="h-5 w-5 text-yellow-600 mr-2" />
                <h3 className="text-lg font-medium text-yellow-900">Serviços e Peças</h3>
              </div>
              <p className="mt-1 text-sm text-yellow-700">Defina os serviços a serem realizados e as peças necessárias.</p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Serviços */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-medium text-gray-900">Serviços a Realizar</h4>
                  <button
                    type="button"
                    onClick={addService}
                    className="inline-flex items-center px-3 py-1 text-sm text-indigo-600 hover:text-indigo-500 border border-indigo-300 rounded-md hover:bg-indigo-50"
                  >
                    <Icons.Plus className="mr-1 h-4 w-4" />
                    Adicionar
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.services.map((service, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Icons.Tool className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Serviço #{index + 1}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="p-1 text-red-600 hover:text-red-500 hover:bg-red-50 rounded-md"
                          title="Remover serviço"
                        >
                          <Icons.X className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          🔧 Serviço *
                        </label>
                        <select
                          value={service.serviceId}
                          onChange={(e) => updateService(index, 'serviceId', e.target.value)}
                          required
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        >
                          <option value="">Selecione um serviço</option>
                          {availableServices.map(availableService => (
                            <option key={availableService.id} value={availableService.id}>
                              {availableService.name} - R$ {availableService.price.toFixed(2)} ({availableService.estimatedTime}min)
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {service.serviceId && (
                        <div className="bg-blue-50 p-3 rounded-md">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Icons.Tool className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium text-blue-900">
                                {availableServices.find(s => s.id === service.serviceId)?.name}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-blue-900">
                              R$ {parseFloat(service.price || '0').toFixed(2)}
                            </span>
                          </div>
                          <div className="text-xs text-blue-700 mt-1">
                            Tempo estimado: {service.estimatedTime}min | 
                            Categoria: {availableServices.find(s => s.id === service.serviceId)?.category}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Total dos Serviços */}
                  {formData.services.some(s => s.serviceId) && (
                    <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-indigo-900">Total dos Serviços:</span>
                        <span className="text-lg font-bold text-indigo-900">
                          R$ {calculateServicesTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Peças */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-medium text-gray-900">Peças Necessárias</h4>
                  <button
                    type="button"
                    onClick={addPart}
                    className="inline-flex items-center px-3 py-1 text-sm text-indigo-600 hover:text-indigo-500 border border-indigo-300 rounded-md hover:bg-indigo-50"
                  >
                    <Icons.Plus className="mr-1 h-4 w-4" />
                    Adicionar
                  </button>
                </div>
                
                <div className="space-y-4">
                  {formData.parts.map((part, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Icons.Package className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Peça #{index + 1}</span>
                        </div>
                        {formData.parts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePart(index)}
                            className="p-1 text-red-600 hover:text-red-500 hover:bg-red-50 rounded-md"
                            title="Remover peça"
                          >
                            <Icons.X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            🔍 Pesquisar Produto (Nome ou Código de Barras)
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={productSearch}
                              onChange={(e) => setProductSearch(e.target.value)}
                              placeholder="Digite o nome ou código de barras..."
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm pl-10"
                            />
                            <Icons.Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            📦 Produto *
                          </label>
                          <select
                            value={part.productId}
                            onChange={(e) => updatePart(index, 'productId', e.target.value)}
                            required
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                          >
                            <option value="">Selecione um produto</option>
                            {filteredProducts.map(product => (
                              <option key={product.id} value={product.id}>
                                {product.name} - R$ {product.price.toFixed(2)} (Estoque: {product.stock}) - Cód: {product.barcode}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {part.productId && (
                          <div className="bg-blue-50 p-3 rounded-md">
                            <div className="flex items-center space-x-2">
                              <Icons.Package className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium text-blue-900">
                                {products.find(p => p.id === part.productId)?.name}
                              </span>
                            </div>
                            <div className="text-xs text-blue-700 mt-1">
                              Código: {products.find(p => p.id === part.productId)?.barcode} | 
                              Estoque: {products.find(p => p.id === part.productId)?.stock} unidades
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            📦 Quantidade
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={part.quantity || ''}
                            onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value) || 1)}
                            placeholder="Ex: 2"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            💰 Preço Unitário (R$)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={part.price || ''}
                            onChange={(e) => updatePart(index, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="Ex: 25,90"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                          />
                        </div>
                      </div>
                      
                      {/* Subtotal da peça */}
                      {part.name && parseFloat(part.quantity) > 0 && parseFloat(part.price) > 0 && (
                        <div className="bg-white p-2 rounded border border-indigo-200">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Subtotal desta peça:</span>
                            <span className="font-medium text-indigo-600">
                              R$ {((parseFloat(part.quantity) || 0) * (parseFloat(part.price) || 0)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Valores e Finalização */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <Icons.ShoppingCart className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-medium text-green-900">Valores e Finalização</h3>
              </div>
              <p className="mt-1 text-sm text-green-700">Configure os valores e informações finais da ordem de serviço.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="laborCost" className="block text-sm font-medium text-gray-700 mb-2">
                      Mão de Obra (R$)
                    </label>
                    <input
                      type="number"
                      name="laborCost"
                      id="laborCost"
                      min="0"
                      step="0.01"
                      value={formData.laborCost || ''}
                      onChange={handleChange}
                      placeholder="0,00"
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-3"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                      Prioridade
                    </label>
                    <select
                      name="priority"
                      id="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-3"
                    >
                      <option value="low">🟢 Baixa</option>
                      <option value="normal">🟡 Normal</option>
                      <option value="high">🟠 Alta</option>
                      <option value="urgent">🔴 Urgente</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="estimatedCompletion" className="block text-sm font-medium text-gray-700 mb-2">
                    Previsão de Conclusão
                  </label>
                  <input
                    type="date"
                    name="estimatedCompletion"
                    id="estimatedCompletion"
                    value={formData.estimatedCompletion}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-3"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    name="notes"
                    id="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Observações adicionais sobre a ordem de serviço..."
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
                  />
                </div>
              </div>

              {/* Resumo de Valores */}
              <div className="bg-gray-50 p-6 rounded-lg h-fit">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-lg font-medium text-gray-900">Resumo Financeiro</h5>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Status:</span>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="text-xs rounded-full px-2 py-1 border-0 bg-yellow-100 text-yellow-800 font-medium"
                    >
                      <option value="Em andamento">🟡 Em andamento</option>
                      <option value="Aguardando peças">🟠 Aguardando peças</option>
                      <option value="Aguardando aprovação">🔵 Aguardando aprovação</option>
                      <option value="Concluída">🟢 Concluída</option>
                      <option value="Cancelada">🔴 Cancelada</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Serviços ({formData.services.filter(s => s.serviceId).length} itens):</span>
                    <span className="font-medium">R$ {calculateServicesTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Peças ({formData.parts.filter(p => p.productId).length} itens):</span>
                    <span className="font-medium">R$ {calculatePartsTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mão de obra adicional:</span>
                    <span className="font-medium">R$ {(parseFloat(formData.laborCost) || 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-900">Total Geral:</span>
                      <span className="text-indigo-600">R$ {calculateTotalValue().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Resumo dos Dados */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h6 className="text-sm font-medium text-gray-900 mb-3">Resumo da Ordem</h6>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div><strong>Cliente:</strong> {selectedClient?.name || 'Não selecionado'}</div>
                    <div><strong>Veículo:</strong> {availableVehicles.find(v => v.id === formData.vehicleId)?.model || 'Não selecionado'}</div>
                    <div><strong>Serviços:</strong> {formData.services.filter(s => s.serviceId).length} item(s)</div>
                    <div><strong>Peças:</strong> {formData.parts.filter(p => p.productId).length} item(s)</div>
                    <div><strong>Prioridade:</strong> {
                      formData.priority === 'low' ? '🟢 Baixa' :
                      formData.priority === 'normal' ? '🟡 Normal' :
                      formData.priority === 'high' ? '🟠 Alta' : '🔴 Urgente'
                    }</div>
                    {formData.estimatedCompletion && (
                      <div><strong>Previsão:</strong> {new Date(formData.estimatedCompletion).toLocaleDateString('pt-BR')}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Voltar
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={
                  (currentStep === 1 && !canProceedToStep2) ||
                  (currentStep === 2 && !canProceedToStep3)
                }
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Icons.Plus className="mr-2 h-4 w-4" />
                Criar Ordem de Serviço
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

// Dashboard profissional com ações rápidas
const DashboardPage = () => {
  const navigate = useNavigate();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);

  // Atalhos de teclado
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Previne ação se estiver digitando em um input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case 'F1':
          event.preventDefault();
          setShowOrderModal(true);
          break;
        case 'F2':
          event.preventDefault();
          setShowSaleModal(true);
          break;
        case 'F3':
          event.preventDefault();
          setShowClientModal(true);
          break;
        case 'F4':
          event.preventDefault();
          setShowProductModal(true);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const stats = [
    {
      name: 'Total de Clientes',
      value: '2,847',
      change: '+12%',
      changeType: 'increase',
      icon: Icons.Users,
      color: 'bg-blue-500'
    },
    {
      name: 'Ordens Abertas',
      value: '23',
      change: '+3',
      changeType: 'increase',
      icon: Icons.Tool,
      color: 'bg-yellow-500'
    },
    {
      name: 'Vendas do Mês',
      value: 'R$ 45.2k',
      change: '+8.2%',
      changeType: 'increase',
      icon: Icons.ShoppingCart,
      color: 'bg-green-500'
    },
    {
      name: 'Produtos em Estoque',
      value: '1,247',
      change: '-2%',
      changeType: 'decrease',
      icon: Icons.Package,
      color: 'bg-purple-500'
    },
  ];

  // Botões de ação rápida principais
  const primaryActions = [
    {
      name: 'Nova Ordem',
      description: 'Criar ordem de serviço',
      icon: Icons.Tool,
      color: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700',
      hoverColor: 'hover:from-blue-600 hover:via-blue-700 hover:to-blue-800',
      action: () => setShowOrderModal(true),
      shortcut: 'F1'
    },
    {
      name: 'Nova Venda',
      description: 'Registrar venda',
      icon: Icons.ShoppingCart,
      color: 'bg-gradient-to-br from-green-500 via-green-600 to-green-700',
      hoverColor: 'hover:from-green-600 hover:via-green-700 hover:to-green-800',
      action: () => setShowSaleModal(true),
      shortcut: 'F2'
    },
    {
      name: 'Novo Cliente',
      description: 'Cadastrar cliente',
      icon: Icons.Users,
      color: 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700',
      hoverColor: 'hover:from-purple-600 hover:via-purple-700 hover:to-purple-800',
      action: () => setShowClientModal(true),
      shortcut: 'F3'
    },
    {
      name: 'Novo Produto',
      description: 'Adicionar produto',
      icon: Icons.Package,
      color: 'bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700',
      hoverColor: 'hover:from-orange-600 hover:via-orange-700 hover:to-orange-800',
      action: () => setShowProductModal(true),
      shortcut: 'F4'
    }
  ];

  // Botões de navegação rápida
  const navigationActions = [
    {
      name: 'Clientes',
      description: 'Gerenciar clientes',
      icon: Icons.Users,
      count: '2,847',
      color: 'bg-gradient-to-br from-blue-50 to-blue-100',
      iconColor: 'text-blue-600',
      action: () => navigate('/clients')
    },
    {
      name: 'Produtos',
      description: 'Controle de estoque',
      icon: Icons.Package,
      count: '1,247',
      color: 'bg-gradient-to-br from-purple-50 to-purple-100',
      iconColor: 'text-purple-600',
      action: () => navigate('/products')
    },
    {
      name: 'Serviços',
      description: 'Catálogo de serviços',
      icon: Icons.Tool,
      count: '156',
      color: 'bg-gradient-to-br from-green-50 to-green-100',
      iconColor: 'text-green-600',
      action: () => navigate('/services')
    },
    {
      name: 'Veículos',
      description: 'Frota cadastrada',
      icon: Icons.Motorcycle,
      count: '1,892',
      color: 'bg-gradient-to-br from-orange-50 to-orange-100',
      iconColor: 'text-orange-600',
      action: () => navigate('/vehicles')
    },
    {
      name: 'Ordens',
      description: 'Ordens de serviço',
      icon: Icons.Tool,
      count: '23 abertas',
      color: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      iconColor: 'text-yellow-600',
      action: () => navigate('/service-orders')
    },
    {
      name: 'Vendas',
      description: 'Histórico de vendas',
      icon: Icons.ShoppingCart,
      count: 'R$ 45.2k',
      color: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      iconColor: 'text-emerald-600',
      action: () => navigate('/sales')
    }
  ];

  const [recentOrders, setRecentOrders] = useState([
    { id: 'OS-001', client: 'João Silva', vehicle: 'Honda CG 160', status: 'Em andamento', value: 'R$ 450,00' },
    { id: 'OS-002', client: 'Maria Santos', vehicle: 'Yamaha YBR 125', status: 'Aguardando peças', value: 'R$ 280,00' },
    { id: 'OS-003', client: 'Carlos Lima', vehicle: 'Suzuki Intruder', status: 'Finalizada', value: 'R$ 1.200,00' },
  ]);

  const handleOrderSubmit = (orderData: any) => {
    // Encontrar o cliente e veículo pelos IDs
    const clients = [
      { id: '1', name: 'João Silva', vehicles: [{ id: '1', model: 'Honda CG 160', plate: 'ABC-1234' }] },
      { id: '2', name: 'Maria Santos', vehicles: [{ id: '2', model: 'Yamaha YBR 125', plate: 'DEF-5678' }] },
      { id: '3', name: 'Carlos Lima', vehicles: [{ id: '3', model: 'Suzuki Intruder', plate: 'GHI-9012' }] }
    ];
    
    const client = clients.find(c => c.id === orderData.clientId);
    const vehicle = client?.vehicles.find(v => v.id === orderData.vehicleId);
    
    const newOrder = {
      id: orderData.id,
      client: client?.name || 'Cliente não encontrado',
      vehicle: vehicle?.model || 'Veículo não encontrado',
      status: orderData.status,
      value: `R$ ${orderData.totalValue.toFixed(2).replace('.', ',')}`
    };
    
    // Adicionar a nova ordem no início da lista
    setRecentOrders(prev => [newOrder, ...prev.slice(0, 2)]);
    
    console.log('Nova ordem de serviço criada:', orderData);
    alert(`Ordem de serviço ${orderData.id} criada com sucesso!\nCliente: ${client?.name}\nVeículo: ${vehicle?.model}\nValor total: R$ ${orderData.totalValue.toFixed(2)}`);
  };

  const handleClientSubmit = (clientData: any) => {
    console.log('Novo cliente cadastrado:', clientData);
    alert(`Cliente ${clientData.name} cadastrado com sucesso!`);
  };

  const handleProductSubmit = (productData: any) => {
    console.log('Novo produto cadastrado:', productData);
    alert(`Produto ${productData.name} cadastrado com sucesso!`);
  };

  const handleServiceSubmit = (serviceData: any) => {
    console.log('Novo serviço cadastrado:', serviceData);
    alert(`Serviço ${serviceData.name} cadastrado com sucesso!`);
  };

  const handleSaleSubmit = (saleData: any) => {
    console.log('Nova venda registrada:', saleData);
    alert(`Venda registrada com sucesso! Total: R$ ${saleData.totalValue.toFixed(2)}`);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Profissional */}
      <div className="mb-10">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-xl bg-white bg-opacity-20 flex items-center justify-center mr-4">
                <Icons.Dashboard className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-blue-100 mt-1">Sistema de Gestão MotoTech Pro</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <Icons.Users className="h-4 w-4 mr-2 text-blue-200" />
                <span className="text-blue-100">Bem-vindo, Administrador</span>
              </div>
              <div className="flex items-center">
                <Icons.Bell className="h-4 w-4 mr-2 text-blue-200" />
                <span className="text-blue-100">Última atualização: agora</span>
              </div>
              <div className="flex items-center">
                <span className="text-blue-200">Hoje:</span>
                <span className="font-semibold ml-2">{new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Ação Rápida Principais */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Ações Rápidas</h2>
            <p className="text-gray-600 mt-1">Acesso direto às principais funcionalidades do sistema</p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {primaryActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className={`group relative overflow-hidden rounded-2xl ${action.color} ${action.hoverColor} p-8 text-white shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50`}
                >
                  <div className="relative z-10">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4 p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                        <Icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">{action.name}</h3>
                      <p className="text-sm opacity-90 mb-3">{action.description}</p>
                      <span className="text-xs bg-white bg-opacity-20 px-3 py-1 rounded-full font-medium">
                        {action.shortcut}
                      </span>
                    </div>
                  </div>
                  
                  {/* Efeitos visuais */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full transform translate-x-8 -translate-y-8"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white bg-opacity-10 rounded-full transform -translate-x-6 translate-y-6"></div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navegação Rápida */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Navegação Rápida</h2>
              <p className="text-gray-600 mt-1">Acesse rapidamente as diferentes seções do sistema</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {navigationActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className={`group relative overflow-hidden rounded-xl ${action.color} p-6 border border-gray-200 hover:border-gray-300 transform transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`mb-3 p-3 rounded-xl ${action.iconColor} bg-white shadow-sm`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">{action.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">{action.description}</p>
                    <span className="text-xs font-semibold text-gray-800 bg-white bg-opacity-80 px-2 py-1 rounded-full">
                      {action.count}
                    </span>
                  </div>
                  
                  {/* Efeito hover sutil */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-200"></div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Estatísticas Principais */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Resumo Executivo</h2>
              <p className="text-gray-600 mt-1">Principais métricas da sua oficina em tempo real</p>
            </div>
            <div className="text-sm text-gray-500">
              Atualizado há 5 min
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={stat.name} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${stat.color} mb-4 shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                      <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          stat.changeType === 'increase' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {stat.changeType === 'increase' ? '↗' : '↘'} {stat.change}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">vs. mês anterior</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Efeito decorativo */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-100 to-transparent rounded-full transform translate-x-8 -translate-y-8 opacity-50 group-hover:opacity-70 transition-opacity"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Seção de Atividades e Insights */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Ordens Recentes */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Ordens Recentes</h3>
              <p className="text-gray-600 mt-1">Últimas ordens de serviço criadas</p>
            </div>
            <button 
              onClick={() => navigate('/service-orders')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              Ver todas
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            {recentOrders.map((order, index) => (
              <div key={order.id} className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-sm ${
                        order.status === 'Finalizada' ? 'bg-green-100' :
                        order.status === 'Em andamento' ? 'bg-yellow-100' :
                        'bg-red-100'
                      }`}>
                        <Icons.Tool className={`h-6 w-6 ${
                          order.status === 'Finalizada' ? 'text-green-600' :
                          order.status === 'Em andamento' ? 'text-yellow-600' :
                          'text-red-600'
                        }`} />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-600">{order.client}</p>
                      <p className="text-xs text-gray-500">{order.vehicle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 mb-2">{order.value}</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Finalizada' ? 'bg-green-100 text-green-800' :
                      order.status === 'Em andamento' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                
                {/* Indicador de progresso visual */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                  <div className={`h-full transition-all duration-300 ${
                    order.status === 'Finalizada' ? 'bg-green-500 w-full' :
                    order.status === 'Em andamento' ? 'bg-yellow-500 w-2/3' :
                    'bg-red-500 w-1/3'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights e Alertas */}
        <div className="space-y-6">
          {/* Alertas Importantes */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center mr-3">
                <Icons.Bell className="h-4 w-4 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Alertas</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Icons.Package className="h-5 w-5 text-red-600 mt-0.5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">Estoque Baixo</p>
                    <p className="text-xs text-red-600 mt-1">15 produtos com estoque crítico</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Icons.Tool className="h-5 w-5 text-yellow-600 mt-0.5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-800">Ordens Atrasadas</p>
                    <p className="text-xs text-yellow-600 mt-1">3 ordens passaram do prazo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metas do Mês */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                <Icons.Dashboard className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Metas do Mês</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Vendas</span>
                  <span className="font-medium text-gray-900">R$ 45.2k / R$ 60k</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">75% da meta atingida</p>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Ordens</span>
                  <span className="font-medium text-gray-900">127 / 150</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">85% da meta atingida</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modais */}
      {/* Modal para Nova Ordem de Serviço */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title="Nova Ordem de Serviço"
        size="2xl"
      >
        <ServiceOrderForm
          onClose={() => setShowOrderModal(false)}
          onSubmit={handleOrderSubmit}
        />
      </Modal>

      {/* Modal para Novo Cliente */}
      <Modal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        title="Novo Cliente"
        size="lg"
      >
        <ClientForm
          onClose={() => setShowClientModal(false)}
          onSubmit={handleClientSubmit}
        />
      </Modal>

      {/* Modal para Novo Produto */}
      <Modal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        title="Novo Produto"
        size="lg"
      >
        <ProductForm
          onClose={() => setShowProductModal(false)}
          onSubmit={handleProductSubmit}
        />
      </Modal>

      {/* Modal para Novo Serviço */}
      <Modal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        title="Novo Serviço"
        size="lg"
      >
        <ServiceForm
          onClose={() => setShowServiceModal(false)}
          onSubmit={handleServiceSubmit}
        />
      </Modal>

      {/* Modal para Nova Venda */}
      <Modal
        isOpen={showSaleModal}
        onClose={() => setShowSaleModal(false)}
        title="Nova Venda"
        size="xl"
      >
        <SaleForm
          onClose={() => setShowSaleModal(false)}
          onSubmit={handleSaleSubmit}
        />
      </Modal>
    </div>
  );
};

const ClientsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const clients = [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '(11) 99999-9999',
      cpf: '123.456.789-00',
      vehicles: 2,
      lastService: '2024-08-10',
      status: 'Ativo',
      avatar: 'JS'
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '(11) 88888-8888',
      cpf: '987.654.321-00',
      vehicles: 1,
      lastService: '2024-08-05',
      status: 'Ativo',
      avatar: 'MS'
    },
    {
      id: 3,
      name: 'Carlos Lima',
      email: 'carlos.lima@email.com',
      phone: '(11) 77777-7777',
      cpf: '456.789.123-00',
      vehicles: 3,
      lastService: '2024-07-28',
      status: 'Inativo',
      avatar: 'CL'
    },
  ];

  const handleSubmit = (data: any) => {
    console.log('Novo cliente:', data);
    alert('Cliente salvo com sucesso! Veja o console para os dados.');
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Clientes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie todos os clientes da sua oficina
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Icons.Plus className="mr-2" />
            Novo Cliente
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Icons.Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar clientes por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-lg border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select className="rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option>Todos os status</option>
              <option>Ativo</option>
              <option>Inativo</option>
            </select>
            <button className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
              Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Clientes</dt>
                  <dd className="text-lg font-medium text-gray-900">{clients.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.Motorcycle className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Veículos Cadastrados</dt>
                  <dd className="text-lg font-medium text-gray-900">{clients.reduce((acc, client) => acc + client.vehicles, 0)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.Tool className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Clientes Ativos</dt>
                  <dd className="text-lg font-medium text-gray-900">{clients.filter(c => c.status === 'Ativo').length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clients table */}
      <div className="mt-8 overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                        Cliente
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Contato
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Veículos
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Último Serviço
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                        <span className="sr-only">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-0">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">{client.avatar}</span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{client.name}</div>
                              <div className="text-sm text-gray-500">{client.cpf}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div>{client.phone}</div>
                          <div className="text-gray-400">{client.email}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                            {client.vehicles} veículo{client.vehicles !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(client.lastService).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            client.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {client.status}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                            Editar
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            Ver mais
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Novo Cliente"
      >
        <ClientForm
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
};

// Formulário profissional de Produto
const ProductForm = ({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (data: any) => void;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    model: '',
    partNumber: '',
    price: '',
    costPrice: '',
    quantity: '',
    minQuantity: '',
    location: '',
    supplier: '',
    notes: ''
  });

  const categories = [
    'Óleo e Lubrificantes',
    'Filtros',
    'Freios',
    'Suspensão',
    'Motor',
    'Transmissão',
    'Elétrica',
    'Pneus',
    'Acessórios',
    'Ferramentas',
    'Outros'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = parseFloat(formData.quantity) || 0;
    const productData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      costPrice: parseFloat(formData.costPrice) || 0,
      quantity: quantity,
      minQuantity: parseFloat(formData.minQuantity) || 5,
      id: `PROD-${String(Date.now()).slice(-4)}`,
      createdAt: new Date().toISOString(),
      status: quantity > 0 ? 'Em estoque' : 'Sem estoque'
    };
    onSubmit(productData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: value 
    });
  };

  const costPrice = parseFloat(formData.costPrice) || 0;
  const price = parseFloat(formData.price) || 0;
  const profitMargin = costPrice > 0 ? ((price - costPrice) / costPrice * 100) : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Icons.Package className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-blue-900">Informações do Produto</h3>
          </div>
          <p className="mt-1 text-sm text-blue-700">Dados básicos do produto ou peça.</p>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Produto *
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Óleo Motul 20W50, Filtro de Ar Honda CG 160..."
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Categoria *
            </label>
            <select
              name="category"
              id="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            placeholder="Descrição detalhada do produto, compatibilidade, especificações..."
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
              Marca
            </label>
            <input
              type="text"
              name="brand"
              id="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Ex: Honda, Yamaha, Motul..."
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
              Modelo
            </label>
            <input
              type="text"
              name="model"
              id="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="Ex: CG 160, YBR 125..."
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="partNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Código/Número da Peça
            </label>
            <input
              type="text"
              name="partNumber"
              id="partNumber"
              value={formData.partNumber}
              onChange={handleChange}
              placeholder="Ex: 15400-PLM-A02"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Preços e Estoque */}
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Icons.ShoppingCart className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-lg font-medium text-green-900">Preços e Estoque</h3>
          </div>
          <p className="mt-1 text-sm text-green-700">Informações financeiras e controle de estoque.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700 mb-1">
              💰 Preço de Custo (R$)
            </label>
            <input
              type="number"
              name="costPrice"
              id="costPrice"
              min="0"
              step="0.01"
              value={formData.costPrice || ''}
              onChange={handleChange}
              placeholder="0,00"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              🏷️ Preço de Venda (R$) *
            </label>
            <input
              type="number"
              name="price"
              id="price"
              min="0"
              step="0.01"
              required
              value={formData.price || ''}
              onChange={handleChange}
              placeholder="0,00"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              📦 Quantidade em Estoque
            </label>
            <input
              type="number"
              name="quantity"
              id="quantity"
              min="0"
              value={formData.quantity || ''}
              onChange={handleChange}
              placeholder="0"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="minQuantity" className="block text-sm font-medium text-gray-700 mb-1">
              ⚠️ Estoque Mínimo
            </label>
            <input
              type="number"
              name="minQuantity"
              id="minQuantity"
              min="0"
              value={formData.minQuantity || ''}
              onChange={handleChange}
              placeholder="5"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Margem de Lucro */}
        {costPrice > 0 && price > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Margem de Lucro:</span>
              <span className={`text-sm font-semibold ${
                profitMargin > 0 ? 'text-green-600' : profitMargin < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {profitMargin.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-gray-600">Lucro por unidade:</span>
              <span className={`text-sm font-medium ${
                (price - costPrice) > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                R$ {(price - costPrice).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Informações Adicionais */}
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Icons.Tool className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-medium text-yellow-900">Informações Adicionais</h3>
          </div>
          <p className="mt-1 text-sm text-yellow-700">Localização, fornecedor e observações.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              📍 Localização no Estoque
            </label>
            <input
              type="text"
              name="location"
              id="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Ex: Prateleira A-3, Gaveta 5..."
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
              🏪 Fornecedor
            </label>
            <input
              type="text"
              name="supplier"
              id="supplier"
              value={formData.supplier}
              onChange={handleChange}
              placeholder="Ex: Distribuidora XYZ, Loja ABC..."
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            📝 Observações
          </label>
          <textarea
            name="notes"
            id="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Informações adicionais, compatibilidade, instruções especiais..."
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Icons.Plus />
          <span className="ml-2">Salvar Produto</span>
        </button>
      </div>
    </form>
  );
};

const ServicesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [services, setServices] = useState([
    {
      id: 'SERV-001',
      name: 'Troca de Óleo',
      description: 'Troca completa do óleo do motor com filtro',
      category: 'Manutenção Preventiva',
      price: 50.00,
      estimatedTime: 30,
      difficulty: 'easy',
      requirements: 'Chave de filtro, funil',
      status: 'Ativo',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'SERV-002',
      name: 'Revisão Completa',
      description: 'Revisão geral de todos os sistemas da motocicleta',
      category: 'Manutenção Preventiva',
      price: 150.00,
      estimatedTime: 120,
      difficulty: 'normal',
      requirements: 'Kit de ferramentas completo, multímetro',
      status: 'Ativo',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'SERV-003',
      name: 'Regulagem de Motor',
      description: 'Ajuste de carburação e ponto de ignição',
      category: 'Motor',
      price: 80.00,
      estimatedTime: 90,
      difficulty: 'hard',
      requirements: 'Multímetro, tacômetro, chaves especiais',
      status: 'Ativo',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'SERV-004',
      name: 'Troca de Pastilha de Freio',
      description: 'Substituição das pastilhas de freio dianteiro e traseiro',
      category: 'Freios',
      price: 60.00,
      estimatedTime: 45,
      difficulty: 'normal',
      requirements: 'Chaves Allen, alicate para molas',
      status: 'Ativo',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'SERV-005',
      name: 'Diagnóstico Elétrico',
      description: 'Análise completa do sistema elétrico da motocicleta',
      category: 'Elétrica',
      price: 100.00,
      estimatedTime: 60,
      difficulty: 'expert',
      requirements: 'Multímetro, osciloscópio, esquemas elétricos',
      status: 'Ativo',
      createdAt: '2024-01-15T10:00:00Z'
    }
  ]);

  const handleServiceSubmit = (serviceData: any) => {
    setServices(prev => [serviceData, ...prev]);
    console.log('Novo serviço cadastrado:', serviceData);
    alert(`Serviço "${serviceData.name}" cadastrado com sucesso!\nPreço: R$ ${serviceData.price.toFixed(2)}\nCategoria: ${serviceData.category}`);
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(services.map(s => s.category))];

  const getDifficultyBadge = (difficulty: string) => {
    const badges = {
      easy: { color: 'bg-green-100 text-green-800', label: '🟢 Fácil' },
      normal: { color: 'bg-yellow-100 text-yellow-800', label: '🟡 Normal' },
      hard: { color: 'bg-red-100 text-red-800', label: '🔴 Difícil' },
      expert: { color: 'bg-purple-100 text-purple-800', label: '⚫ Especialista' }
    };
    return badges[difficulty as keyof typeof badges] || badges.normal;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Serviços</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie todos os serviços oferecidos pela sua oficina
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Icons.Plus className="mr-2 h-4 w-4" />
            Novo Serviço
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.Tool className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Serviços</dt>
                  <dd className="text-lg font-medium text-gray-900">{services.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.Package className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Categorias</dt>
                  <dd className="text-lg font-medium text-gray-900">{categories.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.ShoppingCart className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Preço Médio</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    R$ {(services.reduce((acc, s) => acc + s.price, 0) / services.length).toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.Bell className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Serviços Ativos</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {services.filter(s => s.status === 'Ativo').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icons.Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">Todas as categorias</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Services Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Serviço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Preço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Tempo Est.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Dificuldade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredServices.map((service) => {
                    const difficultyBadge = getDifficultyBadge(service.difficulty);
                    return (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <Icons.Tool className="h-5 w-5 text-indigo-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{service.name}</div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">{service.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                            {service.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          R$ {service.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {service.estimatedTime}min
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${difficultyBadge.color}`}>
                            {difficultyBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                            {service.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                            Editar
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            Excluir
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Novo Serviço */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Novo Serviço"
        size="lg"
      >
        <ServiceForm
          onClose={() => setShowModal(false)}
          onSubmit={handleServiceSubmit}
        />
      </Modal>
    </div>
  );
};

const ProductsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([
    {
      id: 'PROD-001',
      name: 'Óleo Motul 20W50',
      category: 'Óleo e Lubrificantes',
      brand: 'Motul',
      price: 45.90,
      costPrice: 32.50,
      quantity: 12,
      minQuantity: 5,
      status: 'Em estoque'
    },
    {
      id: 'PROD-002',
      name: 'Filtro de Ar Honda CG 160',
      category: 'Filtros',
      brand: 'Honda',
      price: 28.50,
      costPrice: 18.00,
      quantity: 3,
      minQuantity: 5,
      status: 'Estoque baixo'
    }
  ]);

  const handleSubmit = (productData: any) => {
    setProducts(prev => [productData, ...prev]);
    console.log('Novo produto cadastrado:', productData);
    alert(`Produto "${productData.name}" cadastrado com sucesso!\nCódigo: ${productData.id}\nPreço: R$ ${productData.price.toFixed(2)}`);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Produtos e Peças</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie o estoque de peças e produtos da sua oficina
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Icons.Plus className="mr-2" />
            Novo Produto
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Icons.Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar produtos por nome, categoria ou marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-lg border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select className="rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option>Todas as categorias</option>
              <option>Óleo e Lubrificantes</option>
              <option>Filtros</option>
              <option>Freios</option>
              <option>Motor</option>
            </select>
            <button className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
              Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.Package className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Produtos</dt>
                  <dd className="text-lg font-medium text-gray-900">{products.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.ShoppingCart className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Em Estoque</dt>
                  <dd className="text-lg font-medium text-gray-900">{products.filter(p => p.status === 'Em estoque').length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.Tool className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Estoque Baixo</dt>
                  <dd className="text-lg font-medium text-gray-900">{products.filter(p => p.quantity <= p.minQuantity).length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.X className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Sem Estoque</dt>
                  <dd className="text-lg font-medium text-gray-900">{products.filter(p => p.quantity === 0).length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products table or empty state */}
      {filteredProducts.length > 0 ? (
        <div className="mt-8 overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                          Produto
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Categoria
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Preço
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Estoque
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                          <span className="sr-only">Ações</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-0">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <Icons.Package className="h-5 w-5 text-gray-500" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">{product.id} • {product.brand}</div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                              {product.category}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="text-sm font-medium text-gray-900">R$ {product.price.toFixed(2)}</div>
                            {product.costPrice > 0 && (
                              <div className="text-xs text-gray-500">
                                Custo: R$ {product.costPrice.toFixed(2)}
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="text-sm font-medium text-gray-900">{product.quantity} un.</div>
                            <div className="text-xs text-gray-500">Mín: {product.minQuantity}</div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              product.status === 'Em estoque' ? 'bg-green-100 text-green-800' :
                              product.status === 'Estoque baixo' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {product.status}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                            <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                              Editar
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              Ver mais
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 text-center">
          <Icons.Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece adicionando produtos e peças ao seu estoque.'}
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              <Icons.Plus className="mr-2" />
              Adicionar Produto
            </button>
          </div>
        </div>
      )}

      {/* Modal para Novo Produto */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Novo Produto"
        size="xl"
      >
        <ProductForm
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
};

// Formulário profissional de Veículo
const VehicleForm = ({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (data: any) => void;
}) => {
  const [formData, setFormData] = useState({
    clientId: '',
    brand: '',
    model: '',
    year: '',
    plate: '',
    color: '',
    engineSize: '',
    chassisNumber: '',
    renavam: '',
    mileage: '',
    fuelType: 'Gasolina',
    notes: ''
  });

  // Mock data para clientes (mesmo usado no formulário de ordem de serviço)
  const clients = [
    { id: '1', name: 'João Silva' },
    { id: '2', name: 'Maria Santos' },
    { id: '3', name: 'Carlos Lima' },
    { id: '4', name: 'Ana Costa' },
    { id: '5', name: 'Pedro Oliveira' }
  ];

  const brands = [
    'Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'BMW', 'Ducati', 
    'Harley-Davidson', 'Triumph', 'KTM', 'Aprilia', 'Dafra', 'Shineray'
  ];

  const fuelTypes = ['Gasolina', 'Álcool', 'Flex', 'Elétrica'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicleData = {
      ...formData,
      id: `VEH-${String(Date.now()).slice(-4)}`,
      createdAt: new Date().toISOString(),
      mileage: parseFloat(formData.mileage) || 0,
      year: parseInt(formData.year) || new Date().getFullYear(),
      status: 'Ativo'
    };
    onSubmit(vehicleData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const selectedClient = clients.find(c => c.id === formData.clientId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Proprietário */}
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Icons.Users className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-blue-900">Proprietário</h3>
          </div>
          <p className="mt-1 text-sm text-blue-700">Selecione o cliente proprietário do veículo.</p>
        </div>
        
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
            Cliente Proprietário *
          </label>
          <select
            name="clientId"
            id="clientId"
            required
            value={formData.clientId}
            onChange={handleChange}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Selecione o proprietário</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Informações do Veículo */}
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Icons.Motorcycle className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-lg font-medium text-green-900">Informações do Veículo</h3>
          </div>
          <p className="mt-1 text-sm text-green-700">Dados básicos da motocicleta.</p>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
              🏭 Marca *
            </label>
            <select
              name="brand"
              id="brand"
              required
              value={formData.brand}
              onChange={handleChange}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Selecione a marca</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
              🏍️ Modelo *
            </label>
            <input
              type="text"
              name="model"
              id="model"
              required
              value={formData.model}
              onChange={handleChange}
              placeholder="Ex: CG 160, YBR 125, CB 600F..."
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              📅 Ano *
            </label>
            <input
              type="number"
              name="year"
              id="year"
              required
              min="1980"
              max={new Date().getFullYear() + 1}
              value={formData.year || ''}
              onChange={handleChange}
              placeholder="2023"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="plate" className="block text-sm font-medium text-gray-700 mb-1">
              🔖 Placa *
            </label>
            <input
              type="text"
              name="plate"
              id="plate"
              required
              value={formData.plate}
              onChange={handleChange}
              placeholder="ABC-1234 ou ABC1D23"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm uppercase"
            />
          </div>
          
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
              🎨 Cor
            </label>
            <input
              type="text"
              name="color"
              id="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="Ex: Vermelha, Preta, Azul..."
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="engineSize" className="block text-sm font-medium text-gray-700 mb-1">
              ⚙️ Cilindrada
            </label>
            <input
              type="text"
              name="engineSize"
              id="engineSize"
              value={formData.engineSize}
              onChange={handleChange}
              placeholder="Ex: 160cc, 250cc, 600cc..."
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-1">
              🛣️ Quilometragem
            </label>
            <input
              type="number"
              name="mileage"
              id="mileage"
              min="0"
              value={formData.mileage || ''}
              onChange={handleChange}
              placeholder="Ex: 25000"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 mb-1">
              ⛽ Combustível
            </label>
            <select
              name="fuelType"
              id="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {fuelTypes.map(fuel => (
                <option key={fuel} value={fuel}>{fuel}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Documentação */}
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Icons.Tool className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-medium text-yellow-900">Documentação</h3>
          </div>
          <p className="mt-1 text-sm text-yellow-700">Informações dos documentos do veículo.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="chassisNumber" className="block text-sm font-medium text-gray-700 mb-1">
              🔢 Número do Chassi
            </label>
            <input
              type="text"
              name="chassisNumber"
              id="chassisNumber"
              value={formData.chassisNumber}
              onChange={handleChange}
              placeholder="Ex: 9C2JC30007R123456"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm uppercase"
            />
          </div>
          
          <div>
            <label htmlFor="renavam" className="block text-sm font-medium text-gray-700 mb-1">
              📋 RENAVAM
            </label>
            <input
              type="text"
              name="renavam"
              id="renavam"
              value={formData.renavam}
              onChange={handleChange}
              placeholder="Ex: 12345678901"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            📝 Observações
          </label>
          <textarea
            name="notes"
            id="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Informações adicionais sobre o veículo, modificações, histórico..."
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Resumo */}
      {selectedClient && formData.brand && formData.model && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h5 className="text-sm font-medium text-gray-900 mb-2">Resumo do Veículo</h5>
          <div className="text-sm text-gray-600">
            <p><strong>Proprietário:</strong> {selectedClient.name}</p>
            <p><strong>Veículo:</strong> {formData.brand} {formData.model} {formData.year}</p>
            {formData.plate && <p><strong>Placa:</strong> {formData.plate}</p>}
            {formData.color && <p><strong>Cor:</strong> {formData.color}</p>}
          </div>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Icons.Plus />
          <span className="ml-2">Salvar Veículo</span>
        </button>
      </div>
    </form>
  );
};

const VehiclesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicles, setVehicles] = useState([
    {
      id: 'VEH-001',
      clientId: '1',
      clientName: 'João Silva',
      brand: 'Honda',
      model: 'CG 160',
      year: 2022,
      plate: 'ABC-1234',
      color: 'Vermelha',
      mileage: 15000,
      status: 'Ativo',
      lastService: '2024-08-10'
    },
    {
      id: 'VEH-002',
      clientId: '2',
      clientName: 'Maria Santos',
      brand: 'Yamaha',
      model: 'YBR 125',
      year: 2021,
      plate: 'DEF-5678',
      color: 'Azul',
      mileage: 22000,
      status: 'Ativo',
      lastService: '2024-08-05'
    }
  ]);

  const clients = [
    { id: '1', name: 'João Silva' },
    { id: '2', name: 'Maria Santos' },
    { id: '3', name: 'Carlos Lima' },
    { id: '4', name: 'Ana Costa' },
    { id: '5', name: 'Pedro Oliveira' }
  ];

  const handleSubmit = (vehicleData: any) => {
    const client = clients.find(c => c.id === vehicleData.clientId);
    const newVehicle = {
      ...vehicleData,
      clientName: client?.name || 'Cliente não encontrado',
      lastService: null
    };
    
    setVehicles(prev => [newVehicle, ...prev]);
    console.log('Novo veículo cadastrado:', vehicleData);
    alert(`Veículo cadastrado com sucesso!\n${vehicleData.brand} ${vehicleData.model} - ${vehicleData.plate}\nProprietário: ${client?.name}`);
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Veículos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Cadastro e histórico de todas as motocicletas atendidas
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Icons.Plus className="mr-2" />
            Novo Veículo
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Icons.Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar veículos por marca, modelo, placa ou proprietário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-lg border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select className="rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option>Todas as marcas</option>
              <option>Honda</option>
              <option>Yamaha</option>
              <option>Suzuki</option>
              <option>Kawasaki</option>
            </select>
            <button className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
              Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.Motorcycle className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Veículos</dt>
                  <dd className="text-lg font-medium text-gray-900">{vehicles.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.Users className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Proprietários</dt>
                  <dd className="text-lg font-medium text-gray-900">{new Set(vehicles.map(v => v.clientId)).size}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.Tool className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Em Manutenção</dt>
                  <dd className="text-lg font-medium text-gray-900">0</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.Package className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Marcas Diferentes</dt>
                  <dd className="text-lg font-medium text-gray-900">{new Set(vehicles.map(v => v.brand)).size}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles table or empty state */}
      {filteredVehicles.length > 0 ? (
        <div className="mt-8 overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                          Veículo
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Proprietário
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Placa
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Quilometragem
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Último Serviço
                        </th>
                        <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                          <span className="sr-only">Ações</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredVehicles.map((vehicle) => (
                        <tr key={vehicle.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-0">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <Icons.Motorcycle className="h-5 w-5 text-gray-500" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {vehicle.brand} {vehicle.model}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {vehicle.year} • {vehicle.color}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="text-sm font-medium text-gray-900">{vehicle.clientName}</div>
                            <div className="text-sm text-gray-500">ID: {vehicle.clientId}</div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                              {vehicle.plate}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : 'Não informado'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {vehicle.lastService ? new Date(vehicle.lastService).toLocaleDateString('pt-BR') : 'Nunca'}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                            <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                              Editar
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              Histórico
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 text-center">
          <Icons.Motorcycle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? 'Nenhum veículo encontrado' : 'Nenhum veículo cadastrado'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece adicionando veículos dos seus clientes.'}
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              <Icons.Plus className="mr-2" />
              Adicionar Veículo
            </button>
          </div>
        </div>
      )}

      {/* Modal para Novo Veículo */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Novo Veículo"
        size="xl"
      >
        <VehicleForm
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
};

const ServiceOrdersPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceOrders, setServiceOrders] = useState([
    {
      id: 'OS-001',
      clientId: '1',
      clientName: 'João Silva',
      vehicleId: '1',
      vehicleInfo: 'Honda CG 160 - ABC-1234',
      description: 'Troca de óleo e revisão geral',
      services: ['Troca de óleo 20W50', 'Revisão de freios'],
      parts: [
        { name: 'Óleo Motul 20W50', quantity: 1, price: 45.90 },
        { name: 'Filtro de óleo', quantity: 1, price: 15.50 }
      ],
      laborCost: 80.00,
      totalValue: 141.40,
      status: 'Em andamento',
      priority: 'normal',
      createdAt: '2024-08-10T10:00:00Z',
      estimatedCompletion: '2024-08-12',
      notes: 'Cliente relatou ruído nos freios',
      paymentStatus: 'pending', // pending, paid, partial
      payments: []
    },
    {
      id: 'OS-002',
      clientId: '2',
      clientName: 'Maria Santos',
      vehicleId: '2',
      vehicleInfo: 'Yamaha YBR 125 - DEF-5678',
      description: 'Problema na partida elétrica',
      services: ['Diagnóstico elétrico', 'Troca do motor de partida'],
      parts: [
        { name: 'Motor de partida', quantity: 1, price: 120.00 }
      ],
      laborCost: 60.00,
      totalValue: 180.00,
      status: 'Aguardando peças',
      priority: 'high',
      createdAt: '2024-08-08T14:30:00Z',
      estimatedCompletion: '2024-08-15',
      notes: 'Peça em falta no estoque',
      paymentStatus: 'pending',
      payments: []
    },
    {
      id: 'OS-003',
      clientId: '3',
      clientName: 'Carlos Lima',
      vehicleId: '3',
      vehicleInfo: 'Suzuki Intruder - GHI-9012',
      description: 'Revisão completa dos 20.000km',
      services: ['Revisão completa', 'Troca de correia', 'Regulagem de motor'],
      parts: [
        { name: 'Kit correia dentada', quantity: 1, price: 85.00 },
        { name: 'Óleo sintético', quantity: 1, price: 65.00 },
        { name: 'Filtros diversos', quantity: 3, price: 25.00 }
      ],
      laborCost: 150.00,
      totalValue: 325.00,
      status: 'Finalizada',
      priority: 'normal',
      createdAt: '2024-08-05T09:15:00Z',
      estimatedCompletion: '2024-08-07',
      notes: 'Serviço concluído com sucesso',
      paymentStatus: 'paid',
      payments: [
        {
          paymentId: 'PAY-123456',
          amount: 325.00,
          method: 'card',
          installments: 2,
          date: '2024-08-07T16:30:00Z'
        }
      ]
    }
  ]);

  const clients = [
    { id: '1', name: 'João Silva', vehicles: [{ id: '1', model: 'Honda CG 160', plate: 'ABC-1234' }] },
    { id: '2', name: 'Maria Santos', vehicles: [{ id: '2', model: 'Yamaha YBR 125', plate: 'DEF-5678' }] },
    { id: '3', name: 'Carlos Lima', vehicles: [{ id: '3', model: 'Suzuki Intruder', plate: 'GHI-9012' }] }
  ];

  const handleOrderSubmit = (orderData: any) => {
    const client = clients.find(c => c.id === orderData.clientId);
    const vehicle = client?.vehicles.find(v => v.id === orderData.vehicleId);
    
    const newOrder = {
      ...orderData,
      clientName: client?.name || 'Cliente não encontrado',
      vehicleInfo: vehicle ? `${vehicle.model} - ${vehicle.plate}` : 'Veículo não encontrado'
    };
    
    setServiceOrders(prev => [newOrder, ...prev]);
    console.log('Nova ordem de serviço criada:', orderData);
    alert(`Ordem de serviço ${orderData.id} criada com sucesso!\nCliente: ${client?.name}\nVeículo: ${vehicle?.model}\nValor total: R$ ${orderData.totalValue.toFixed(2)}`);
  };

  const handleEditOrder = (order: any) => {
    setSelectedOrder(order);
    setShowEditModal(true);
  };

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleUpdateOrder = (updatedOrder: any) => {
    setServiceOrders(prev => 
      prev.map(order => 
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
    setShowEditModal(false);
    setSelectedOrder(null);
    console.log('Ordem de serviço atualizada:', updatedOrder);
    alert(`Ordem de serviço ${updatedOrder.id} atualizada com sucesso!`);
  };

  const handleProcessPayment = (order: any) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = (paymentData: any) => {
    setServiceOrders(prev => 
      prev.map(order => {
        if (order.id === paymentData.orderId) {
          const updatedPayments = [...(order.payments || []), paymentData];
          const totalPaid = updatedPayments.reduce((sum, payment) => sum + payment.finalAmount, 0);
          const paymentStatus = totalPaid >= order.totalValue ? 'paid' : 'partial';
          
          return {
            ...order,
            payments: updatedPayments,
            paymentStatus: paymentStatus,
            status: paymentStatus === 'paid' ? 'Finalizada' : order.status
          };
        }
        return order;
      })
    );
    
    setShowPaymentModal(false);
    setSelectedOrder(null);
    console.log('Pagamento processado:', paymentData);
    alert(`Pagamento de R$ ${paymentData.finalAmount.toFixed(2)} processado com sucesso!\nMétodo: ${paymentData.paymentMethod}\nOS: ${paymentData.orderId}`);
  };

  const filteredOrders = serviceOrders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehicleInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em andamento':
        return 'bg-blue-100 text-blue-800';
      case 'Aguardando peças':
        return 'bg-yellow-100 text-yellow-800';
      case 'Finalizada':
        return 'bg-green-100 text-green-800';
      case 'Cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'normal':
        return 'text-blue-600';
      case 'low':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '🔴 Urgente';
      case 'high':
        return '🟠 Alta';
      case 'normal':
        return '🟡 Normal';
      case 'low':
        return '🟢 Baixa';
      default:
        return priority;
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Ordens de Serviço</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie todas as ordens de serviço da oficina
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Icons.Plus className="mr-2" />
            Nova Ordem
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Icons.Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar ordens por ID, cliente, veículo ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-lg border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">Todos os status</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Aguardando peças">Aguardando peças</option>
              <option value="Finalizada">Finalizada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
            <button className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
              Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.Tool className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Ordens</dt>
                  <dd className="text-lg font-medium text-gray-900">{serviceOrders.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.Package className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Em Andamento</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {serviceOrders.filter(o => o.status === 'Em andamento').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.ShoppingCart className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Aguardando Peças</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {serviceOrders.filter(o => o.status === 'Aguardando peças').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.Users className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Finalizadas</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {serviceOrders.filter(o => o.status === 'Finalizada').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Orders table or empty state */}
      {filteredOrders.length > 0 ? (
        <div className="mt-8 overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                          Ordem
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Cliente / Veículo
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Descrição
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Valor
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Prioridade
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Pagamento
                        </th>
                        <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                          <span className="sr-only">Ações</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-0">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <Icons.Tool className="h-5 w-5 text-gray-500" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{order.id}</div>
                                <div className="text-sm text-gray-500">
                                  {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            <div className="text-sm font-medium text-gray-900">{order.clientName}</div>
                            <div className="text-sm text-gray-500">{order.vehicleInfo}</div>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500 max-w-xs">
                            <div className="truncate" title={order.description}>
                              {order.description}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {order.services.length} serviço(s), {order.parts.length} peça(s)
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="text-sm font-medium text-gray-900">
                              R$ {order.totalValue.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Mão de obra: R$ {order.laborCost.toFixed(2)}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className={`text-xs font-medium ${getPriorityColor(order.priority)}`}>
                              {getPriorityLabel(order.priority)}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                              order.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.paymentStatus === 'paid' ? '✅ Pago' :
                               order.paymentStatus === 'partial' ? '🟡 Parcial' :
                               '❌ Pendente'}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                            <div className="flex items-center justify-end space-x-2">
                              <button 
                                onClick={() => handleEditOrder(order)}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Editar ordem"
                              >
                                Editar
                              </button>
                              <button 
                                onClick={() => handleViewDetails(order)}
                                className="text-gray-600 hover:text-gray-900"
                                title="Ver detalhes"
                              >
                                Ver detalhes
                              </button>
                              {order.paymentStatus !== 'paid' && (
                                <button 
                                  onClick={() => handleProcessPayment(order)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Processar pagamento"
                                >
                                  💳 Pagar
                                </button>
                              )}
                              {order.paymentStatus === 'paid' && (
                                <span className="text-green-600 text-xs font-medium">
                                  ✅ Pago
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 text-center">
          <Icons.Tool className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm || statusFilter !== 'all' ? 'Nenhuma ordem encontrada' : 'Nenhuma ordem de serviço'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' ? 'Tente ajustar os filtros de busca.' : 'Crie sua primeira ordem de serviço para começar.'}
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              <Icons.Plus className="mr-2" />
              Criar Ordem
            </button>
          </div>
        </div>
      )}

      {/* Modal para Nova Ordem de Serviço */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nova Ordem de Serviço"
        size="2xl"
      >
        <ServiceOrderForm
          onClose={() => setShowModal(false)}
          onSubmit={handleOrderSubmit}
        />
      </Modal>

      {/* Modal para Editar Ordem de Serviço */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedOrder(null);
        }}
        title="Editar Ordem de Serviço"
        size="lg"
      >
        {selectedOrder && (
          <EditServiceOrderForm
            order={selectedOrder}
            onClose={() => {
              setShowEditModal(false);
              setSelectedOrder(null);
            }}
            onSubmit={handleUpdateOrder}
          />
        )}
      </Modal>

      {/* Modal para Ver Detalhes da Ordem de Serviço */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedOrder(null);
        }}
        title="Detalhes da Ordem de Serviço"
        size="2xl"
      >
        {selectedOrder && <ServiceOrderDetails order={selectedOrder} />}
      </Modal>

      {/* Modal para Pagamento da Ordem de Serviço */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedOrder(null);
        }}
        title="Processar Pagamento"
        size="lg"
      >
        {selectedOrder && (
          <ServiceOrderPayment
            order={selectedOrder}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedOrder(null);
            }}
            onPayment={handlePaymentSubmit}
          />
        )}
      </Modal>
    </div>
  );
};

// Formulário profissional de Venda
const SaleForm = ({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (data: any) => void;
}) => {
  const [formData, setFormData] = useState({
    clientId: '',
    items: [],
    paymentMethod: 'money',
    installments: '1',
    discount: '',
    notes: ''
  });

  // Mock data
  const clients = [
    { id: '1', name: 'João Silva' },
    { id: '2', name: 'Maria Santos' },
    { id: '3', name: 'Carlos Lima' },
    { id: '4', name: 'Ana Costa' },
    { id: '5', name: 'Pedro Oliveira' }
  ];

  const products = [
    { id: 'PROD-001', name: 'Óleo Motul 20W50', price: 45.90, stock: 12 },
    { id: 'PROD-002', name: 'Filtro de Ar Honda CG 160', price: 28.50, stock: 3 },
    { id: 'PROD-003', name: 'Pastilha de Freio', price: 65.00, stock: 8 },
    { id: 'PROD-004', name: 'Correia Dentada', price: 85.00, stock: 5 }
  ];



  const paymentMethods = [
    { value: 'money', label: '💵 Dinheiro' },
    { value: 'card', label: '💳 Cartão' },
    { value: 'pix', label: '📱 PIX' },
    { value: 'transfer', label: '🏦 Transferência' },
    { value: 'check', label: '📄 Cheque' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemsTotal = formData.items.reduce((acc, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const discount = parseFloat(item.discount) || 0;
      return acc + (quantity * unitPrice * (1 - discount / 100));
    }, 0);
    
    const generalDiscount = parseFloat(formData.discount) || 0;
    const totalValue = itemsTotal * (1 - generalDiscount / 100);
    
    const saleData = {
      ...formData,
      items: formData.items.map(item => ({
        ...item,
        quantity: parseFloat(item.quantity) || 0,
        unitPrice: parseFloat(item.unitPrice) || 0,
        discount: parseFloat(item.discount) || 0
      })),
      discount: parseFloat(formData.discount) || 0,
      installments: parseInt(formData.installments) || 1,
      id: `SALE-${String(Date.now()).slice(-4)}`,
      createdAt: new Date().toISOString(),
      totalValue: totalValue,
      status: 'Concluída'
    };
    
    onSubmit(saleData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', name: '', quantity: '1', unitPrice: '', discount: '0' }]
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-fill data when product is selected
    if (field === 'productId' && value) {
      const selectedProduct = products.find(product => product.id === value);
      if (selectedProduct) {
        newItems[index].name = selectedProduct.name;
        newItems[index].unitPrice = selectedProduct.price.toString();
        // Set default quantity if empty
        if (!newItems[index].quantity || newItems[index].quantity === '') {
          newItems[index].quantity = '1';
        }
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const selectedClient = clients.find(c => c.id === formData.clientId);

  const calculateItemTotal = (item: any) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const discount = parseFloat(item.discount) || 0;
    return quantity * unitPrice * (1 - discount / 100);
  };

  const calculateTotal = () => {
    const itemsTotal = formData.items.reduce((acc, item) => acc + calculateItemTotal(item), 0);
    const generalDiscount = parseFloat(formData.discount) || 0;
    return itemsTotal * (1 - generalDiscount / 100);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações do Cliente */}
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Icons.Users className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-blue-900">Informações da Venda</h3>
          </div>
          <p className="mt-1 text-sm text-blue-700">Selecione o cliente e adicione produtos ou serviços.</p>
        </div>
        
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
            Cliente *
          </label>
          <select
            name="clientId"
            id="clientId"
            required
            value={formData.clientId}
            onChange={handleChange}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Selecione o cliente</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Produtos da Venda */}
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Icons.Package className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-medium text-green-900">Produtos</h3>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-500 border border-green-300 rounded-md hover:bg-green-50"
            >
              <Icons.Plus className="mr-1 h-4 w-4" />
              Adicionar Produto
            </button>
          </div>
          <p className="mt-1 text-sm text-green-700">
            Venda de produtos e peças. Para serviços, use as Ordens de Serviço.
          </p>
        </div>

        <div className="space-y-4">
          {formData.items.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Icons.Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhum produto adicionado ainda.</p>
              <p className="text-sm">Clique em "Adicionar Produto" para começar.</p>
            </div>
          )}
          
          {formData.items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icons.Package className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Produto #{index + 1}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-1 text-red-600 hover:text-red-500 hover:bg-red-50 rounded-md"
                  title="Remover produto"
                >
                  <Icons.X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    📦 Produto *
                  </label>
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(index, 'productId', e.target.value)}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">Selecione um produto</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - R$ {product.price.toFixed(2)} (Estoque: {product.stock})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    📊 Quantidade *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity || ''}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    placeholder="1"
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    💰 Preço Unitário (R$) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice || ''}
                    onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                    placeholder="0,00"
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    🏷️ Desconto do Item (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={item.discount || ''}
                    onChange={(e) => updateItem(index, 'discount', e.target.value)}
                    placeholder="0"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              {/* Subtotal do item */}
              {parseFloat(item.quantity) > 0 && parseFloat(item.unitPrice) > 0 && (
                <div className="bg-white p-2 rounded border border-indigo-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Subtotal deste produto:</span>
                    <span className="font-medium text-indigo-600">
                      R$ {calculateItemTotal(item).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pagamento */}
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Icons.ShoppingCart className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-medium text-yellow-900">Pagamento</h3>
          </div>
          <p className="mt-1 text-sm text-yellow-700">Forma de pagamento e condições.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
              Forma de Pagamento *
            </label>
            <select
              name="paymentMethod"
              id="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>{method.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="installments" className="block text-sm font-medium text-gray-700 mb-1">
              Parcelas
            </label>
            <select
              name="installments"
              id="installments"
              value={formData.installments}
              onChange={handleChange}
              disabled={formData.paymentMethod === 'money' || formData.paymentMethod === 'pix'}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
            >
              {[1, 2, 3, 4, 5, 6, 10, 12].map(num => (
                <option key={num} value={num}>
                  {num}x {num > 1 ? `de R$ ${(calculateTotal() / num).toFixed(2)}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
              Desconto Geral (%)
            </label>
            <input
              type="number"
              name="discount"
              id="discount"
              min="0"
              max="100"
              step="0.01"
              value={formData.discount || ''}
              onChange={handleChange}
              placeholder="0"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            📝 Observações
          </label>
          <textarea
            name="notes"
            id="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Observações sobre a venda, condições especiais..."
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Resumo da Venda */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h5 className="text-lg font-medium text-gray-900 mb-4">Resumo da Venda</h5>
        <div className="space-y-2">
          {selectedClient && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Cliente:</span>
              <span className="font-medium">{selectedClient.name}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Produtos ({formData.items.length}):</span>
            <span className="font-medium">
              R$ {formData.items.reduce((acc, item) => acc + calculateItemTotal(item), 0).toFixed(2)}
            </span>
          </div>
          {parseFloat(formData.discount) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Desconto ({formData.discount}%):</span>
              <span className="font-medium text-red-600">
                - R$ {(formData.items.reduce((acc, item) => acc + calculateItemTotal(item), 0) * (parseFloat(formData.discount) / 100)).toFixed(2)}
              </span>
            </div>
          )}
          <div className="border-t pt-2">
            <div className="flex justify-between text-lg font-semibold">
              <span className="text-gray-900">Total:</span>
              <span className="text-indigo-600">R$ {calculateTotal().toFixed(2)}</span>
            </div>
            {parseInt(formData.installments) > 1 && (
              <div className="text-sm text-gray-600 mt-1">
                {formData.installments}x de R$ {(calculateTotal() / parseInt(formData.installments)).toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Icons.Plus />
          <span className="ml-2">Registrar Venda</span>
        </button>
      </div>
    </form>
  );
};

const SalesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sales, setSales] = useState([
    {
      id: 'SALE-001',
      clientId: '1',
      clientName: 'João Silva',
      type: 'product',
      items: [
        { name: 'Óleo Motul 20W50', quantity: 2, unitPrice: 45.90, discount: 0 },
        { name: 'Filtro de Ar', quantity: 1, unitPrice: 28.50, discount: 0 }
      ],
      paymentMethod: 'money',
      installments: 1,
      discount: 5,
      totalValue: 114.38,
      status: 'Concluída',
      createdAt: '2024-08-12T10:30:00Z',
      notes: 'Cliente pagou à vista'
    },
    {
      id: 'SALE-002',
      clientId: '2',
      clientName: 'Maria Santos',
      type: 'service',
      items: [
        { name: 'Revisão Completa', quantity: 1, unitPrice: 150.00, discount: 0 },
        { name: 'Troca de Óleo', quantity: 1, unitPrice: 50.00, discount: 10 }
      ],
      paymentMethod: 'card',
      installments: 2,
      discount: 0,
      totalValue: 195.00,
      status: 'Concluída',
      createdAt: '2024-08-11T14:15:00Z',
      notes: 'Pagamento em 2x no cartão'
    }
  ]);

  const clients = [
    { id: '1', name: 'João Silva' },
    { id: '2', name: 'Maria Santos' },
    { id: '3', name: 'Carlos Lima' },
    { id: '4', name: 'Ana Costa' },
    { id: '5', name: 'Pedro Oliveira' }
  ];

  const handleSaleSubmit = (saleData: any) => {
    const client = clients.find(c => c.id === saleData.clientId);
    const newSale = {
      ...saleData,
      clientName: client?.name || 'Cliente não encontrado'
    };
    
    setSales(prev => [newSale, ...prev]);
    console.log('Nova venda registrada:', saleData);
    alert(`Venda ${saleData.id} registrada com sucesso!\nCliente: ${client?.name}\nValor total: R$ ${saleData.totalValue.toFixed(2)}`);
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || sale.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getPaymentMethodLabel = (method: string) => {
    const methods: { [key: string]: string } = {
      money: '💵 Dinheiro',
      card: '💳 Cartão',
      pix: '📱 PIX',
      transfer: '🏦 Transferência',
      check: '📄 Cheque'
    };
    return methods[method] || method;
  };

  const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalValue, 0);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Vendas</h1>
          <p className="mt-2 text-sm text-gray-700">
            Controle de vendas de peças e serviços
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Icons.Plus className="mr-2" />
            Nova Venda
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Icons.Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar vendas por ID, cliente ou produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-lg border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">Todos os tipos</option>
              <option value="product">Produtos</option>
              <option value="service">Serviços</option>
            </select>
            <button className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
              Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.ShoppingCart className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Vendas</dt>
                  <dd className="text-lg font-medium text-gray-900">{sales.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.Package className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Vendas de Produtos</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {sales.filter(s => s.type === 'product').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.Tool className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Vendas de Serviços</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {sales.filter(s => s.type === 'service').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icons.Users className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Faturamento Total</dt>
                  <dd className="text-lg font-medium text-gray-900">R$ {totalRevenue.toFixed(2)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales table or empty state */}
      {filteredSales.length > 0 ? (
        <div className="mt-8 overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                          Venda
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Cliente
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Tipo
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Itens
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Pagamento
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Valor
                        </th>
                        <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                          <span className="sr-only">Ações</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-0">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <Icons.ShoppingCart className="h-5 w-5 text-gray-500" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{sale.id}</div>
                                <div className="text-sm text-gray-500">
                                  {new Date(sale.createdAt).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="text-sm font-medium text-gray-900">{sale.clientName}</div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              sale.type === 'product' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {sale.type === 'product' ? '🛍️ Produtos' : '🔧 Serviços'}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500 max-w-xs">
                            <div className="text-sm font-medium text-gray-900">
                              {sale.items.length} item(s)
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {sale.items.map(item => item.name).join(', ')}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="text-sm font-medium text-gray-900">
                              {getPaymentMethodLabel(sale.paymentMethod)}
                            </div>
                            {sale.installments > 1 && (
                              <div className="text-xs text-gray-500">
                                {sale.installments}x de R$ {(sale.totalValue / sale.installments).toFixed(2)}
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="text-sm font-medium text-gray-900">
                              R$ {sale.totalValue.toFixed(2)}
                            </div>
                            {sale.discount > 0 && (
                              <div className="text-xs text-green-600">
                                Desc: {sale.discount}%
                              </div>
                            )}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                            <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                              Ver detalhes
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              Imprimir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 text-center">
          <Icons.ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm || typeFilter !== 'all' ? 'Nenhuma venda encontrada' : 'Nenhuma venda registrada'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || typeFilter !== 'all' ? 'Tente ajustar os filtros de busca.' : 'Registre suas primeiras vendas para acompanhar o faturamento.'}
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              <Icons.Plus className="mr-2" />
              Registrar Venda
            </button>
          </div>
        </div>
      )}

      {/* Modal para Nova Venda */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nova Venda"
        size="xl"
      >
        <SaleForm
          onClose={() => setShowModal(false)}
          onSubmit={handleSaleSubmit}
        />
      </Modal>
    </div>
  );
};

// Componente principal da aplicação
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout><DashboardPage /></AppLayout>} />
      <Route path="/clients" element={<AppLayout><ClientsPage /></AppLayout>} />
      <Route path="/products" element={<AppLayout><ProductsPage /></AppLayout>} />
      <Route path="/services" element={<AppLayout><ServicesPage /></AppLayout>} />
      <Route path="/vehicles" element={<AppLayout><VehiclesPage /></AppLayout>} />
      <Route path="/service-orders" element={<AppLayout><ServiceOrdersPage /></AppLayout>} />
      <Route path="/sales" element={<AppLayout><SalesPage /></AppLayout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
                  
