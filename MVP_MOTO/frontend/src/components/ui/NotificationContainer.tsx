// Container de Notificações
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { removeNotification } from '@/store/slices/uiSlice';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/utils/cn';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-400',
    title: 'text-green-800',
    message: 'text-green-700',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-400',
    title: 'text-red-800',
    message: 'text-red-700',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-400',
    title: 'text-yellow-800',
    message: 'text-yellow-700',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-400',
    title: 'text-blue-800',
    message: 'text-blue-700',
  },
};

export const NotificationContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.ui.notifications);

  useEffect(() => {
    // Auto-remover notificações após o tempo especificado
    notifications.forEach((notification) => {
      if (notification.duration !== 0) {
        const duration = notification.duration || 5000;
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, duration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, dispatch]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4 max-w-sm w-full">
      {notifications.map((notification) => {
        const Icon = iconMap[notification.type];
        const colors = colorMap[notification.type];

        return (
          <div
            key={notification.id}
            className={cn(
              'relative p-4 rounded-lg border shadow-lg',
              'transform transition-all duration-300 ease-in-out',
              'animate-slide-in',
              colors.bg,
              colors.border
            )}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Icon className={cn('w-5 h-5', colors.icon)} />
              </div>
              
              <div className="ml-3 flex-1">
                <h3 className={cn('text-sm font-medium', colors.title)}>
                  {notification.title}
                </h3>
                {notification.message && (
                  <p className={cn('mt-1 text-sm', colors.message)}>
                    {notification.message}
                  </p>
                )}
              </div>
              
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => dispatch(removeNotification(notification.id))}
                  className={cn(
                    'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                    'hover:bg-white hover:bg-opacity-20',
                    colors.icon
                  )}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Progress bar para notificações com duração */}
            {notification.duration && notification.duration > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white bg-opacity-30 rounded-b-lg overflow-hidden">
                <div
                  className={cn('h-full transition-all ease-linear', {
                    'bg-green-400': notification.type === 'success',
                    'bg-red-400': notification.type === 'error',
                    'bg-yellow-400': notification.type === 'warning',
                    'bg-blue-400': notification.type === 'info',
                  })}
                  style={{
                    animation: `shrink ${notification.duration}ms linear forwards`,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}

    </div>
  );
};