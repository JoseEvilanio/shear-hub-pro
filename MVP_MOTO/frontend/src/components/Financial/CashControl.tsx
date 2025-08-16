// Controle de Caixa
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState } from 'react';
import { CashMovement, CreateCashMovement } from '@/services/financialService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import {
  Wallet,
  Plus,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Filter,
} from 'lucide-react';

interface CashControlProps {
  movements: CashMovement[];
  loading?: boolean;
  onCreateMovement?: (data: CreateCashMovement) => Promise<boolean>;
  onUpdateMovement?: (id: string, data: Partial<CreateCashMovement>) => Promise<boolean>;
  onDeleteMovement?: (id: string) => Promise<boolean>;
  incomeCategories: string[];
  expenseCategories: string[];
  formatPaymentMethod: (method: string) => string;
}

export const CashControl: React.FC<CashControlProps> = ({
  movements,
  loading = false,
  onCreateMovement,
  onUpdateMovement,
  onDeleteMovement,
  incomeCategories,
  expenseCategories,
  formatPaymentMethod,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<CashMovement | null>(null);
  const [formData, setFormData] = useState<CreateCashMovement>({
    type: 'income',
    category: '',
    description: '',
    amount: 0,
    paymentMethod: 'cash',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

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

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  }; 
 const resetForm = () => {
    setFormData({
      type: 'income',
      category: '',
      description: '',
      amount: 0,
      paymentMethod: 'cash',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleCreateMovement = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleEditMovement = (movement: CashMovement) => {
    setSelectedMovement(movement);
    setFormData({
      type: movement.type,
      category: movement.category,
      description: movement.description,
      amount: movement.amount,
      paymentMethod: movement.paymentMethod,
      date: movement.date,
      notes: movement.notes || '',
    });
    setShowEditModal(true);
  };

  const handleViewDetails = (movement: CashMovement) => {
    setSelectedMovement(movement);
    setShowDetailsModal(true);
  };

  const handleSubmitCreate = async () => {
    if (!onCreateMovement) return;

    try {
      setFormLoading(true);
      await onCreateMovement(formData);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao criar movimentação:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedMovement || !onUpdateMovement) return;

    try {
      setFormLoading(true);
      await onUpdateMovement(selectedMovement.id, formData);
      setShowEditModal(false);
      setSelectedMovement(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao atualizar movimentação:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (movement: CashMovement) => {
    if (!onDeleteMovement) return;
    
    if (window.confirm('Tem certeza que deseja excluir esta movimentação?')) {
      try {
        await onDeleteMovement(movement.id);
      } catch (error) {
        console.error('Erro ao excluir movimentação:', error);
      }
    }
  };

  const filteredMovements = movements.filter(movement => {
    if (filterType === 'all') return true;
    return movement.type === filterType;
  });

  const totalIncome = movements
    .filter(m => m.type === 'income')
    .reduce((sum, m) => sum + m.amount, 0);

  const totalExpense = movements
    .filter(m => m.type === 'expense')
    .reduce((sum, m) => sum + m.amount, 0);

  const balance = totalIncome - totalExpense;

  const getMovementIcon = (type: string) => {
    return type === 'income' ? TrendingUp : TrendingDown;
  };

  const getMovementColor = (type: string) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  };

  const getCurrentCategories = () => {
    return formData.type === 'income' ? incomeCategories : expenseCategories;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo do Caixa */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Entradas</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalIncome)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Saídas</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpense)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${balance >= 0 ? 'bg-blue-100' : 'bg-red-100'}`}>
              <Wallet className={`w-6 h-6 ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Saldo</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Todas as movimentações</option>
              <option value="income">Apenas entradas</option>
              <option value="expense">Apenas saídas</option>
            </select>
          </div>
        </div>

        {onCreateMovement && (
          <button
            onClick={handleCreateMovement}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Movimentação
          </button>
        )}
      </div>

      {/* Lista de Movimentações */}
      {filteredMovements.length === 0 ? (
        <div className="text-center py-12">
          <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma movimentação encontrada
          </h3>
          <p className="text-gray-500">
            Não há movimentações de caixa para exibir.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Forma de Pagamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMovements.map((movement) => {
                  const MovementIcon = getMovementIcon(movement.type);
                  const colorClass = getMovementColor(movement.type);

                  return (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MovementIcon className={`w-4 h-4 mr-2 ${colorClass}`} />
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${movement.type === 'income' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                            {movement.type === 'income' ? 'Entrada' : 'Saída'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {movement.description}
                        </div>
                        {movement.reference && (
                          <div className="text-sm text-gray-500">
                            Ref: {movement.reference}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {movement.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${colorClass}`}>
                          {movement.type === 'income' ? '+' : '-'}{formatCurrency(movement.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(movement.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatPaymentMethod(movement.paymentMethod)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(movement)}
                            className="text-primary-600 hover:text-primary-700"
                            title="Ver Detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {onUpdateMovement && (
                            <button
                              onClick={() => handleEditMovement(movement)}
                              className="text-gray-600 hover:text-gray-700"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          
                          {onDeleteMovement && (
                            <button
                              onClick={() => handleDelete(movement)}
                              className="text-red-600 hover:text-red-700"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}  
    {/* Modal de Criação */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Nova Movimentação de Caixa"
        size="md"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense', category: '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="income">Entrada</option>
                <option value="expense">Saída</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Selecione uma categoria</option>
                {getCurrentCategories().map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição da movimentação"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0,00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forma de Pagamento *
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="cash">Dinheiro</option>
              <option value="card">Cartão</option>
              <option value="pix">PIX</option>
              <option value="bank_transfer">Transferência</option>
              <option value="check">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Observações sobre a movimentação..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              disabled={formLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmitCreate}
              disabled={formLoading || !formData.description || !formData.category || formData.amount <= 0}
              className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {formLoading && <LoadingSpinner size="sm" color="white" className="mr-2" />}
              Criar Movimentação
            </button>
          </div>
        </div>
      </Modal> 
     {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedMovement(null);
          resetForm();
        }}
        title="Editar Movimentação"
        size="md"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense', category: '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="income">Entrada</option>
                <option value="expense">Saída</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Selecione uma categoria</option>
                {getCurrentCategories().map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição da movimentação"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0,00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forma de Pagamento *
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="cash">Dinheiro</option>
              <option value="card">Cartão</option>
              <option value="pix">PIX</option>
              <option value="bank_transfer">Transferência</option>
              <option value="check">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Observações sobre a movimentação..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setShowEditModal(false);
                setSelectedMovement(null);
                resetForm();
              }}
              disabled={formLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmitEdit}
              disabled={formLoading || !formData.description || !formData.category || formData.amount <= 0}
              className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {formLoading && <LoadingSpinner size="sm" color="white" className="mr-2" />}
              Salvar Alterações
            </button>
          </div>
        </div>
      </Modal>      {/* M
odal de Detalhes */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedMovement(null);
        }}
        title="Detalhes da Movimentação"
        size="md"
      >
        {selectedMovement && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Informações Gerais</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tipo:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedMovement.type === 'income' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                      {selectedMovement.type === 'income' ? 'Entrada' : 'Saída'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Categoria:</span>
                    <span className="font-medium">{selectedMovement.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Descrição:</span>
                    <span className="font-medium">{selectedMovement.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Valor:</span>
                    <span className={`font-medium ${getMovementColor(selectedMovement.type)}`}>
                      {selectedMovement.type === 'income' ? '+' : '-'}{formatCurrency(selectedMovement.amount)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Detalhes do Pagamento</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Data:</span>
                    <span className="font-medium">{formatDate(selectedMovement.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Forma de Pagamento:</span>
                    <span className="font-medium">{formatPaymentMethod(selectedMovement.paymentMethod)}</span>
                  </div>
                  {selectedMovement.reference && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Referência:</span>
                      <span className="font-medium">{selectedMovement.reference}</span>
                    </div>
                  )}
                  {selectedMovement.user && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Usuário:</span>
                      <span className="font-medium">{selectedMovement.user.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedMovement.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Observações</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{selectedMovement.notes}</p>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Histórico</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Criado em:</span>
                  <span className="font-medium">{formatDateTime(selectedMovement.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};