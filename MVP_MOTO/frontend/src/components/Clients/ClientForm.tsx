// Formulário de Cliente
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Client } from '@/types';
import { clientService } from '@/services/clientService';
import { User, Phone, Mail, Calendar, MapPin, FileText } from 'lucide-react';

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => Promise<void>;
  client?: Client | null;
  loading?: boolean;
}

export interface ClientFormData {
  name: string;
  cpf: string;
  phone: string;
  email: string;
  birthDate: string;
  address: string;
  notes: string;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  client,
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClientFormData>();

  const cpfValue = watch('cpf');
  const phoneValue = watch('phone');

  // Resetar formulário quando modal abrir/fechar ou cliente mudar
  useEffect(() => {
    if (isOpen) {
      if (client) {
        reset({
          name: client.name || '',
          cpf: client.cpf || '',
          phone: client.phone || '',
          email: client.email || '',
          birthDate: client.birthDate ? client.birthDate.split('T')[0] : '',
          address: client.address || '',
          notes: client.notes || '',
        });
      } else {
        reset({
          name: '',
          cpf: '',
          phone: '',
          email: '',
          birthDate: '',
          address: '',
          notes: '',
        });
      }
    }
  }, [isOpen, client, reset]);

  // Formatação automática do CPF
  useEffect(() => {
    if (cpfValue) {
      const formatted = clientService.formatCpf(cpfValue);
      if (formatted !== cpfValue) {
        setValue('cpf', formatted);
      }
    }
  }, [cpfValue, setValue]);

  // Formatação automática do telefone
  useEffect(() => {
    if (phoneValue) {
      const formatted = clientService.formatPhone(phoneValue);
      if (formatted !== phoneValue) {
        setValue('phone', formatted);
      }
    }
  }, [phoneValue, setValue]);

  const handleFormSubmit = async (data: ClientFormData) => {
    await onSubmit(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={client ? 'Editar Cliente' : 'Novo Cliente'}
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Nome */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Nome Completo *
          </label>
          <input
            {...register('name', {
              required: 'Nome é obrigatório',
              minLength: {
                value: 2,
                message: 'Nome deve ter pelo menos 2 caracteres',
              },
            })}
            type="text"
            id="name"
            placeholder="Digite o nome completo"
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* CPF e Telefone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-2">
              CPF
            </label>
            <input
              {...register('cpf', {
                validate: (value) => {
                  if (!value) return true; // CPF é opcional
                  return clientService.validateCpf(value) || 'CPF inválido';
                },
              })}
              type="text"
              id="cpf"
              placeholder="000.000.000-00"
              maxLength={14}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
            />
            {errors.cpf && (
              <p className="mt-1 text-sm text-red-600">{errors.cpf.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Telefone
            </label>
            <input
              {...register('phone')}
              type="tel"
              id="phone"
              placeholder="(00) 00000-0000"
              maxLength={15}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Email e Data de Nascimento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <input
              {...register('email', {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido',
                },
              })}
              type="email"
              id="email"
              placeholder="cliente@email.com"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Data de Nascimento
            </label>
            <input
              {...register('birthDate')}
              type="date"
              id="birthDate"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
            />
            {errors.birthDate && (
              <p className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>
            )}
          </div>
        </div>

        {/* Endereço */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Endereço
          </label>
          <textarea
            {...register('address')}
            id="address"
            rows={2}
            placeholder="Rua, número, bairro, cidade - UF"
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 resize-none"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
          )}
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
            placeholder="Observações adicionais sobre o cliente..."
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 resize-none"
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
          )}
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
            disabled={loading}
            className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading && <LoadingSpinner size="sm" color="white" className="mr-2" />}
            {client ? 'Atualizar' : 'Criar'} Cliente
          </button>
        </div>
      </form>
    </Modal>
  );
};