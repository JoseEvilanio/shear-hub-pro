// Formulário de Entrada de Estoque
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Product } from '@/types';
import { StockEntry } from '@/services/inventoryService';
import {
  Package,
  DollarSign,
  FileText,
  Truck,
  Hash,
} from 'lucide-react';

interface StockEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StockEntry) => Promise<void>;
  loading?: boolean;
}

interface StockEntryFormData extends StockEntry {
  productSearch: string;
}

export const StockEntryForm: React.FC<StockEntryFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StockEntryFormData>();

  // Estados para busca de produtos
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productSearchLoading, setProductSearchLoading] = useState(false);

  const productSearch = watch('productSearch');
  const quantity = watch('quantity');
  const unitCost = watch('unitCost');

  // Resetar formulário quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      reset({
        productId: '',
        quantity: 1,
        unitCost: 0,
        supplier: '',
        invoiceNumber: '',
        notes: '',
        productSearch: '',
      });
      setSelectedProduct(null);
      setProducts([]);
    }
  }, [isOpen, reset]);

  // Buscar produtos
  useEffect(() => {
    const searchProducts = async () => {
      if (productSearch && productSearch.length >= 2) {
        try {
          setProductSearchLoading(true);
          // Aqui você implementaria a busca de produtos
          // const response = await productService.getProducts({
          //   search: productSearch,
          //   limit: 10,
          //   active: true,
          // });
          // setProducts(response.data.items);
          setProducts([]); // Placeholder
        } catch (error) {
          console.error('Erro ao buscar produtos:', error);
        } finally {
          setProductSearchLoading(false);
        }
      } else {
        setProducts([]);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [productSearch]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setValue('productId', product.id);
    setValue('productSearch', `${product.code} - ${product.name}`);
    setValue('unitCost', product.cost || product.price);
    setProducts([]);
  };

  const handleFormSubmit = async (data: StockEntryFormData) => {
    const { productSearch, ...submitData } = data;
    await onSubmit(submitData);
  };

  const handleClose = () => {
    reset();
    setSelectedProduct(null);
    setProducts([]);
    onClose();
  };

  const totalValue = (quantity || 0) * (unitCost || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Registrar Entrada de Estoque"
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Busca de Produto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Package className="w-4 h-4 inline mr-2" />
            Produto *
          </label>
          <div className="relative">
            <input
              {...register('productSearch', {
                required: 'Produto é obrigatório',
              })}
              type="text"
              placeholder="Digite o código ou nome do produto..."
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
            />
            {productSearchLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <LoadingSpinner size="sm" />
              </div>
            )}
            
            {/* Lista de produtos */}
            {products.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {products.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleProductSelect(product)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          Código: {product.code} • Estoque atual: {product.stockQuantity}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.productSearch && (
            <p className="mt-1 text-sm text-red-600">{errors.productSearch.message}</p>
          )}
        </div>

        {/* Informações do Produto Selecionado */}
        {selectedProduct && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              {selectedProduct.imageUrl && (
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{selectedProduct.name}</h3>
                <p className="text-sm text-gray-600">Código: {selectedProduct.code}</p>
                <p className="text-sm text-gray-600">Estoque atual: {selectedProduct.stockQuantity} {selectedProduct.unit}</p>
                <p className="text-sm text-gray-600">
                  Preço: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedProduct.price)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quantidade e Custo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade *
            </label>
            <input
              {...register('quantity', {
                required: 'Quantidade é obrigatória',
                min: {
                  value: 1,
                  message: 'Quantidade deve ser maior que zero',
                },
              })}
              type="number"
              id="quantity"
              min="1"
              step="1"
              placeholder="0"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="unitCost" className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Custo Unitário *
            </label>
            <input
              {...register('unitCost', {
                required: 'Custo unitário é obrigatório',
                min: {
                  value: 0.01,
                  message: 'Custo deve ser maior que zero',
                },
              })}
              type="number"
              id="unitCost"
              min="0.01"
              step="0.01"
              placeholder="0,00"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
            />
            {errors.unitCost && (
              <p className="mt-1 text-sm text-red-600">{errors.unitCost.message}</p>
            )}
          </div>
        </div>

        {/* Valor Total */}
        {quantity && unitCost && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">Valor Total da Entrada:</span>
              <span className="text-lg font-bold text-blue-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
              </span>
            </div>
          </div>
        )}

        {/* Fornecedor e Nota Fiscal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-2">
              <Truck className="w-4 h-4 inline mr-2" />
              Fornecedor
            </label>
            <input
              {...register('supplier')}
              type="text"
              id="supplier"
              placeholder="Nome do fornecedor"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>

          <div>
            <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="w-4 h-4 inline mr-2" />
              Número da Nota Fiscal
            </label>
            <input
              {...register('invoiceNumber')}
              type="text"
              id="invoiceNumber"
              placeholder="Número da NF"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
        </div>

        {/* Observações */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Observações
          </label>
          <textarea
            {...register('notes')}
            id="notes"
            rows={3}
            placeholder="Observações sobre a entrada..."
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 resize-none"
          />
        </div>

        {/* Botões */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !selectedProduct}
            className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading && <LoadingSpinner size="sm" color="white" className="mr-2" />}
            Registrar Entrada
          </button>
        </div>
      </form>
    </Modal>
  );
};