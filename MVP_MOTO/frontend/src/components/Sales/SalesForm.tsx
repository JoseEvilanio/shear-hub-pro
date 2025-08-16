// Formulário de Vendas
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Sale, Client } from '@/types';
import { CreateSaleData, SaleType, PaymentMethod, PAYMENT_METHOD_LABELS } from '@/services/salesService';
import { clientService } from '@/services/clientService';
import { useSales } from '@/hooks/useSales';
import {
  ShoppingCart,
  FileText,
  User,
  Scan,
  Trash2,
  Percent,
  CreditCard,
  Search,
} from 'lucide-react';

interface SalesFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SalesFormData) => Promise<void>;
  sale?: Sale | null;
  loading?: boolean;
}

export interface SalesFormData extends CreateSaleData {
  clientSearch: string;
}

interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  totalPrice: number;
}

export const SalesForm: React.FC<SalesFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  sale,
  loading = false,
}) => {
  const { getProductByBarcode, calculateTotal, calculateSubtotal, calculateTotalDiscount } = useSales();
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: {},
  } = useForm<SalesFormData>();

  // Estados
  const [saleType, setSaleType] = useState<SaleType>('sale');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [generalDiscount, setGeneralDiscount] = useState(0);
  const [clientSearchLoading, setClientSearchLoading] = useState(false);
  const [barcodeLoading, setBarcodeLoading] = useState(false);

  const clientSearch = watch('clientSearch');

  // Resetar formulário quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (sale) {
        setSaleType(sale.type as SaleType);
        setSelectedClient(sale.client || null);
        setGeneralDiscount(sale.discountAmount || 0);
        // Carregar itens da venda
        if (sale.items) {
          setItems(sale.items.map((item: any) => ({
            id: item.id,
            productId: item.productId,
            productName: item.product?.name || '',
            productCode: item.product?.code || '',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountAmount: item.discountAmount || 0,
            totalPrice: item.totalPrice,
          })));
        }
        reset({
          clientId: sale.clientId,
          type: sale.type as SaleType,
          paymentMethod: sale.paymentMethod as PaymentMethod,
          notes: sale.notes || '',
          clientSearch: sale.client?.name || '',
        });
      } else {
        setSaleType('sale');
        setItems([]);
        setSelectedClient(null);
        setGeneralDiscount(0);
        setBarcodeInput('');
        reset({
          clientId: '',
          type: 'sale',
          paymentMethod: 'cash',
          notes: '',
          clientSearch: '',
        });
      }
    }
  }, [isOpen, sale, reset]);

  // Buscar clientes
  useEffect(() => {
    const searchClients = async () => {
      if (clientSearch && clientSearch.length >= 2) {
        try {
          setClientSearchLoading(true);
          const response = await clientService.getClients({
            search: clientSearch,
            limit: 10,
            active: true,
          });
          setClients(response.data.items);
        } catch (error) {
          console.error('Erro ao buscar clientes:', error);
        } finally {
          setClientSearchLoading(false);
        }
      } else {
        setClients([]);
      }
    };

    const debounceTimer = setTimeout(searchClients, 300);
    return () => clearTimeout(debounceTimer);
  }, [clientSearch]);

  // Calcular totais
  const subtotal = calculateSubtotal(items);
  const totalDiscount = calculateTotalDiscount(items, generalDiscount);
  const total = calculateTotal(items, generalDiscount);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setValue('clientId', client.id);
    setValue('clientSearch', client.name);
    setClients([]);
  };

  const handleSaleTypeChange = (type: SaleType) => {
    setSaleType(type);
    setValue('type', type);
  };

  const handleBarcodeSearch = async () => {
    if (!barcodeInput.trim()) return;

    try {
      setBarcodeLoading(true);
      const product = await getProductByBarcode(barcodeInput);
      
      if (product) {
        addProductToSale(product);
        setBarcodeInput('');
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
    } finally {
      setBarcodeLoading(false);
    }
  };

  const addProductToSale = (product: any) => {
    const existingItemIndex = items.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex >= 0) {
      // Incrementar quantidade se produto já existe
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += 1;
      updatedItems[existingItemIndex].totalPrice = 
        updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unitPrice - 
        updatedItems[existingItemIndex].discountAmount;
      setItems(updatedItems);
    } else {
      // Adicionar novo item
      const newItem: SaleItem = {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.name,
        productCode: product.code,
        quantity: 1,
        unitPrice: product.price,
        discountAmount: 0,
        totalPrice: product.price,
      };
      setItems([...items, newItem]);
    }
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        const newTotalPrice = quantity * item.unitPrice - item.discountAmount;
        return {
          ...item,
          quantity,
          totalPrice: Math.max(0, newTotalPrice),
        };
      }
      return item;
    });
    setItems(updatedItems);
  };

  const updateItemDiscount = (itemId: string, discountAmount: number) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        const maxDiscount = item.quantity * item.unitPrice;
        const validDiscount = Math.min(Math.max(0, discountAmount), maxDiscount);
        const newTotalPrice = item.quantity * item.unitPrice - validDiscount;
        return {
          ...item,
          discountAmount: validDiscount,
          totalPrice: Math.max(0, newTotalPrice),
        };
      }
      return item;
    });
    setItems(updatedItems);
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleFormSubmit = async (data: SalesFormData) => {
    const saleItems = items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountAmount: item.discountAmount,
    }));

    const submitData: SalesFormData = {
      clientId: selectedClient?.id,
      type: saleType,
      items: saleItems,
      discountAmount: generalDiscount,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      clientSearch: data.clientSearch,
    };

    await onSubmit(submitData);
  };

  const handleClose = () => {
    reset();
    setItems([]);
    setSelectedClient(null);
    setGeneralDiscount(0);
    setBarcodeInput('');
    setClients([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={sale ? 'Editar Venda' : 'Nova Venda'}
      size="xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Alternância Pedido/Orçamento */}
        <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <button
            type="button"
            onClick={() => handleSaleTypeChange('sale')}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              saleType === 'sale'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Venda
          </button>
          <button
            type="button"
            onClick={() => handleSaleTypeChange('quote')}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              saleType === 'quote'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-5 h-5 mr-2" />
            Orçamento
          </button>
        </div>

        {/* Seleção de Cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Cliente
          </label>
          <div className="relative">
            <input
              {...register('clientSearch')}
              type="text"
              placeholder="Digite o nome do cliente (opcional)..."
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
            />
            {clientSearchLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <LoadingSpinner size="sm" />
              </div>
            )}
            
            {/* Lista de clientes */}
            {clients.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {clients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => handleClientSelect(client)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium">{client.name}</p>
                      {client.phone && (
                        <p className="text-sm text-gray-500">{client.phone}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Leitor de Código de Barras */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Scan className="w-4 h-4 inline mr-2" />
            Código de Barras
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Digite ou escaneie o código de barras..."
              disabled={loading}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleBarcodeSearch();
                }
              }}
            />
            <button
              type="button"
              onClick={handleBarcodeSearch}
              disabled={loading || barcodeLoading || !barcodeInput.trim()}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {barcodeLoading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Lista de Itens */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">Itens</h3>
            <span className="text-sm text-gray-500">
              {items.length} {items.length === 1 ? 'item' : 'itens'}
            </span>
          </div>
          
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <Scan className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhum item adicionado</p>
              <p className="text-sm">Use o código de barras para adicionar produtos</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-500">Código: {item.productCode}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-20">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-1 text-center border border-gray-300 rounded text-sm"
                      />
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(item.unitPrice)}
                    </div>
                    
                    <div className="w-24">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.discountAmount}
                        onChange={(e) => updateItemDiscount(item.id, parseFloat(e.target.value) || 0)}
                        placeholder="Desconto"
                        className="w-full px-2 py-1 text-center border border-gray-300 rounded text-sm"
                      />
                    </div>
                    
                    <div className="text-sm font-medium text-gray-900 w-20 text-right">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(item.totalPrice)}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desconto Geral */}
        {items.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Percent className="w-4 h-4 inline mr-2" />
              Desconto Geral
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={generalDiscount}
              onChange={(e) => setGeneralDiscount(parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Forma de Pagamento */}
        {saleType === 'sale' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="w-4 h-4 inline mr-2" />
              Forma de Pagamento
            </label>
            <select
              {...register('paymentMethod')}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
            >
              {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            placeholder="Observações adicionais..."
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 resize-none"
          />
        </div>

        {/* Resumo dos Totais */}
        {items.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Desconto:</span>
                  <span>-{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                <span>Total:</span>
                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
              </div>
            </div>
          </div>
        )}

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
            disabled={loading || items.length === 0}
            className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading && <LoadingSpinner size="sm" color="white" className="mr-2" />}
            {sale ? 'Atualizar' : 'Criar'} {saleType === 'sale' ? 'Venda' : 'Orçamento'}
          </button>
        </div>
      </form>
    </Modal>
  );
};