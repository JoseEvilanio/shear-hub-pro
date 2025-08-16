// Página Principal de Controle de Estoque
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState, useEffect } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { InventoryList } from '@/components/Inventory/InventoryList';
import { MovementHistory } from '@/components/Inventory/MovementHistory';
import { StockAlerts } from '@/components/Inventory/StockAlerts';
import { StockEntryForm } from '@/components/Inventory/StockEntryForm';
import { StockReports } from '@/components/Inventory/StockReports';
import { Modal } from '@/components/ui/Modal';
import { Product } from '@/types';
import { StockEntry } from '@/services/inventoryService';
import {
  Package,
  Plus,
  AlertTriangle,
  History,
  Filter,
  Download,
  Search,
  BarChart3,
} from 'lucide-react';

type TabType = 'inventory' | 'alerts' | 'movements' | 'reports';

export const InventoryPage: React.FC = () => {
  const {
    products,
    movements,
    loading,
    error,
    pagination,
    lowStockProducts,
    outOfStockProducts,
    categories,
    loadMovements,
    registerEntry,
    applyFilters,
    clearFilters,
    goToPage,
    exportInventory,
    calculateStockValue,
    isLowStock,
    isOutOfStock,
    formatMovementType,
    getMovementTypeColor,
  } = useInventory();

  // Estados locais
  const [activeTab, setActiveTab] = useState<TabType>('inventory');
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Carregar movimentações quando a aba for selecionada
  useEffect(() => {
    if (activeTab === 'movements') {
      loadMovements();
    }
  }, [activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({
      search: searchTerm,
      category: selectedCategory || undefined,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    clearFilters();
  };

  const handleStockEntry = async (data: StockEntry) => {
    const success = await registerEntry(data);
    if (success) {
      setShowEntryForm(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const handleEditProduct = (product: Product) => {
    // Implementar edição de produto
    console.log('Editar produto:', product);
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const handleReorderProduct = (product: Product) => {
    // Abrir formulário de entrada com produto pré-selecionado
    setSelectedProduct(product);
    setShowEntryForm(true);
  };

  const tabs = [
    {
      id: 'inventory' as TabType,
      name: 'Estoque',
      icon: Package,
      count: products.length,
    },
    {
      id: 'alerts' as TabType,
      name: 'Alertas',
      icon: AlertTriangle,
      count: lowStockProducts.length + outOfStockProducts.length,
      alert: lowStockProducts.length + outOfStockProducts.length > 0,
    },
    {
      id: 'movements' as TabType,
      name: 'Movimentações',
      icon: History,
      count: movements.length,
    },
    {
      id: 'reports' as TabType,
      name: 'Relatórios',
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Controle de Estoque</h1>
              <p className="text-gray-600">Gerencie produtos, movimentações e alertas de estoque</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </button>
              
              <button
                onClick={exportInventory}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
              
              <button
                onClick={() => setShowEntryForm(true)}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Entrada
              </button>
            </div>
          </div>

          {/* Filtros */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar Produto
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Nome ou código do produto..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end space-x-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Buscar
                  </button>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Limpar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    isActive
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                  {tab.count !== undefined && (
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      tab.alert
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {activeTab === 'inventory' && (
          <InventoryList
            products={products}
            loading={loading}
            onProductSelect={handleProductSelect}
            onEditProduct={handleEditProduct}
            onViewDetails={handleViewDetails}
            calculateStockValue={calculateStockValue}
            isLowStock={isLowStock}
            isOutOfStock={isOutOfStock}
          />
        )}

        {activeTab === 'alerts' && (
          <StockAlerts
            lowStockProducts={lowStockProducts}
            outOfStockProducts={outOfStockProducts}
            onProductSelect={handleProductSelect}
            onReorderProduct={handleReorderProduct}
          />
        )}

        {activeTab === 'movements' && (
          <MovementHistory
            movements={movements}
            loading={loading}
            formatMovementType={formatMovementType}
            getMovementTypeColor={getMovementTypeColor}
          />
        )}

        {activeTab === 'reports' && (
          <StockReports
            products={products}
            loading={loading}
            calculateStockValue={calculateStockValue}
            isLowStock={isLowStock}
            isOutOfStock={isOutOfStock}
          />
        )}

        {/* Paginação */}
        {activeTab === 'inventory' && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                {pagination.total} produtos
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => goToPage(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              
              <span className="px-3 py-2 text-sm font-medium text-gray-700">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              
              <button
                onClick={() => goToPage(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modais */}
      <StockEntryForm
        isOpen={showEntryForm}
        onClose={() => {
          setShowEntryForm(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleStockEntry}
        loading={loading}
      />

      {/* Modal de Detalhes do Produto */}
      {selectedProduct && (
        <Modal
          isOpen={showProductDetails}
          onClose={() => {
            setShowProductDetails(false);
            setSelectedProduct(null);
          }}
          title="Detalhes do Produto"
          size="lg"
        >
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="flex items-start space-x-4">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0">
                {selectedProduct.imageUrl ? (
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{selectedProduct.name}</h3>
                <p className="text-gray-600">Código: {selectedProduct.code}</p>
                <p className="text-gray-600">Categoria: {selectedProduct.category}</p>
              </div>
            </div>

            {/* Informações de Estoque */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Estoque Atual</p>
                <p className="text-xl font-bold text-gray-900">
                  {selectedProduct.stockQuantity} {selectedProduct.unit}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Estoque Mínimo</p>
                <p className="text-xl font-bold text-gray-900">
                  {selectedProduct.minStock} {selectedProduct.unit}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Preço</p>
                <p className="text-xl font-bold text-gray-900">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedProduct.price)}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Valor Total</p>
                <p className="text-xl font-bold text-primary-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    selectedProduct.stockQuantity * (selectedProduct.cost || selectedProduct.price)
                  )}
                </p>
              </div>
            </div>

            {selectedProduct.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Descrição</h4>
                <p className="text-gray-600">{selectedProduct.description}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};