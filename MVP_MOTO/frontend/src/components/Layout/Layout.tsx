import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Sistema de Gestão - Oficina Mecânica
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Bem-vindo, Usuário
              </span>
              <button className="btn btn-secondary btn-sm">
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              <li>
                <a href="/dashboard" className="sidebar-link-active">
                  📊 Dashboard
                </a>
              </li>
              <li>
                <a href="/clients" className="sidebar-link-inactive">
                  👥 Clientes
                </a>
              </li>
              <li>
                <a href="/suppliers" className="sidebar-link-inactive">
                  🏢 Fornecedores
                </a>
              </li>
              <li>
                <a href="/mechanics" className="sidebar-link-inactive">
                  🔧 Mecânicos
                </a>
              </li>
              <li>
                <a href="/vehicles" className="sidebar-link-inactive">
                  🏍️ Veículos
                </a>
              </li>
              <li>
                <a href="/products" className="sidebar-link-inactive">
                  📦 Produtos
                </a>
              </li>
              <li>
                <a href="/service-orders" className="sidebar-link-inactive">
                  📋 Ordens de Serviço
                </a>
              </li>
              <li>
                <a href="/sales" className="sidebar-link-inactive">
                  💰 Vendas
                </a>
              </li>
              <li>
                <a href="/inventory" className="sidebar-link-inactive">
                  📊 Estoque
                </a>
              </li>
              <li>
                <a href="/financial" className="sidebar-link-inactive">
                  💳 Financeiro
                </a>
              </li>
              <li>
                <a href="/reports" className="sidebar-link-inactive">
                  📈 Relatórios
                </a>
              </li>
              <li>
                <a href="/settings" className="sidebar-link-inactive">
                  ⚙️ Configurações
                </a>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;