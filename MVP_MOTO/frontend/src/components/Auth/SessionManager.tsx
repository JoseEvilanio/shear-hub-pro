// Componente de Gerenciamento de Sessões
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, Tablet, Globe, Trash2, Shield } from 'lucide-react';
import { authService } from '@/services/authService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { AuthFeedback } from './AuthFeedback';
import { cn } from '@/utils/cn';

interface Session {
  id: string;
  tokenPrefix: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser: string;
  os: string;
  ip: string;
  location?: string;
  isCurrent: boolean;
  lastActivity: string;
  createdAt: string;
}

interface SessionManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const deviceIcons = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  unknown: Globe,
};

export const SessionManager: React.FC<SessionManagerProps> = ({
  isOpen,
  onClose,
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revokeLoading, setRevokeLoading] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState(false);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const sessionsData = await authService.getActiveSessions();
      setSessions(sessionsData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar sessões');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen]);

  const handleRevokeSession = async (tokenPrefix: string) => {
    try {
      setRevokeLoading(tokenPrefix);
      await authService.revokeSession(tokenPrefix);
      await loadSessions(); // Recarregar lista
      setShowConfirm(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao revogar sessão');
    } finally {
      setRevokeLoading(null);
    }
  };

  const handleLogoutAll = async () => {
    try {
      setLoading(true);
      await authService.logoutAll();
      setShowLogoutAllConfirm(false);
      onClose(); // Fechar modal pois usuário será deslogado
    } catch (err: any) {
      setError(err.message || 'Erro ao deslogar de todos os dispositivos');
      setLoading(false);
    }
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)} dias atrás`;
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Gerenciar Sessões"
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => setShowLogoutAllConfirm(true)}
              disabled={loading || sessions.length <= 1}
              className="flex items-center px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Shield className="w-4 h-4 mr-2" />
              Deslogar de Todos
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Fechar
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {error && (
            <AuthFeedback
              type="error"
              title="Erro"
              message={error}
            />
          )}

          <div className="text-sm text-gray-600">
            Gerencie suas sessões ativas em diferentes dispositivos. Por segurança, 
            revogue sessões que você não reconhece.
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const DeviceIcon = deviceIcons[session.deviceType];
                const isRevoking = revokeLoading === session.tokenPrefix;

                return (
                  <div
                    key={session.id}
                    className={cn(
                      'flex items-center justify-between p-4 border rounded-lg',
                      session.isCurrent
                        ? 'border-primary-200 bg-primary-50'
                        : 'border-gray-200 bg-white'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <DeviceIcon className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {session.browser} em {session.os}
                          </span>
                          {session.isCurrent && (
                            <span className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full">
                              Atual
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.ip}
                          {session.location && ` • ${session.location}`}
                        </div>
                        <div className="text-xs text-gray-400">
                          Última atividade: {formatLastActivity(session.lastActivity)}
                        </div>
                      </div>
                    </div>

                    {!session.isCurrent && (
                      <button
                        onClick={() => setShowConfirm(session.tokenPrefix)}
                        disabled={isRevoking}
                        className="flex items-center px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50"
                      >
                        {isRevoking ? (
                          <LoadingSpinner size="sm" color="secondary" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}

              {sessions.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma sessão ativa encontrada
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Confirmação de revogação de sessão */}
      <ConfirmModal
        isOpen={!!showConfirm}
        onClose={() => setShowConfirm(null)}
        onConfirm={() => showConfirm && handleRevokeSession(showConfirm)}
        title="Revogar Sessão"
        message="Tem certeza que deseja revogar esta sessão? O dispositivo será desconectado imediatamente."
        confirmText="Revogar"
        type="warning"
        loading={!!revokeLoading}
      />

      {/* Confirmação de logout geral */}
      <ConfirmModal
        isOpen={showLogoutAllConfirm}
        onClose={() => setShowLogoutAllConfirm(false)}
        onConfirm={handleLogoutAll}
        title="Deslogar de Todos os Dispositivos"
        message="Tem certeza que deseja deslogar de todos os dispositivos? Você precisará fazer login novamente em todos eles."
        confirmText="Deslogar de Todos"
        type="danger"
        loading={loading}
      />
    </>
  );
};