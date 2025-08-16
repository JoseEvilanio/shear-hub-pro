const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Visão geral do sistema de gestão da oficina
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">OS</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ordens de Serviço</p>
                <p className="text-2xl font-semibold text-gray-900">12</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">V</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vendas Hoje</p>
                <p className="text-2xl font-semibold text-gray-900">R$ 2.450</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">E</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
                <p className="text-2xl font-semibold text-gray-900">5</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">C</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Contas a Receber</p>
                <p className="text-2xl font-semibold text-gray-900">R$ 8.750</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seções do Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ordens de Serviço Recentes */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Ordens de Serviço Recentes
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="text-sm font-medium text-gray-900">OS #001</p>
                  <p className="text-xs text-gray-500">Honda CB 600F - João Silva</p>
                </div>
                <span className="badge badge-warning">Em Andamento</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="text-sm font-medium text-gray-900">OS #002</p>
                  <p className="text-xs text-gray-500">Yamaha MT-07 - Maria Santos</p>
                </div>
                <span className="badge badge-info">Aguardando Peças</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="text-sm font-medium text-gray-900">OS #003</p>
                  <p className="text-xs text-gray-500">Kawasaki Ninja - Pedro Costa</p>
                </div>
                <span className="badge badge-success">Concluída</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vendas Recentes */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Vendas Recentes
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="text-sm font-medium text-gray-900">Venda #101</p>
                  <p className="text-xs text-gray-500">Óleo Motul 10W40 - Ana Lima</p>
                </div>
                <span className="text-sm font-medium text-green-600">R$ 85,00</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="text-sm font-medium text-gray-900">Venda #102</p>
                  <p className="text-xs text-gray-500">Kit Relação - Carlos Mendes</p>
                </div>
                <span className="text-sm font-medium text-green-600">R$ 320,00</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="text-sm font-medium text-gray-900">Venda #103</p>
                  <p className="text-xs text-gray-500">Pastilha de Freio - Roberto Silva</p>
                </div>
                <span className="text-sm font-medium text-green-600">R$ 120,00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Ações Rápidas
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="btn btn-primary">
              Nova OS
            </button>
            <button className="btn btn-primary">
              Nova Venda
            </button>
            <button className="btn btn-secondary">
              Cadastrar Cliente
            </button>
            <button className="btn btn-secondary">
              Entrada Estoque
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;