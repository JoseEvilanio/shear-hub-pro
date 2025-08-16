// Registro e Gerenciamento do Service Worker
// Sistema de Gestão de Oficina Mecânica de Motos

interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOfflineReady?: () => void;
}

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

export function register(config?: ServiceWorkerConfig) {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL || '', window.location.href);
    
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/sw.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log('Service Worker: App is being served from cache by a service worker.');
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl: string, config?: ServiceWorkerConfig) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('Service Worker: Registered successfully');
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        
        if (installingWorker == null) {
          return;
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('Service Worker: New content available, please refresh.');
              
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              console.log('Service Worker: Content cached for offline use.');
              
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
              
              if (config && config.onOfflineReady) {
                config.onOfflineReady();
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Service Worker: Registration failed:', error);
    });
}

function checkValidServiceWorker(swUrl: string, config?: ServiceWorkerConfig) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('Service Worker: No internet connection found. App is running in offline mode.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error('Service Worker: Unregistration failed:', error);
      });
  }
}

// Utilitários para interação com o service worker
export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.ready;
        this.setupMessageListener();
      } catch (error) {
        console.error('Service Worker: Failed to get registration:', error);
      }
    }
  }

  private setupMessageListener() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('Service Worker: Cache updated');
          // Disparar evento customizado
          window.dispatchEvent(new CustomEvent('sw-cache-updated', {
            detail: event.data
          }));
        }
      });
    }
  }

  // Limpar cache
  async clearCache(): Promise<boolean> {
    if (!this.registration) return false;

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.success);
      };

      this.registration?.active?.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
    });
  }

  // Forçar atualização do service worker
  async skipWaiting(): Promise<void> {
    if (!this.registration) return;

    this.registration.active?.postMessage({ type: 'SKIP_WAITING' });
  }

  // Verificar se há atualizações
  async checkForUpdates(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      await this.registration.update();
      return true;
    } catch (error) {
      console.error('Service Worker: Update check failed:', error);
      return false;
    }
  }

  // Registrar para sincronização em background
  async registerBackgroundSync(tag: string): Promise<boolean> {
    if (!this.registration || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      return false;
    }

    try {
      await this.registration.sync.register(tag);
      return true;
    } catch (error) {
      console.error('Service Worker: Background sync registration failed:', error);
      return false;
    }
  }

  // Verificar status da conexão
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Obter informações do service worker
  getInfo() {
    return {
      supported: 'serviceWorker' in navigator,
      registered: !!this.registration,
      active: !!this.registration?.active,
      waiting: !!this.registration?.waiting,
      installing: !!this.registration?.installing,
      online: this.isOnline(),
    };
  }
}

// Instância global do gerenciador
export const swManager = new ServiceWorkerManager();

// Hook React para usar o service worker
export const useServiceWorker = () => {
  const [swInfo, setSwInfo] = React.useState(swManager.getInfo());
  const [updateAvailable, setUpdateAvailable] = React.useState(false);

  React.useEffect(() => {
    const updateInfo = () => {
      setSwInfo(swManager.getInfo());
    };

    const handleUpdateFound = () => {
      setUpdateAvailable(true);
    };

    // Listeners para mudanças no service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', updateInfo);
      
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', handleUpdateFound);
      });
    }

    // Listener para mudanças na conexão
    window.addEventListener('online', updateInfo);
    window.addEventListener('offline', updateInfo);

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', updateInfo);
      }
      window.removeEventListener('online', updateInfo);
      window.removeEventListener('offline', updateInfo);
    };
  }, []);

  const clearCache = async () => {
    const success = await swManager.clearCache();
    if (success) {
      window.location.reload();
    }
    return success;
  };

  const updateApp = async () => {
    await swManager.skipWaiting();
    window.location.reload();
  };

  const checkForUpdates = () => {
    return swManager.checkForUpdates();
  };

  return {
    ...swInfo,
    updateAvailable,
    clearCache,
    updateApp,
    checkForUpdates,
  };
};

// Componente para mostrar status do service worker
export const ServiceWorkerStatus: React.FC = () => {
  const sw = useServiceWorker();

  if (!sw.supported) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!sw.online && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg mb-2">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Modo Offline
          </div>
        </div>
      )}

      {sw.updateAvailable && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm">Nova versão disponível</span>
            <button
              onClick={sw.updateApp}
              className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              Atualizar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};