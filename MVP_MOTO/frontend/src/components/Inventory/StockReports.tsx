// Relatórios Visuais de Estoque
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState } from 'react';
import { Product } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  TrendingDown,
  Package,
  DollarSign,
  Download,
} from 'lucide-react';

interface StockReportsProps {
  products: Product[];
  loading?: boolean;
  onExport?: (reportType: string) => void;
  calculateStockValue: (products: Product[]) => number;
  isLowStock: (product: Product) => boolean;
  isOutOfStock: (product: Product) => boolean;
}

interface CategoryData {
  category: string;
  count: number;
  value: number;
  percentage: number;
}

interface StockStatusData {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export const StockReports: React.FC<StockReportsProps> = ({
  products,
  loading = false,
  onExport,
  calculateStockValue,
  isLowStock,
  isOutOfStock,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedReport, setSelectedReport] = useState<'overview' | 'categories' | 'status' | 'value'>('overview');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Calcular dados por categoria
  const getCategoryData = (): CategoryData[] => {
    const categoryMap = new Map<string, { count: number; value: number }>();
    
    products.forEach(product => {
      const category = product.category || 'Sem Categoria';
      const value = product.stockQuantity * (product.cost || product.price);
      
      if (categoryMap.has(category)) {
        const existing = categoryMap.get(category)!;
        categoryMap.set(category, {
          count: existing.count + 1,
          value: existing.value + value,
        });
      } else {
        categoryMap.set(category, { count: 1, value });
      }
    });

    const totalValue = calculateStockValue(products);
    
    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      count: data.count,
      value: data.value,
      percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
    })).sort((a, b) => b.value - a.value);
  };

  // Calcular dados por status de estoque
  const getStockStatusData = (): StockStatusData[] => {
    const normalStock = products.filter(p => !isLowStock(p) && !isOutOfStock(p)).length;
    const lowStock = products.filter(isLowStock).length;
    const outOfStock = products.filter(isOutOfStock).length;
    const total = products.length;

    return [
      {
        status: 'Normal',
        count: normalStock,
        percentage: total > 0 ? (normalStock / total) * 100 : 0,
        color: 'bg-green-500',
      },
      {
        status: 'Estoque Baixo',
        count: lowStock,
        percentage: total > 0 ? (lowStock / total) * 100 : 0,
        color: 'bg-yellow-500',
      },
      {
        status: 'Em Falta',
        count: outOfStock,
        percentage: total > 0 ? (outOfStock / total) * 100 : 0,
        color: 'bg-red-500',
      },
    ];
  };

  // Produtos com maior valor em estoque
  const getTopValueProducts = () => {
    return [...products]
      .map(product => ({
        ...product,
        totalValue: product.stockQuantity * (product.cost || product.price),
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10);
  };

  // Produtos com menor estoque
  const getLowStockProducts = () => {
    return [...products]
      .filter(product => product.stockQuantity > 0)
      .sort((a, b) => a.stockQuantity - b.stockQuantity)
      .slice(0, 10);
  };

  const categoryData = getCategoryData();
  const stockStatusData = getStockStatusData();
  const topValueProducts = getTopValueProducts();
  const lowStockProducts = getLowStockProducts();
  const totalValue = calculateStockValue(products);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Relatório
              </label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="overview">Visão Geral</option>
                <option value="categories">Por Categoria</option>
                <option value="status">Status do Estoque</option>
                <option value="value">Valor do Estoque</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="week">Última Semana</option>
                <option value="month">Último Mês</option>
                <option value="quarter">Último Trimestre</option>
                <option value="year">Último Ano</option>
              </select>
            </div>
          </div>

          {onExport && (
            <button
              onClick={() => onExport(selectedReport)}
              className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
          )}
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total de Produtos</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <TrendingDown className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Estoque Baixo</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(isLowStock).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <TrendingDown className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Em Falta</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(isOutOfStock).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Relatórios por Tipo */}
      {selectedReport === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status do Estoque */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status do Estoque</h3>
            <div className="space-y-4">
              {stockStatusData.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${item.color}`}></div>
                    <span className="text-sm font-medium text-gray-900">{item.status}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{item.count}</p>
                    <p className="text-xs text-gray-500">{formatPercentage(item.percentage)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Categorias */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Principais Categorias</h3>
            <div className="space-y-4">
              {categoryData.slice(0, 5).map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{category.category}</p>
                    <p className="text-xs text-gray-500">{category.count} produtos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(category.value)}</p>
                    <p className="text-xs text-gray-500">{formatPercentage(category.percentage)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'categories' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Relatório por Categoria</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produtos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participação
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoryData.map((category) => (
                  <tr key={category.category}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(category.value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                        {formatPercentage(category.percentage)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedReport === 'value' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Produtos com Maior Valor */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Maior Valor em Estoque</h3>
            <div className="space-y-4">
              {topValueProducts.map((product, index) => (
                <div key={product.id} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.stockQuantity} {product.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(product.totalValue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Produtos com Menor Estoque */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Menor Estoque</h3>
            <div className="space-y-4">
              {lowStockProducts.map((product, index) => (
                <div key={product.id} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-yellow-600">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">Mín: {product.minStock} {product.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {product.stockQuantity} {product.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};