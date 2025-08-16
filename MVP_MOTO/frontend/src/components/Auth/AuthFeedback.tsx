// Componente de Feedback de Autenticação
// Sistema de Gestão de Oficina Mecânica de Motos

import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface AuthFeedbackProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  className?: string;
}

const feedbackConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-500',
    titleColor: 'text-green-800',
    messageColor: 'text-green-700',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-500',
    titleColor: 'text-red-800',
    messageColor: 'text-red-700',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-500',
    titleColor: 'text-yellow-800',
    messageColor: 'text-yellow-700',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-800',
    messageColor: 'text-blue-700',
  },
};

export const AuthFeedback: React.FC<AuthFeedbackProps> = ({
  type,
  title,
  message,
  className,
}) => {
  const config = feedbackConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className="flex items-start">
        <Icon className={cn('w-5 h-5 mt-0.5 mr-3 flex-shrink-0', config.iconColor)} />
        <div className="flex-1">
          <h3 className={cn('text-sm font-medium', config.titleColor)}>
            {title}
          </h3>
          <p className={cn('text-sm mt-1', config.messageColor)}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};