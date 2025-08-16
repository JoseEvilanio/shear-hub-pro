// Modal de Alteração de Senha
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '@/store';
import { changePasswordAsync } from '@/store/slices/authSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { Modal } from '@/components/ui/Modal';
import { AuthFeedback } from './AuthFeedback';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordForm>();

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ChangePasswordForm) => {
    try {
      setLoading(true);
      setError(null);

      if (data.newPassword !== data.confirmPassword) {
        setError('As senhas não coincidem');
        return;
      }

      if (data.currentPassword === data.newPassword) {
        setError('A nova senha deve ser diferente da senha atual');
        return;
      }

      await dispatch(changePasswordAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })).unwrap();

      dispatch(addNotification({
        type: 'success',
        title: 'Senha alterada',
        message: 'Sua senha foi alterada com sucesso',
      }));

      reset();
      onClose();
    } catch (err: any) {
      setError(err || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Alterar Senha"
      size="md"
    >
      <div className="space-y-6">
        {error && (
          <AuthFeedback
            type="error"
            title="Erro ao alterar senha"
            message={error}
          />
        )}

        <div className="text-sm text-gray-600">
          <p className="mb-2">Sua nova senha deve atender aos seguintes critérios:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Pelo menos 6 caracteres</li>
            <li>Pelo menos 1 letra minúscula</li>
            <li>Pelo menos 1 letra maiúscula</li>
            <li>Pelo menos 1 número</li>
            <li>Pelo menos 1 caractere especial (@$!%*?&)</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              Senha Atual <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              {...register('currentPassword', {
                required: 'Senha atual é obrigatória',
                minLength: {
                  value: 6,
                  message: 'Senha deve ter pelo menos 6 caracteres',
                },
              })}
              type="password"
              id="currentPassword"
              placeholder="Digite sua senha atual"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
            />
            {errors.currentPassword && (
              <p className="text-sm text-red-600">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              Nova Senha <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              {...register('newPassword', {
                required: 'Nova senha é obrigatória',
                minLength: {
                  value: 6,
                  message: 'Senha deve ter pelo menos 6 caracteres',
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                  message: 'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial',
                },
              })}
              type="password"
              id="newPassword"
              placeholder="Digite a nova senha"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
            />
            {errors.newPassword && (
              <p className="text-sm text-red-600">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar Nova Senha <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              {...register('confirmPassword', {
                required: 'Confirmação de senha é obrigatória',
                validate: (value: string) =>
                  value === newPassword || 'As senhas não coincidem',
              })}
              type="password"
              id="confirmPassword"
              placeholder="Digite a nova senha novamente"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

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
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};