// Configurações da Empresa
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState, useRef } from 'react';
import { CompanySettings as CompanySettingsData, UpdateCompanySettings } from '@/services/settingsService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  Building,
  Upload,
  Image,
  Palette,
  Phone,
  Mail,
  MapPin,
  Save,
} from 'lucide-react';

interface CompanySettingsProps {
  data: CompanySettingsData | null;
  loading?: boolean;
  uploadLoading?: boolean;
  onUpdate?: (data: UpdateCompanySettings) => Promise<boolean>;
  onUploadLogo?: (file: File) => Promise<boolean>;
  onUploadBackground?: (file: File) => Promise<boolean>;
  validateCNPJ: (cnpj: string) => boolean;
  formatCNPJ: (cnpj: string) => string;
  validateEmail: (email: string) => boolean;
  validateHexColor: (color: string) => boolean;
}

export const CompanySettings: React.FC<CompanySettingsProps> = ({
  data,
  loading = false,
  uploadLoading = false,
  onUpdate,
  onUploadLogo,
  onUploadBackground,
  validateCNPJ,
  formatCNPJ,
  validateEmail,
  validateHexColor,
}) => {
  const [formData, setFormData] = useState<UpdateCompanySettings>({
    name: data?.name || '',
    cnpj: data?.cnpj || '',
    phone: data?.phone || '',
    email: data?.email || '',
    address: data?.address || '',
    primaryColor: data?.primaryColor || '#3B82F6',
    secondaryColor: data?.secondaryColor || '#10B981',
    accentColor: data?.accentColor || '#F59E0B',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  // Atualizar form quando os dados mudarem
  React.useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || '',
        cnpj: data.cnpj || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        primaryColor: data.primaryColor || '#3B82F6',
        secondaryColor: data.secondaryColor || '#10B981',
        accentColor: data.accentColor || '#F59E0B',
      });
    }
  }, [data]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Nome da empresa é obrigatório';
    }

    if (formData.cnpj && !validateCNPJ(formData.cnpj)) {
      newErrors.cnpj = 'CNPJ inválido';
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.primaryColor && !validateHexColor(formData.primaryColor)) {
      newErrors.primaryColor = 'Cor primária inválida';
    }

    if (formData.secondaryColor && !validateHexColor(formData.secondaryColor)) {
      newErrors.secondaryColor = 'Cor secundária inválida';
    }

    if (formData.accentColor && !validateHexColor(formData.accentColor)) {
      newErrors.accentColor = 'Cor de destaque inválida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !onUpdate) return;

    try {
      setSaving(true);
      await onUpdate(formData);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadLogo) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setErrors({ logo: 'Apenas arquivos de imagem são permitidos' });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ logo: 'Arquivo muito grande. Máximo 5MB' });
      return;
    }

    setErrors({ ...errors, logo: '' });
    await onUploadLogo(file);
    
    // Limpar input
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadBackground) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setErrors({ background: 'Apenas arquivos de imagem são permitidos' });
      return;
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors({ background: 'Arquivo muito grande. Máximo 10MB' });
      return;
    }

    setErrors({ ...errors, background: '' });
    await onUploadBackground(file);
    
    // Limpar input
    if (backgroundInputRef.current) {
      backgroundInputRef.current.value = '';
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
      {/* Informações Básicas */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Building className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Informações da Empresa</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Empresa *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Nome da sua empresa"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CNPJ
              </label>
              <input
                type="text"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="00.000.000/0000-00"
              />
              {errors.cnpj && (
                <p className="mt-1 text-sm text-red-600">{errors.cnpj}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Telefone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="contato@empresa.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Endereço
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Endereço completo da empresa"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {saving && <LoadingSpinner size="sm" color="white" className="mr-2" />}
              <Save className="w-4 h-4 mr-2" />
              Salvar Informações
            </button>
          </div>
        </form>
      </div>

      {/* Upload de Logo e Fundo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Image className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Logo da Empresa</h3>
          </div>

          <div className="space-y-4">
            {data?.logoUrl && (
              <div className="flex justify-center">
                <img
                  src={data.logoUrl}
                  alt="Logo da empresa"
                  className="max-h-32 max-w-full object-contain border border-gray-200 rounded-lg"
                />
              </div>
            )}

            <div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadLoading}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {uploadLoading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {data?.logoUrl ? 'Alterar Logo' : 'Fazer Upload do Logo'}
              </button>
              {errors.logo && (
                <p className="mt-1 text-sm text-red-600">{errors.logo}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Formatos aceitos: JPG, PNG, GIF. Máximo 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Fundo de Tela */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Image className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Fundo de Tela</h3>
          </div>

          <div className="space-y-4">
            {data?.backgroundUrl && (
              <div className="flex justify-center">
                <img
                  src={data.backgroundUrl}
                  alt="Fundo de tela"
                  className="max-h-32 max-w-full object-cover border border-gray-200 rounded-lg"
                />
              </div>
            )}

            <div>
              <input
                ref={backgroundInputRef}
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => backgroundInputRef.current?.click()}
                disabled={uploadLoading}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {uploadLoading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {data?.backgroundUrl ? 'Alterar Fundo' : 'Fazer Upload do Fundo'}
              </button>
              {errors.background && (
                <p className="mt-1 text-sm text-red-600">{errors.background}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Formatos aceitos: JPG, PNG, GIF. Máximo 10MB.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cores do Sistema */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Palette className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Cores do Sistema</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor Primária
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="#3B82F6"
                />
              </div>
              {errors.primaryColor && (
                <p className="mt-1 text-sm text-red-600">{errors.primaryColor}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor Secundária
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="#10B981"
                />
              </div>
              {errors.secondaryColor && (
                <p className="mt-1 text-sm text-red-600">{errors.secondaryColor}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor de Destaque
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="#F59E0B"
                />
              </div>
              {errors.accentColor && (
                <p className="mt-1 text-sm text-red-600">{errors.accentColor}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {saving && <LoadingSpinner size="sm" color="white" className="mr-2" />}
              <Save className="w-4 h-4 mr-2" />
              Salvar Cores
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};