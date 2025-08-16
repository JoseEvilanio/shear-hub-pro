// Histórico de Movimentações de Estoque
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState } from 'react';
import { InventoryMovement } from '@/services/inventoryService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  TrendingUp, 
  TrendingDown, 
  RotateCcw,
  ShoppingCart,
  Wrench,
  AlertTriangle,
  ArrowRightLeft,
  Calendar,
  User,
  FileText,
  Download,
} from 'lucide-react';

interface MovementHistoryProps {
  movements: InventoryMovement[];
  loading?: boolean;
  onExport?: () => void;
  formatMovementType: (type: any) => string;
  getMovementTypeColor: (type: any) => string;
}

export const MovementHistory: React.FC<MovementHistoryProps> = ({
  movements,
  loading = false,
  onExport,
  formatMovementType,
  getMovementTypeColor,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'entry':
        return TrendingUp;
      case 'exit':
        return TrendingDown;
      case 'adjustment':
        return RotateCcw;
      case 'sale':
        return ShoppingCart;
      case 'service_order':
        return Wrench;
      case 'loss':
        return AlertTriangle;
      case 'transfer':
        return ArrowRightLeft;
      default:
        return TrendingUp;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const filterMovements = (movements: InventoryMovement[]) => {
    let filtered = movements;

    // Filtrar por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(movement => movement.type === filterType);
    }

    // Filtrar por data
    if (dateFilter !== 'all') {
      const now = new Date();
      const startDate = new Date();

      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(movement => 
        new Date(movement.createdAt) >= startDate
      );
    }

    return filtered;
  };

  const filteredMovements = filterMovements(movements);

  const movementTypes = [
    { value: 'all', label: 'Todos os Tipos' },
    { value: 'entry', label: 'Entradas' },
    { value: 'exit', label: 'Saídas' },
    { value: 'adjustment', label: 'Ajustes' },
    { value: 'sale', label: 'Vendas' },
    { value: 'service_order', label: 'Ordens de Serviço' },
    { value: 'loss', label: 'Perdas' },
    { value: 'transfer', label: 'Transferências' },
  ];

  const dateFilters = [
    { value: 'all', label: 'Todo o Período' },
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Última Semana' },
    { value: 'month', label: 'Último Mês' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Movimentação
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {movementTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {dateFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Entradas</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredMovements.filter(m => m.type === 'entry').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <TrendingDown className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Saídas</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredMovements.filter(m => ['exit', 'sale', 'service_order', 'loss'].includes(m.type)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <RotateCcw className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Ajustes</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredMovements.filter(m => m.type === 'adjustment').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Movimentações */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Histórico de Movimentações ({filteredMovements.length})
          </h3>
        </div>

        {filteredMovements.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma movimentação encontrada</h3>
            <p className="text-gray-500">Não há movimentações para os filtros selecionados.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredMovements.map((movement) => {
              const MovementIcon = getMovementIcon(movement.type);
              const isPositive = movement.type === 'entry' || movement.type === 'adjustment';
              const quantityColor = isPositive ? 'text-green-600' : 'text-red-600';
              const quantitySign = isPositive ? '+' : '-';

              return (
                <div key={movement.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    {/* Ícone */}
                    <div className={`p-2 rounded-lg ${getMovementTypeColor(movement.type)} bg-opacity-10`}>
                      <MovementIcon className={`w-5 h-5 ${getMovementTypeColor(movement.type)}`} />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-sm font-medium text-gray-900">
                            {movement.product?.name || 'Produto não encontrado'}
                          </h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMovementTypeColor(movement.type)} bg-opacity-10`}>
                            {formatMovementType(movement.type)}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${quantityColor}`}>
                            {quantitySign}{movement.quantity} {movement.product?.unit || 'un'}
                          </p>
                          {movement.unitCost && (
                            <p className="text-xs text-gray-500">
                              {formatCurrency(movement.unitCost)} / un
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDateTime(movement.createdAt)}
                        </div>
                        
                        {movement.createdBy && (
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            {movement.createdBy}
                          </div>
                        )}

                        {movement.reference && (
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            {movement.reference}
                          </div>
                        )}
                      </div>

                      {movement.notes && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{movement.notes}</p>
                        </div>
                      )}

                      {movement.unitCost && (
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="text-gray-500">Valor Total:</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(movement.quantity * movement.unitCost)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};