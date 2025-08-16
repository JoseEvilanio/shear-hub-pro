// Configurações Gerais do Sistema
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState } from 'react';
import { SystemSettings as SystemSettingsData, UpdateSystemSettings } from '@/services/settingsService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  Building,
  Palette,
  Globe,
  Clock,
  Shield,
  Upload,
  X,
  Save,
  Image,
} from 'lucide-react';

interface SystemSettingsProps {
  data: SystemSettingsData | null;
  loading?: boolean;
  onUpdate?: (data: UpdateSystemSettings) => Promise<boolean>;
  onUploadLogo?: (file: File) => Promise<boolean>;
  onUploadBackground?: (file: File) => Promise<boolean>;
  onRemoveLogo?: () => Promise<boolean>;
  onRemoveBackground?: () => Promise<boolean>;
  getAvailableThemes: () => Array<{ value: string; label: string }>;
  getAvailableLanguages: () => Array<{ value: string; label: string }>;
  getAvailableTimezones: () => Array<{ value: string; label: string }>;
  getAvailableDateFormats: () => Array<{ value: string; label: string }>;
  getAvailableCurrencies: () => Array<{ value: string; label: string }>;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({
  data,
  loading = false,
  onUpdate,
  onUploadLogo,
  onUploadBackground,
  onRemoveLogo,
  onRemoveBackground,
  getAvailableThemes,
  getAvailableLanguages,
  getAvailableTimezones,
  getAvailableDateFormats,
  getAvailableCurrencies,
}) => {
  const [formData, setFormData] = useState<UpdateSystemSettings>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'logo' | 'background' | null>(null);

  // Atualizar formData quando data mudar
  React.useEffect(() => {
    if (data) {
      setFormData({
        companyName: data.companyName,
        companyDocument: data.companyDocument,
        companyPhone: data.companyPhone,
        companyEmail: data.companyEmail,
        companyAddress: data.companyAddress,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        theme: data.theme,
        language: data.language,
        timezone: data.timezone,
        currency: data.currency,
        dateFormat: data.dateFormat,
        timeFormat: data.timeFormat,
        enableNotifications: data.enableNotifications,
        enableBackup: data.enableBackup,
        backupFrequency: data.backupFrequency,
        maxFileSize: data.maxFileSize,
        sessionTimeout: data.sessionTimeout,
        passwordPolicy: { ...data.passwordPolicy },
      });
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdate) return;

    try {
      setSaving(true);
      await onUpdate(formData);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'background') => {
    if (!file) return;

    try {
      setUploading(type);
      
      if (type === 'logo' && onUploadLogo) {
        await onUploadLogo(file);
      } else if (type === 'background' && onUploadBackground) {
        await onUploadBackground(file);
      }
    } finally {
      setUploading(null);
    }
  };

  const handleRemoveImage = async (type: 'logo' | 'background') => {
    if (type === 'logo' && onRemoveLogo) {
      await onRemoveLogo();
    } else if (type === 'background' && onRemoveBackground) {
      await onRemoveBackground();
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Informações da Empresa */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Building className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Informações da Empresa</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Empresa *
            </label>
            <input
              type="text"
              value={formData.companyName || ''}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CNPJ/CPF
            </label>
            <input
              type="text"
              value={formData.companyDocument || ''}
              onChange={(e) => setFormData({ ...formData, companyDocument: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone
            </label>
            <input
              type="text"
              value={formData.companyPhone || ''}
              onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail
            </label>
            <input
              type="email"
              value={formData.companyEmail || ''}
              onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endereço
            </label>
            <textarea
              value={formData.companyAddress || ''}
              onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>

      {/* Personalização Visual */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Palette className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Personalização Visual</h3>
        </div>

        {/* Logo e Fundo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo da Empresa
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {data?.logoUrl ? (
                <div className="relative">
                  <img
                    src={data.logoUrl}
                    alt="Logo da empresa"
                    className="max-h-32 mx-auto"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage('logo')}
                    className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Nenhum logo carregado</p>
                </div>
              )}
              
              <div className="mt-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'logo');
                  }}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  {uploading === 'logo' ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {uploading === 'logo' ? 'Enviando...' : 'Carregar Logo'}
                </label>
              </div>
            </div>
          </div>

          {/* Fundo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fundo de Tela
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {data?.backgroundUrl ? (
                <div className="relative">
                  <img
                    src={data.backgroundUrl}
                    alt="Fundo de tela"
                    className="max-h-32 w-full object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage('background')}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Nenhum fundo carregado</p>
                </div>
              )}
              
              <div className="mt-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'background');
                  }}
                  className="hidden"
                  id="background-upload"
                />
                <label
                  htmlFor="background-upload"
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  {uploading === 'background' ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {uploading === 'background' ? 'Enviando...' : 'Carregar Fundo'}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Cores e Tema */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cor Primária
            </label>
            <input
              type="color"
              value={formData.primaryColor || '#3B82F6'}
              onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cor Secundária
            </label>
            <input
              type="color"
              value={formData.secondaryColor || '#10B981'}
              onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tema
            </label>
            <select
              value={formData.theme || 'light'}
              onChange={(e) => setFormData({ ...formData, theme: e.target.value as 'light' | 'dark' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {getAvailableThemes().map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {theme.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Configurações Regionais */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Globe className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Configurações Regionais</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Idioma
            </label>
            <select
              value={formData.language || 'pt-BR'}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {getAvailableLanguages().map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fuso Horário
            </label>
            <select
              value={formData.timezone || 'America/Sao_Paulo'}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {getAvailableTimezones().map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moeda
            </label>
            <select
              value={formData.currency || 'BRL'}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {getAvailableCurrencies().map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formato de Data
            </label>
            <select
              value={formData.dateFormat || 'DD/MM/YYYY'}
              onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {getAvailableDateFormats().map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formato de Hora
            </label>
            <select
              value={formData.timeFormat || '24h'}
              onChange={(e) => setFormData({ ...formData, timeFormat: e.target.value as '12h' | '24h' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="24h">24 horas (14:30)</option>
              <option value="12h">12 horas (2:30 PM)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Botão de Salvar */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? (
            <LoadingSpinner size="sm" color="white" className="mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </form>
  );
};