// Backup e Restauração
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState } from 'react';
import { BackupInfo } from '@/services/settingsService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import {
  Database,
  Download,
  Upload,
  Trash2,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
} from 'lucide-react';

interface BackupRestoreProps {
  backups: BackupInfo[];
  loading?: boolean;
  onLoadBackups?: () => void;
  onCreate?: () => Promise<boolean>;
  onDownload?: (id: string) => void;
  onDelete?: (id: string) => Promise<boolean>;
  onRestore?: (file: File) => Promise<boolean>;
  formatFileSize: (bytes: number) => string;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({
  backups,
  loading = false,
  onLoadBackups,
  onCreate,
  onDownload,
  onDelete,
  onRestore,
  formatFileSize,
}) => {
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'failed':
        return XCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'pending':
        return 'Processando';
      case 'failed':
        return 'Falhou';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'manual' ? 'Manual' : 'Automático';
  };

  const handleCreateBackup = async () => {
    if (!onCreate) return;

    try {
      setCreateLoading(true);
      await onCreate();
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteBackup = async (backup: BackupInfo) => {
    if (!onDelete) return;
    
    if (window.confirm(`Tem certeza que deseja excluir o backup "${backup.filename}"?`)) {
      await onDelete(backup.id);
    }
  };

  const handleRestoreBackup = async () => {
    if (!restoreFile || !onRestore) return;

    try {
      setRestoreLoading(true);
      const success = await onRestore(restoreFile);
      if (success) {
        setShowRestoreModal(false);
        setRestoreFile(null);
      }
    } finally {
      setRestoreLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Backup e Restauração</h3>
            <p className="text-sm text-gray-600">
              Gerencie backups do sistema para proteção de dados
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {onLoadBackups && (
              <button
                onClick={onLoadBackups}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </button>
            )}
            
            <button
              onClick={() => setShowRestoreModal(true)}
              className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Restaurar
            </button>
            
            {onCreate && (
              <button
                onClick={handleCreateBackup}
                disabled={createLoading}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {createLoading ? (
                  <LoadingSpinner size="sm" color="white" className="mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {createLoading ? 'Criando...' : 'Novo Backup'}
              </button>
            )}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Importante</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Backups são essenciais para proteger seus dados. Recomendamos criar backups regulares 
                e armazená-los em local seguro. A restauração de backup substituirá todos os dados atuais.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Backups */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : backups.length === 0 ? (
        <div className="text-center py-12">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum backup encontrado
          </h3>
          <p className="text-gray-500">
            Não há backups disponíveis. Crie seu primeiro backup para proteger seus dados.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Arquivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tamanho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backups.map((backup) => {
                  const StatusIcon = getStatusIcon(backup.status);
                  
                  return (
                    <tr key={backup.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Database className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {backup.filename}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {backup.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {getTypeLabel(backup.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatFileSize(backup.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <StatusIcon className={`w-4 h-4 mr-2 ${getStatusColor(backup.status).split(' ')[0]}`} />
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(backup.status)}`}>
                            {getStatusLabel(backup.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(backup.createdAt)}
                        </div>
                        {backup.completedAt && backup.status === 'completed' && (
                          <div className="text-sm text-gray-500">
                            Concluído: {formatDate(backup.completedAt)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {backup.status === 'completed' && backup.downloadUrl && onDownload && (
                            <button
                              onClick={() => onDownload(backup.id)}
                              className="text-primary-600 hover:text-primary-700"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          
                          {onDelete && (
                            <button
                              onClick={() => handleDeleteBackup(backup)}
                              className="text-red-600 hover:text-red-700"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
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
      )}

      {/* Modal de Restauração */}
      <Modal
        isOpen={showRestoreModal}
        onClose={() => {
          setShowRestoreModal(false);
          setRestoreFile(null);
        }}
        title="Restaurar Backup"
        size="md"
      >
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Atenção!</h4>
                <p className="text-sm text-red-700 mt-1">
                  A restauração de backup substituirá TODOS os dados atuais do sistema. 
                  Esta operação não pode ser desfeita. Certifique-se de que deseja continuar.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arquivo de Backup *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {restoreFile ? (
                <div className="text-center">
                  <Database className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">{restoreFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(restoreFile.size)}</p>
                  <button
                    onClick={() => setRestoreFile(null)}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Remover arquivo
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Selecione um arquivo de backup (.zip)
                  </p>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setRestoreFile(file);
                    }}
                    className="hidden"
                    id="restore-file"
                  />
                  <label
                    htmlFor="restore-file"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Selecionar Arquivo
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setShowRestoreModal(false);
                setRestoreFile(null);
              }}
              disabled={restoreLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleRestoreBackup}
              disabled={restoreLoading || !restoreFile}
              className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {restoreLoading && <LoadingSpinner size="sm" color="white" className="mr-2" />}
              {restoreLoading ? 'Restaurando...' : 'Confirmar Restauração'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};