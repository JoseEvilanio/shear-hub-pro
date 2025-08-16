// Configurações de Notificações
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState } from 'react';
import { NotificationSettings } from '@/services/notificationService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Clock,
  Save,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface NotificationSettingsProps {
  settings: NotificationSettings | null;
  loading?: boolean;
  onSave: (settings: Partial<NotificationSettings>) => Promise<boolean>;
  onRequestPushPermission: () => Promise<boolean>;
}

export const NotificationSettingsComponent: React.FC<NotificationSettingsProps> = ({
  settings,
  loading = false,
  onSave,
  onRequestPushPermission,
}) => {
  const [formData, setFormData] = useState<Partial<NotificationSettings>>(
    settings || {}
  );
  const [saving, setSaving] = useState(false);
  const [pushPermissionStatus, setPushPermissionStatus] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'unsupported'
  );

  React.useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    const success = await onSave(formData);
    setSaving(false);
    
    if (success && settings) {
      // Atualizar dados locais
      setFormData({ ...settings, ...formData });
    }
  };

  const handleRequestPushPermission = async () => {
    const granted = await onRequestPushPermission();
    setPushPermissionStatus(granted ? 'granted' : 'denied');
    
    if (granted) {
      setFormData(prev => ({ ...prev, pushNotifications: true }));
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent: string, field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...((prev as any)[parent] || {}),
        [field]: value,
      },
    }));
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
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Configurações de Notificações
            </h2>
            <p className="text-gray-600 mt-1">
              Configure como e quando você deseja receber notificações
            </p>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Configurações
          </button>
        </div>
      </div>

      {/* Canais de Notificação */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Canais de Notificação
        </h3>
        
        <div className="space-y-4">
          {/* Email */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <h4 className="font-medium text-gray-900">Email</h4>
                <p className="text-sm text-gray-500">
                  Receber notificações por email
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.emailNotifications || false}
                onChange={(e) => updateFormData('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-500" />
              <div>
                <h4 className="font-medium text-gray-900">Notificações Push</h4>
                <p className="text-sm text-gray-500">
                  Receber notificações no navegador
                </p>
                {pushPermissionStatus === 'denied' && (
                  <p className="text-xs text-red-500 mt-1">
                    Permissão negada. Habilite nas configurações do navegador.
                  </p>
                )}
                {pushPermissionStatus === 'unsupported' && (
                  <p className="text-xs text-yellow-500 mt-1">
                    Não suportado neste navegador.
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {pushPermissionStatus === 'default' && (
                <button
                  onClick={handleRequestPushPermission}
                  className="px-3 py-1 text-xs bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200"
                >
                  Permitir
                </button>
              )}
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pushNotifications || false}
                  onChange={(e) => updateFormData('pushNotifications', e.target.checked)}
                  disabled={pushPermissionStatus !== 'granted'}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 disabled:opacity-50"></div>
              </label>
            </div>
          </div>

          {/* SMS */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-gray-500" />
              <div>
                <h4 className="font-medium text-gray-900">SMS</h4>
                <p className="text-sm text-gray-500">
                  Receber notificações por SMS (em breve)
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.smsNotifications || false}
                onChange={(e) => updateFormData('smsNotifications', e.target.checked)}
                disabled={true}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 opacity-50"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Categorias de Notificação */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Categorias de Notificação
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'system', label: 'Sistema', description: 'Atualizações e manutenções' },
            { key: 'birthday', label: 'Aniversários', description: 'Aniversários de clientes' },
            { key: 'service_order', label: 'Ordens de Serviço', description: 'Status de OS e prazos' },
            { key: 'payment', label: 'Pagamentos', description: 'Vencimentos e recebimentos' },
            { key: 'inventory', label: 'Estoque', description: 'Produtos em falta' },
            { key: 'financial', label: 'Financeiro', description: 'Relatórios e alertas' },
          ].map((category) => (
            <div key={category.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{category.label}</h4>
                <p className="text-sm text-gray-500">{category.description}</p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.categories?.[category.key as keyof typeof formData.categories] || false}
                  onChange={(e) => updateNestedField('categories', category.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Prioridades */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Prioridades de Notificação
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'low', label: 'Baixa', description: 'Informações gerais', color: 'text-gray-600' },
            { key: 'medium', label: 'Média', description: 'Informações importantes', color: 'text-blue-600' },
            { key: 'high', label: 'Alta', description: 'Requer atenção', color: 'text-orange-600' },
            { key: 'urgent', label: 'Urgente', description: 'Ação imediata necessária', color: 'text-red-600' },
          ].map((priority) => (
            <div key={priority.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className={`font-medium ${priority.color}`}>{priority.label}</h4>
                <p className="text-sm text-gray-500">{priority.description}</p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.priorities?.[priority.key as keyof typeof formData.priorities] || false}
                  onChange={(e) => updateNestedField('priorities', priority.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Horário Silencioso */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Horário Silencioso
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {formData.quietHours?.enabled ? (
                <VolumeX className="w-5 h-5 text-gray-500" />
              ) : (
                <Volume2 className="w-5 h-5 text-gray-500" />
              )}
              <div>
                <h4 className="font-medium text-gray-900">Ativar Horário Silencioso</h4>
                <p className="text-sm text-gray-500">
                  Não receber notificações durante este período
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.quietHours?.enabled || false}
                onChange={(e) => updateNestedField('quietHours', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          {formData.quietHours?.enabled && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Início
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="time"
                    value={formData.quietHours?.startTime || '22:00'}
                    onChange={(e) => updateNestedField('quietHours', 'startTime', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fim
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="time"
                    value={formData.quietHours?.endTime || '08:00'}
                    onChange={(e) => updateNestedField('quietHours', 'endTime', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};