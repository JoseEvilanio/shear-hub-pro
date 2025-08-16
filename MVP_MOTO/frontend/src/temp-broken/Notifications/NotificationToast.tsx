// Toast de Notificação
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useEffect, useState } from 'react';
import { Notification } from '@/services/notificationService';
import {
  X,
  Bell,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
  onMarkAsRead?: (id: string) => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  formatRelativeTime: (date: string) => string;
  getTypeColor: (type: string) => string;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  onMarkAsRead,
  autoClose = true,
  autoCloseDelay = 5000,
  formatRelativeTime,
  getTypeColor,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Animação de entrada
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!autoClose || notification.priority === 'urgent') return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (autoCloseDelay / 100));
        if (newProgress <= 0) {
          handleClose();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [autoClose, autoCloseDelay, notification.priority]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Aguarda animação de saída
  };

  const handleMarkAsRead = () => {
    if (onMarkAsRead && !notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleActionClick = () => {
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank');
      handleMarkAsRead();
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'info':
        return Info;
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'error':
        return XCircle;
      case 'reminder':
        return Clock;
      default:
        return Bell;
    }\n  };\n\n  const getBackgroundColor = () => {\n    switch (notification.type) {\n      case 'info':\n        return 'bg-blue-50 border-blue-200';\n      case 'success':\n        return 'bg-green-50 border-green-200';\n      case 'warning':\n        return 'bg-yellow-50 border-yellow-200';\n      case 'error':\n        return 'bg-red-50 border-red-200';\n      case 'reminder':\n        return 'bg-purple-50 border-purple-200';\n      default:\n        return 'bg-gray-50 border-gray-200';\n    }\n  };\n\n  const getProgressColor = () => {\n    switch (notification.type) {\n      case 'info':\n        return 'bg-blue-500';\n      case 'success':\n        return 'bg-green-500';\n      case 'warning':\n        return 'bg-yellow-500';\n      case 'error':\n        return 'bg-red-500';\n      case 'reminder':\n        return 'bg-purple-500';\n      default:\n        return 'bg-gray-500';\n    }\n  };\n\n  const Icon = getIcon();\n\n  return (\n    <div\n      className={`transform transition-all duration-300 ease-in-out ${\n        isVisible\n          ? 'translate-x-0 opacity-100'\n          : 'translate-x-full opacity-0'\n      }`}\n    >\n      <div className={`max-w-sm w-full ${getBackgroundColor()} border rounded-lg shadow-lg pointer-events-auto overflow-hidden`}>\n        {/* Barra de Progresso */}\n        {autoClose && notification.priority !== 'urgent' && (\n          <div className=\"h-1 bg-gray-200\">\n            <div\n              className={`h-full transition-all duration-100 ease-linear ${getProgressColor()}`}\n              style={{ width: `${progress}%` }}\n            />\n          </div>\n        )}\n\n        <div className=\"p-4\">\n          <div className=\"flex items-start\">\n            {/* Ícone */}\n            <div className=\"flex-shrink-0\">\n              <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>\n                <Icon className=\"w-5 h-5\" />\n              </div>\n            </div>\n\n            {/* Conteúdo */}\n            <div className=\"ml-3 w-0 flex-1\">\n              <div className=\"flex items-start justify-between\">\n                <div className=\"flex-1\">\n                  <p className=\"text-sm font-medium text-gray-900\">\n                    {notification.title}\n                  </p>\n                  <p className=\"mt-1 text-sm text-gray-600\">\n                    {notification.message}\n                  </p>\n                  \n                  {/* Metadados */}\n                  <div className=\"mt-2 flex items-center space-x-2 text-xs text-gray-500\">\n                    <span className={`px-2 py-1 rounded-full ${getTypeColor(notification.type)}`}>\n                      {notification.priority === 'urgent' ? '🚨' : ''}\n                      {notification.category === 'birthday' ? '🎂' : ''}\n                      {notification.category === 'service_order' ? '🔧' : ''}\n                      {notification.category === 'payment' ? '💰' : ''}\n                      {notification.category === 'inventory' ? '📦' : ''}\n                      {notification.category === 'financial' ? '📊' : ''}\n                    </span>\n                    <span>\n                      {formatRelativeTime(notification.createdAt)}\n                    </span>\n                  </div>\n                </div>\n\n                {/* Botão Fechar */}\n                <button\n                  onClick={handleClose}\n                  className=\"ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded\"\n                >\n                  <X className=\"w-4 h-4\" />\n                </button>\n              </div>\n\n              {/* Ações */}\n              <div className=\"mt-3 flex items-center space-x-2\">\n                {notification.actionUrl && (\n                  <button\n                    onClick={handleActionClick}\n                    className=\"flex items-center px-3 py-1 text-xs font-medium text-primary-700 bg-primary-100 rounded-lg hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500\"\n                  >\n                    <ExternalLink className=\"w-3 h-3 mr-1\" />\n                    Ver Detalhes\n                  </button>\n                )}\n\n                {!notification.isRead && onMarkAsRead && (\n                  <button\n                    onClick={handleMarkAsRead}\n                    className=\"px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500\"\n                  >\n                    Marcar como Lida\n                  </button>\n                )}\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  );\n};\n\n// Container para múltiplos toasts\ninterface NotificationToastContainerProps {\n  notifications: Notification[];\n  onClose: (id: string) => void;\n  onMarkAsRead?: (id: string) => void;\n  maxToasts?: number;\n  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';\n  formatRelativeTime: (date: string) => string;\n  getTypeColor: (type: string) => string;\n}\n\nexport const NotificationToastContainer: React.FC<NotificationToastContainerProps> = ({\n  notifications,\n  onClose,\n  onMarkAsRead,\n  maxToasts = 5,\n  position = 'top-right',\n  formatRelativeTime,\n  getTypeColor,\n}) => {\n  const getPositionClasses = () => {\n    switch (position) {\n      case 'top-left':\n        return 'top-4 left-4';\n      case 'bottom-right':\n        return 'bottom-4 right-4';\n      case 'bottom-left':\n        return 'bottom-4 left-4';\n      default:\n        return 'top-4 right-4';\n    }\n  };\n\n  // Mostrar apenas os toasts mais recentes\n  const visibleNotifications = notifications.slice(0, maxToasts);\n\n  if (visibleNotifications.length === 0) {\n    return null;\n  }\n\n  return (\n    <div className={`fixed ${getPositionClasses()} z-50 space-y-4 pointer-events-none`}>\n      {visibleNotifications.map((notification) => (\n        <NotificationToast\n          key={notification.id}\n          notification={notification}\n          onClose={() => onClose(notification.id)}\n          onMarkAsRead={onMarkAsRead}\n          formatRelativeTime={formatRelativeTime}\n          getTypeColor={getTypeColor}\n        />\n      ))}\n      \n      {/* Indicador de mais notificações */}\n      {notifications.length > maxToasts && (\n        <div className=\"max-w-sm w-full bg-gray-100 border border-gray-200 rounded-lg shadow-lg pointer-events-auto\">\n          <div className=\"p-3 text-center\">\n            <p className=\"text-sm text-gray-600\">\n              +{notifications.length - maxToasts} notificações adicionais\n            </p>\n            <button\n              onClick={() => {\n                // Aqui você pode abrir o centro de notificações\n                // ou implementar outra ação\n                console.log('Abrir centro de notificações');\n              }}\n              className=\"mt-1 text-xs text-primary-600 hover:text-primary-700 font-medium\"\n            >\n              Ver todas\n            </button>\n          </div>\n        </div>\n      )}\n    </div>\n  );\n};