// Otimização e Compressão de Imagens
// Sistema de Gestão de Oficina Mecânica de Motos

interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 a 1.0
  format?: 'jpeg' | 'png' | 'webp';
  maintainAspectRatio?: boolean;
}

interface OptimizedImage {
  file: File;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
}

class ImageOptimizer {
  // Comprimir uma única imagem
  async compressImage(
    file: File,
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImage> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'jpeg',
      maintainAspectRatio = true,
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Não foi possível obter contexto do canvas'));
        return;
      }

      img.onload = () => {
        // Calcular novas dimensões
        let { width, height } = this.calculateDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight,
          maintainAspectRatio
        );

        // Configurar canvas
        canvas.width = width;
        canvas.height = height;

        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Converter para blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Erro ao comprimir imagem'));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: `image/${format}`,
              lastModified: Date.now(),
            });

            const dataUrl = canvas.toDataURL(`image/${format}`, quality);

            resolve({
              file: compressedFile,
              dataUrl,
              originalSize: file.size,
              compressedSize: blob.size,
              compressionRatio: (1 - blob.size / file.size) * 100,
              width,
              height,
            });
          },
          `image/${format}`,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Erro ao carregar imagem'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Comprimir múltiplas imagens
  async compressImages(
    files: File[],
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImage[]> {
    const promises = files.map(file => this.compressImage(file, options));
    return Promise.all(promises);
  }

  // Calcular dimensões mantendo proporção
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
    maintainAspectRatio: boolean
  ): { width: number; height: number } {
    if (!maintainAspectRatio) {
      return {
        width: Math.min(originalWidth, maxWidth),
        height: Math.min(originalHeight, maxHeight),
      };
    }

    const aspectRatio = originalWidth / originalHeight;

    let width = originalWidth;
    let height = originalHeight;

    // Reduzir se exceder largura máxima
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }

    // Reduzir se exceder altura máxima
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return {
      width: Math.round(width),
      height: Math.round(height),
    };
  }

  // Gerar thumbnail
  async generateThumbnail(
    file: File,
    size: number = 150
  ): Promise<OptimizedImage> {
    return this.compressImage(file, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.7,
      format: 'jpeg',
      maintainAspectRatio: true,
    });
  }

  // Validar arquivo de imagem
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Verificar tipo
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'Arquivo deve ser uma imagem' };
    }

    // Verificar tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: 'Imagem muito grande (máximo 10MB)' };
    }

    // Verificar formatos suportados
    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!supportedTypes.includes(file.type)) {
      return { valid: false, error: 'Formato não suportado' };
    }

    return { valid: true };
  }

  // Obter informações da imagem
  async getImageInfo(file: File): Promise<{
    width: number;
    height: number;
    size: number;
    type: string;
    name: string;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          size: file.size,
          type: file.type,
          name: file.name,
        });
      };

      img.onerror = () => {
        reject(new Error('Erro ao carregar informações da imagem'));
      };

      img.src = URL.createObjectURL(file);
    });
  }
}

// Instância global do otimizador
export const imageOptimizer = new ImageOptimizer();

// Hook para otimização de imagens em componentes React
export const useImageOptimization = () => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const compressImage = async (
    file: File,
    options?: ImageOptimizationOptions
  ): Promise<OptimizedImage | null> => {
    try {
      setProcessing(true);
      setProgress(0);

      // Validar arquivo
      const validation = imageOptimizer.validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      setProgress(50);

      // Comprimir imagem
      const result = await imageOptimizer.compressImage(file, options);

      setProgress(100);
      return result;
    } catch (error) {
      console.error('Erro ao comprimir imagem:', error);
      return null;
    } finally {
      setProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const compressImages = async (
    files: File[],
    options?: ImageOptimizationOptions
  ): Promise<OptimizedImage[]> => {
    try {
      setProcessing(true);
      setProgress(0);

      const results: OptimizedImage[] = [];
      const total = files.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validar arquivo
        const validation = imageOptimizer.validateImageFile(file);
        if (!validation.valid) {
          console.warn(`Arquivo ${file.name} ignorado: ${validation.error}`);
          continue;
        }

        // Comprimir
        const result = await imageOptimizer.compressImage(file, options);
        results.push(result);

        // Atualizar progresso
        setProgress(((i + 1) / total) * 100);
      }

      return results;
    } catch (error) {
      console.error('Erro ao comprimir imagens:', error);
      return [];
    } finally {
      setProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const generateThumbnail = async (
    file: File,
    size?: number
  ): Promise<OptimizedImage | null> => {
    try {
      setProcessing(true);
      const result = await imageOptimizer.generateThumbnail(file, size);
      return result;
    } catch (error) {
      console.error('Erro ao gerar thumbnail:', error);
      return null;
    } finally {
      setProcessing(false);
    }
  };

  return {
    compressImage,
    compressImages,
    generateThumbnail,
    processing,
    progress,
    validateImageFile: imageOptimizer.validateImageFile,
    getImageInfo: imageOptimizer.getImageInfo,
  };
};

// Componente de upload com otimização automática
interface OptimizedImageUploadProps {
  onImagesOptimized: (images: OptimizedImage[]) => void;
  options?: ImageOptimizationOptions;
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  className?: string;
  children?: React.ReactNode;
}

export const OptimizedImageUpload: React.FC<OptimizedImageUploadProps> = ({
  onImagesOptimized,
  options,
  multiple = false,
  accept = 'image/*',
  maxFiles = 10,
  className = '',
  children,
}) => {
  const { compressImages, processing, progress } = useImageOptimization();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Limitar número de arquivos
    const filesToProcess = files.slice(0, maxFiles);

    // Comprimir imagens
    const optimizedImages = await compressImages(filesToProcess, options);
    
    if (optimizedImages.length > 0) {
      onImagesOptimized(optimizedImages);
    }

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div onClick={handleClick} className="cursor-pointer">
        {children || (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <p className="text-gray-600">
              Clique para selecionar {multiple ? 'imagens' : 'uma imagem'}
            </p>
          </div>
        )}
      </div>

      {processing && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Otimizando imagens...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Utilitários para formatação
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatCompressionRatio = (ratio: number): string => {
  return `${ratio.toFixed(1)}%`;
};