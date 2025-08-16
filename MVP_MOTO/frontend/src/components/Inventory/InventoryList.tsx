// Lista de Produtos do Estoque
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState } from 'react';
import { Product } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  Package, 
  AlertTriangle, 
  AlertCircle,
  Eye,
  Edit,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from 'lucide-react';

interface InventoryListProps {
  products: Product[];
  loading?: boolean;
  onProductSelect?: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
  calculateStockValue: (products: Product[]) => number;
  isLowStock: (product: Product) => boolean;
  isOutOfStock: (product: Product) => boolean;
}

export const InventoryList: React.FC<InventoryListProps> = ({
  products,
  loading = false,
  onProductSelect,
  onEditProduct,
  onViewDetails,
  calculateStockValue,
  isLowStock,
  isOutOfStock,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'value' | 'lastMovement'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const getStockStatus = (product: Product) => {
    if (isOutOfStock(product)) {
      return {
        status: 'out-of-stock',
        label: 'Em Falta',
        color: 'text-red-600 bg-red-50',
        icon: AlertCircle,
      };
    }
    if (isLowStock(product)) {
      return {
        status: 'low-stock',
        label: 'Estoque Baixo',
        color: 'text-yellow-600 bg-yellow-50',
        icon: AlertTriangle,
      };
    }
    return {
      status: 'normal',
      label: 'Normal',
      color: 'text-green-600 bg-green-50',
      icon: Package,
    };
  };

  const sortedProducts = [...products].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'stock':
        aValue = a.stockQuantity;
        bValue = b.stockQuantity;
        break;
      case 'value':
        aValue = a.stockQuantity * (a.cost || a.price);
        bValue = b.stockQuantity * (b.cost || b.price);
        break;
      case 'lastMovement':
        aValue = new Date(a.updatedAt || a.createdAt);
        bValue = new Date(b.updatedAt || b.createdAt);
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalValue = calculateStockValue(products);
  const lowStockCount = products.filter(isLowStock).length;
  const outOfStockCount = products.filter(isOutOfStock).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo do Estoque */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total de Produtos</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Estoque Baixo</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Em Falta</p>
              <p className="text-2xl font-bold text-gray-900">{outOfStockCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="name">Ordenar por Nome</option>
            <option value="stock">Ordenar por Estoque</option>
            <option value="value">Ordenar por Valor</option>
            <option value="lastMovement">Ordenar por Última Movimentação</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            title={`Ordem ${sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}`}
          >
            {sortOrder === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
            </div>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <div className="w-4 h-4 flex flex-col space-y-1">
              <div className="h-0.5 bg-current rounded"></div>
              <div className="h-0.5 bg-current rounded"></div>
              <div className="h-0.5 bg-current rounded"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Lista de Produtos */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-500">Não há produtos cadastrados no estoque.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
          {sortedProducts.map((product) => {
            const stockStatus = getStockStatus(product);
            const StatusIcon = stockStatus.icon;
            const productValue = product.stockQuantity * (product.cost || product.price);

            if (viewMode === 'grid') {
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onProductSelect?.(product)}
                >
                  {/* Imagem do Produto */}
                  <div className="aspect-square bg-gray-100 relative">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                      <StatusIcon className="w-3 h-3 inline mr-1" />
                      {stockStatus.label}
                    </div>
                  </div>

                  {/* Informações do Produto */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 truncate flex-1">{product.name}</h3>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-2">Código: {product.code}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Estoque:</span>
                        <span className="font-medium">{product.stockQuantity} {product.unit}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Preço:</span>
                        <span className="font-medium">{formatCurrency(product.price)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Valor Total:</span>
                        <span className="font-medium text-primary-600">{formatCurrency(productValue)}</span>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails?.(product);
                        }}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4 inline mr-1" />
                        Detalhes
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditProduct?.(product);
                        }}
                        className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                      >
                        <Edit className="w-4 h-4 inline mr-1" />
                        Editar
                      </button>
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onProductSelect?.(product)}
                >
                  <div className="flex items-center space-x-4">
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
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {stockStatus.label}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-2">Código: {product.code}</p>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Estoque:</span>
                          <p className="font-medium">{product.stockQuantity} {product.unit}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Preço:</span>
                          <p className="font-medium">{formatCurrency(product.price)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Valor Total:</span>
                          <p className="font-medium text-primary-600">{formatCurrency(productValue)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Atualizado:</span>
                          <p className="font-medium">{formatDate(product.updatedAt || product.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails?.(product);
                        }}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                        title="Ver Detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditProduct?.(product);
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
};