// Alertas de Estoque
// Sistema de Gestão de Oficina Mecânica de Motos

import React from 'react';
import { Product } from '@/types';
import { 
  AlertTriangle, 
  AlertCircle, 
  Package,
  ShoppingCart,
  TrendingUp,
  Clock,
} from 'lucide-react';

interface StockAlertsProps {
  lowStockProducts: Product[];
  outOfStockProducts: Product[];
  onProductSelect?: (product: Product) => void;
  onReorderProduct?: (product: Product) => void;
  calculateStockDays?: (product: Product, averageDailyUsage: number) => number;
  suggestReorderQuantity?: (product: Product, leadTimeDays?: number, averageDailyUsage?: number) => number;
}

export const StockAlerts: React.FC<StockAlertsProps> = ({
  lowStockProducts,
  outOfStockProducts,
  onProductSelect,
  onReorderProduct,
  calculateStockDays,
  suggestReorderQuantity,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStockDaysColor = (days: number) => {
    if (days <= 3) return 'text-red-600 bg-red-50';
    if (days <= 7) return 'text-yellow-600 bg-yellow-50';
    return 'text-blue-600 bg-blue-50';
  };

  const getStockDaysLabel = (days: number) => {
    if (days === Infinity) return 'Sem consumo';
    if (days <= 1) return `${days} dia`;
    return `${days} dias`;
  };

  return (
    <div className="space-y-6">
      {/* Resumo dos Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-red-200 p-4">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-700">Produtos em Falta</p>
              <p className="text-2xl font-bold text-red-900">{outOfStockProducts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-yellow-200 p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-700">Estoque Baixo</p>
              <p className="text-2xl font-bold text-yellow-900">{lowStockProducts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Produtos em Falta */}
      {outOfStockProducts.length > 0 && (
        <div className="bg-white rounded-lg border border-red-200">
          <div className="px-6 py-4 border-b border-red-200 bg-red-50">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <h3 className="text-lg font-medium text-red-900">
                Produtos em Falta ({outOfStockProducts.length})
              </h3>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Estes produtos estão com estoque zerado e precisam de reposição urgente.
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {outOfStockProducts.map((product) => {
              const suggestedQuantity = suggestReorderQuantity?.(product) || 0;
              const suggestedValue = suggestedQuantity * (product.cost || product.price);

              return (
                <div key={product.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    {/* Imagem */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Informações */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </h4>
                        <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-full">
                          EM FALTA
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 mb-3">Código: {product.code}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Estoque Atual:</span>
                          <p className="font-medium text-red-600">0 {product.unit}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Estoque Mínimo:</span>
                          <p className="font-medium">{product.minStock} {product.unit}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Preço:</span>
                          <p className="font-medium">{formatCurrency(product.price)}</p>
                        </div>
                      </div>

                      {suggestedQuantity > 0 && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-900">
                                Sugestão de Reposição
                              </p>
                              <p className="text-sm text-blue-700">
                                {suggestedQuantity} {product.unit} • {formatCurrency(suggestedValue)}
                              </p>
                            </div>
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => onProductSelect?.(product)}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Ver Detalhes
                      </button>
                      {onReorderProduct && (
                        <button
                          onClick={() => onReorderProduct(product)}
                          className="px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                        >
                          <ShoppingCart className="w-4 h-4 inline mr-1" />
                          Repor
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Produtos com Estoque Baixo */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-lg border border-yellow-200">
          <div className="px-6 py-4 border-b border-yellow-200 bg-yellow-50">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <h3 className="text-lg font-medium text-yellow-900">
                Estoque Baixo ({lowStockProducts.length})
              </h3>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Estes produtos estão abaixo do estoque mínimo e precisam de atenção.
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {lowStockProducts.map((product) => {
              const stockDays = calculateStockDays?.(product, 1) || 0;
              const suggestedQuantity = suggestReorderQuantity?.(product) || 0;
              const suggestedValue = suggestedQuantity * (product.cost || product.price);

              return (
                <div key={product.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    {/* Imagem */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Informações */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {calculateStockDays && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStockDaysColor(stockDays)}`}>
                              <Clock className="w-3 h-3 inline mr-1" />
                              {getStockDaysLabel(stockDays)}
                            </span>
                          )}
                          <span className="px-2 py-1 text-xs font-medium text-yellow-600 bg-yellow-50 rounded-full">
                            ESTOQUE BAIXO
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 mb-3">Código: {product.code}</p>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Estoque Atual:</span>
                          <p className="font-medium text-yellow-600">
                            {product.stockQuantity} {product.unit}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Estoque Mínimo:</span>
                          <p className="font-medium">{product.minStock} {product.unit}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Estoque Máximo:</span>
                          <p className="font-medium">{product.maxStock || 'N/A'} {product.unit}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Preço:</span>
                          <p className="font-medium">{formatCurrency(product.price)}</p>
                        </div>
                      </div>

                      {suggestedQuantity > 0 && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-900">
                                Sugestão de Reposição
                              </p>
                              <p className="text-sm text-blue-700">
                                {suggestedQuantity} {product.unit} • {formatCurrency(suggestedValue)}
                              </p>
                            </div>
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => onProductSelect?.(product)}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Ver Detalhes
                      </button>
                      {onReorderProduct && (
                        <button
                          onClick={() => onReorderProduct(product)}
                          className="px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                        >
                          <ShoppingCart className="w-4 h-4 inline mr-1" />
                          Repor
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Nenhum Alerta */}
      {outOfStockProducts.length === 0 && lowStockProducts.length === 0 && (
        <div className="bg-white rounded-lg border border-green-200 p-8 text-center">
          <Package className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-green-900 mb-2">
            Estoque em Ordem!
          </h3>
          <p className="text-green-700">
            Todos os produtos estão com estoque adequado. Nenhum alerta no momento.
          </p>
        </div>
      )}
    </div>
  );
};