// Página de Login
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/store';
import { loginAsync, clearError } from '@/store/slices/authSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { Eye, EyeOff, Wrench, Mail, Lock } from 'lucide-react';
import { ButtonLoading } from '@/components/ui/LoadingSpinner';
import { AuthFeedback } from '@/components/Auth/AuthFeedback';
import { cn } from '@/utils/cn';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      dispatch(clearError());
      
      const result = await dispatch(loginAsync({
        email: data.email,
        password: data.password,
      })).unwrap();

      dispatch(addNotification({
        type: 'success',
        title: 'Login realizado com sucesso',
        message: `Bem-vindo, ${result.user.name}!`,
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Erro no login',
        message: error as string,
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <Wrench className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sistema de Gestão
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Oficina Mecânica de Motos
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', {
                    required: 'Email é obrigatório',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido',
                    },
                  })}
                  type="email"
                  autoComplete="email"
                  className={cn(
                    'block w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                    'placeholder-gray-400',
                    errors.email
                      ? 'border-red-300 text-red-900 placeholder-red-300'
                      : 'border-gray-300 text-gray-900'
                  )}
                  placeholder="Digite seu email"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', {
                    required: 'Senha é obrigatória',
                    minLength: {
                      value: 6,
                      message: 'Senha deve ter pelo menos 6 caracteres',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={cn(
                    'block w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                    'placeholder-gray-400',
                    errors.password
                      ? 'border-red-300 text-red-900 placeholder-red-300'
                      : 'border-gray-300 text-gray-900'
                  )}
                  placeholder="Digite sua senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  {...register('rememberMe')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                  Lembrar de mim
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-primary-600 hover:text-primary-500"
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch(addNotification({
                      type: 'info',
                      title: 'Recuperação de senha',
                      message: 'Entre em contato com o administrador do sistema',
                    }));
                  }}
                >
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <AuthFeedback
                type="error"
                title="Erro no login"
                message={error}
              />
            )}

            {/* Submit Button */}
            <div>
              <ButtonLoading
                type="submit"
                loading={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </ButtonLoading>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-3">Credenciais de demonstração:</p>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="bg-gray-50 p-2 rounded">
                  <strong>Admin:</strong> admin@oficina.com / admin123
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <strong>Gerente:</strong> gerente@oficina.com / admin123
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <strong>Operador:</strong> operador@oficina.com / admin123
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2024 Sistema de Gestão de Oficina de Motos
          </p>
        </div>
      </div>
    </div>
  );
};