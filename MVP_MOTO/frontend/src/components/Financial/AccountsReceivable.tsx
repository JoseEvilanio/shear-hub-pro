// Gestão de Contas a Receber
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState } from 'react';
import { AccountReceivable, PaymentData } from '@/services/financialService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import {
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  DollarSign,
  Clock,
} from 'lucide-react';

interface AccountsReceivableProps {
  accounts: AccountReceivable[];
  loading?: boolean;
  onReceivePayment?: (id: string, paymentData: PaymentData) => Promise<boolean>;
  onEditAccount?: (account: AccountReceivable) => void;
  onCancelAccount?: (id: string, reason?: string) => Promise<void>;
  formatStatus: (status: string) => string;
  getStatusColor: (status: string) => string;
  formatPaymentMethod: (method: string) => string;
  isOverdue: (dueDate: string) => boolean;
  getDaysLate: (dueDate: string) => number;
  calculateLateFee: (amount: number, daysLate: number) => { fine: number; interest: number; total: number };
}

export const AccountsReceivable: React.FC<AccountsReceivableProps> = ({
  accounts,
  loading = false,
  onReceivePayment,
  onEditAccount,
  formatStatus,
  getStatusColor,
  isOverdue,
  getDaysLate,
  calculateLateFee,
}) => {
  const [selectedAccount, setSelectedAccount] = useState<AccountReceivable | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    paymentDate: new Date().toISOString().split('T')[0],
    amount: 0,
    paymentMethod: 'cash',
    notes: '',
  });
  const [paymentLoading, setPaymentLoading] = useState(false);

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

  const handleReceivePayment = (account: AccountReceivable) => {
    setSelectedAccount(account);
    const daysLate = isOverdue(account.dueDate) ? getDaysLate(account.dueDate) : 0;
    const lateFee = daysLate > 0 ? calculateLateFee(account.amount, daysLate) : null;
    
    setPaymentData({
      paymentDate: new Date().toISOString().split('T')[0],
      amount: lateFee ? lateFee.total : account.amount,
      paymentMethod: 'cash',
      notes: lateFee ? `Recebimento com ${daysLate} dias de atraso. Multa: ${formatCurrency(lateFee.fine)}, Juros: ${formatCurrency(lateFee.interest)}` : '',
    });
    setShowPaymentModal(true);
  };

  const handleViewDetails = (account: AccountReceivable) => {
    setSelectedAccount(account);
    setShowDetailsModal(true);
  };

  const handleSubmitPayment = async () => {
    if (!selectedAccount || !onReceivePayment) return;

    try {
      setPaymentLoading(true);
      await onReceivePayment(selectedAccount.id, paymentData);
      setShowPaymentModal(false);
      setSelectedAccount(null);
    } catch (error) {
      console.error('Erro ao processar recebimento:', error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return CheckCircle;
      case 'overdue':
        return AlertTriangle;
      case 'cancelled':
        return XCircle;
      default:
        return Clock;
    }
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
      {/* Lista de Contas */}
      {accounts.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma conta a receber
          </h3>
          <p className="text-gray-500">
            Não há contas a receber cadastradas.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts.map((account) => {
                  const StatusIcon = getStatusIcon(account.status);
                  const overdue = isOverdue(account.dueDate) && account.status === 'pending';
                  const daysLate = overdue ? getDaysLate(account.dueDate) : 0;

                  return (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {account.description}
                          </div>
                          {account.installment && account.totalInstallments && (
                            <div className="text-sm text-gray-500">
                              Parcela {account.installment}/{account.totalInstallments}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {account.client?.name || 'N/A'}
                        </div>
                        {account.client?.cpf && (
                          <div className="text-sm text-gray-500">
                            CPF: {account.client.cpf}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(account.amount)}
                        </div>
                        {overdue && (
                          <div className="text-sm text-red-600">
                            + {formatCurrency(calculateLateFee(account.amount, daysLate).total - account.amount)} (juros/multa)
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(account.dueDate)}
                        </div>
                        {overdue && (
                          <div className="text-sm text-red-600">
                            {daysLate} dias de atraso
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <StatusIcon className={`w-4 h-4 mr-2 ${overdue ? 'text-red-600' : getStatusColor(account.status).split(' ')[0]}`} />
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${overdue ? 'text-red-600 bg-red-50' : getStatusColor(account.status)}`}>
                            {overdue ? 'Em Atraso' : formatStatus(account.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(account)}
                            className="text-primary-600 hover:text-primary-700"
                            title="Ver Detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {account.status === 'pending' && onEditAccount && (
                            <button
                              onClick={() => onEditAccount(account)}
                              className="text-gray-600 hover:text-gray-700"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          
                          {account.status === 'pending' && onReceivePayment && (
                            <button
                              onClick={() => handleReceivePayment(account)}
                              className="text-green-600 hover:text-green-700"
                              title="Receber"
                            >
                              <DollarSign className="w-4 h-4" />
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
      )}      {
/* Modal de Recebimento */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedAccount(null);
        }}
        title="Registrar Recebimento"
        size="md"
      >
        {selectedAccount && (
          <div className="space-y-6">
            {/* Informações da Conta */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                {selectedAccount.description}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Valor Original:</span>
                  <p className="font-medium">{formatCurrency(selectedAccount.amount)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Vencimento:</span>
                  <p className="font-medium">{formatDate(selectedAccount.dueDate)}</p>
                </div>
              </div>
              
              {selectedAccount.installment && selectedAccount.totalInstallments && (
                <div className="mt-2">
                  <span className="text-gray-500">Parcela:</span>
                  <p className="font-medium">{selectedAccount.installment}/{selectedAccount.totalInstallments}</p>
                </div>
              )}
              
              {isOverdue(selectedAccount.dueDate) && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-800">
                      Conta em atraso - {getDaysLate(selectedAccount.dueDate)} dias
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Formulário de Recebimento */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data do Recebimento *
                  </label>
                  <input
                    type="date"
                    value={paymentData.paymentDate}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor Recebido *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forma de Recebimento *
                </label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value as any })}
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
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Observações sobre o recebimento..."
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedAccount(null);
                }}
                disabled={paymentLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitPayment}
                disabled={paymentLoading || paymentData.amount <= 0}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {paymentLoading && <LoadingSpinner size="sm" color="white" className="mr-2" />}
                Confirmar Recebimento
              </button>
            </div>
          </div>
        )}
      </Modal>      {/* Mo
dal de Detalhes */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedAccount(null);
        }}
        title="Detalhes da Conta"
        size="lg"
      >
        {selectedAccount && (
          <div className="space-y-6">
            {/* Informações Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Informações Gerais</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Descrição:</span>
                    <span className="font-medium">{selectedAccount.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Valor:</span>
                    <span className="font-medium">{formatCurrency(selectedAccount.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vencimento:</span>
                    <span className="font-medium">{formatDate(selectedAccount.dueDate)}</span>
                  </div>
                  {selectedAccount.installment && selectedAccount.totalInstallments && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Parcela:</span>
                      <span className="font-medium">{selectedAccount.installment}/{selectedAccount.totalInstallments}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedAccount.status)}`}>
                      {formatStatus(selectedAccount.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Cliente</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nome:</span>
                    <span className="font-medium">{selectedAccount.client?.name || 'N/A'}</span>
                  </div>
                  {selectedAccount.client?.cpf && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">CPF:</span>
                      <span className="font-medium">{selectedAccount.client.cpf}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Informações de Recebimento */}
            {selectedAccount.status === 'paid' && selectedAccount.paymentDate && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Informações de Recebimento</h4>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Data do Recebimento:</span>
                      <span className="font-medium">{formatDate(selectedAccount.paymentDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Observações */}
            {selectedAccount.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Observações</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{selectedAccount.notes}</p>
                </div>
              </div>
            )}

            {/* Referência */}
            {selectedAccount.reference && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Referência</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{selectedAccount.reference}</p>
                </div>
              </div>
            )}

            {/* Datas */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Histórico</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Criado em:</span>
                  <span className="font-medium">{formatDateTime(selectedAccount.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Atualizado em:</span>
                  <span className="font-medium">{formatDateTime(selectedAccount.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};