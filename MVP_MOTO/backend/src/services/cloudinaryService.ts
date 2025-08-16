// Serviço de Integração com Cloudinary
// Sistema de Gestão de Oficina Mecânica de Motos

import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import sharp from 'sharp';
import { Readable } from 'stream';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadOptions {
  folder?: string;
  transformation?: any[];
  tags?: string[];
  context?: Record<string, string>;
  public_id?: string;
  overwrite?: boolean;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
}

interface OptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpg' | 'png' | 'webp' | 'auto';
  crop?: 'fill' | 'fit' | 'scale' | 'crop';
}

class CloudinaryService {
  // Upload de arquivo para Cloudinary
  async uploadFile(
    file: Express.Multer.File | Buffer | string,
    options: UploadOptions = {}
  ): Promise<any> {
    try {
      const uploadOptions = {
        folder: options.folder || 'oficina-motos',
        transformation: options.transformation || [],
        tags: options.tags || [],
        context: options.context || {},
        public_id: options.public_id,
        overwrite: options.overwrite || false,
        resource_type: options.resource_type || 'auto',
        use_filename: true,
        unique_filename: !options.public_id,
      };

      let uploadResult;

      if (typeof file === 'string') {
        // Upload por URL
        uploadResult = await cloudinary.uploader.upload(file, uploadOptions);
      } else if (Buffer.isBuffer(file)) {
        // Upload de buffer
        uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          
          const bufferStream = new Readable();
          bufferStream.push(file);
          bufferStream.push(null);
          bufferStream.pipe(uploadStream);
        });
      } else {
        // Upload de arquivo Multer
        uploadResult = await cloudinary.uploader.upload(file.path, uploadOptions);
      }

      return {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
        created_at: uploadResult.created_at,
      };
    } catch (error) {
      console.error('Erro no upload para Cloudinary:', error);
      throw new Error(`Falha no upload: ${error.message}`);
    }
  }

  // Upload de imagem com otimização
  async uploadImage(
    file: Express.Multer.File | Buffer,
    options: UploadOptions & OptimizationOptions = {}
  ): Promise<any> {
    try {
      // Otimizar imagem com Sharp antes do upload
      let optimizedBuffer: Buffer;

      if (Buffer.isBuffer(file)) {
        optimizedBuffer = file;
      } else {
        optimizedBuffer = file.buffer;
      }

      // Aplicar otimizações com Sharp
      let sharpInstance = sharp(optimizedBuffer);

      if (options.width || options.height) {
        sharpInstance = sharpInstance.resize(options.width, options.height, {
          fit: options.crop === 'fit' ? 'inside' : 'cover',
          withoutEnlargement: true,
        });
      }

      if (options.format && options.format !== 'auto') {
        switch (options.format) {
          case 'jpg':
            sharpInstance = sharpInstance.jpeg({ quality: options.quality || 85 });
            break;
          case 'png':
            sharpInstance = sharpInstance.png({ quality: options.quality || 85 });
            break;
          case 'webp':
            sharpInstance = sharpInstance.webp({ quality: options.quality || 85 });
            break;
        }
      }

      const optimizedImageBuffer = await sharpInstance.toBuffer();

      // Configurar transformações do Cloudinary
      const transformations = [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
        ...(options.transformation || []),
      ];

      return await this.uploadFile(optimizedImageBuffer, {
        ...options,
        transformation: transformations,
        resource_type: 'image',
      });
    } catch (error) {
      console.error('Erro no upload de imagem:', error);
      throw new Error(`Falha no upload de imagem: ${error.message}`);
    }
  }

  // Upload múltiplo de imagens
  async uploadMultipleImages(
    files: Express.Multer.File[],
    options: UploadOptions & OptimizationOptions = {}
  ): Promise<any[]> {
    const uploadPromises = files.map((file, index) => 
      this.uploadImage(file, {
        ...options,
        public_id: options.public_id ? `${options.public_id}_${index}` : undefined,
      })
    );

    return await Promise.all(uploadPromises);
  }

  // Gerar URL com transformações
  generateUrl(
    publicId: string,
    transformations: any[] = []
  ): string {
    return cloudinary.url(publicId, {
      transformation: transformations,
      secure: true,
    });
  }

  // Gerar thumbnail
  generateThumbnail(
    publicId: string,
    width: number = 150,
    height: number = 150
  ): string {
    return this.generateUrl(publicId, [
      { width, height, crop: 'fill' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ]);
  }

  // Gerar versões responsivas
  generateResponsiveUrls(publicId: string): Record<string, string> {
    const sizes = {
      thumbnail: { width: 150, height: 150 },
      small: { width: 300, height: 300 },
      medium: { width: 600, height: 600 },
      large: { width: 1200, height: 1200 },
    };

    const urls: Record<string, string> = {};

    Object.entries(sizes).forEach(([size, dimensions]) => {
      urls[size] = this.generateUrl(publicId, [
        { width: dimensions.width, height: dimensions.height, crop: 'fit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ]);
    });

    return urls;
  }

  // Deletar arquivo
  async deleteFile(publicId: string): Promise<any> {
    try {
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      throw new Error(`Falha ao deletar arquivo: ${error.message}`);
    }
  }

  // Deletar múltiplos arquivos
  async deleteMultipleFiles(publicIds: string[]): Promise<any> {
    try {
      return await cloudinary.api.delete_resources(publicIds);
    } catch (error) {
      console.error('Erro ao deletar arquivos:', error);
      throw new Error(`Falha ao deletar arquivos: ${error.message}`);
    }
  }

  // Listar arquivos por pasta
  async listFiles(folder: string, maxResults: number = 100): Promise<any> {
    try {
      return await cloudinary.api.resources({
        type: 'upload',
        prefix: folder,
        max_results: maxResults,
      });
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      throw new Error(`Falha ao listar arquivos: ${error.message}`);
    }
  }

  // Obter informações do arquivo
  async getFileInfo(publicId: string): Promise<any> {
    try {
      return await cloudinary.api.resource(publicId);
    } catch (error) {
      console.error('Erro ao obter informações do arquivo:', error);
      throw new Error(`Falha ao obter informações: ${error.message}`);
    }
  }

  // Configurar storage do Multer com Cloudinary
  createMulterStorage(folder: string = 'oficina-motos'): CloudinaryStorage {
    return new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: folder,
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      } as any,
    });
  }

  // Middleware do Multer para upload
  createUploadMiddleware(
    folder: string = 'oficina-motos',
    maxFiles: number = 10
  ): multer.Multer {
    const storage = this.createMulterStorage(folder);
    
    return multer({
      storage: storage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: maxFiles,
      },
      fileFilter: (req, file, cb) => {
        // Verificar tipo de arquivo
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Apenas arquivos de imagem são permitidos'));
        }
      },
    });
  }

  // Backup de imagens
  async backupImages(folder: string): Promise<string[]> {
    try {
      const resources = await this.listFiles(folder, 500);
      const backupUrls: string[] = [];

      for (const resource of resources.resources) {
        // Gerar URL de backup (sem transformações)
        const backupUrl = cloudinary.url(resource.public_id, {
          secure: true,
          sign_url: true,
          type: 'authenticated',
        });
        
        backupUrls.push(backupUrl);
      }

      return backupUrls;
    } catch (error) {
      console.error('Erro no backup de imagens:', error);
      throw new Error(`Falha no backup: ${error.message}`);
    }
  }

  // Migrar imagens para nova pasta
  async migrateImages(
    fromFolder: string,
    toFolder: string
  ): Promise<any[]> {
    try {
      const resources = await this.listFiles(fromFolder);
      const migrationResults: any[] = [];

      for (const resource of resources.resources) {
        const newPublicId = resource.public_id.replace(fromFolder, toFolder);
        
        const result = await cloudinary.uploader.rename(
          resource.public_id,
          newPublicId
        );
        
        migrationResults.push(result);
      }

      return migrationResults;
    } catch (error) {
      console.error('Erro na migração de imagens:', error);
      throw new Error(`Falha na migração: ${error.message}`);
    }
  }

  // Otimizar imagens existentes
  async optimizeExistingImages(folder: string): Promise<any[]> {
    try {
      const resources = await this.listFiles(folder);
      const optimizationResults: any[] = [];

      for (const resource of resources.resources) {
        // Aplicar otimizações
        const optimized = await cloudinary.uploader.explicit(
          resource.public_id,
          {
            type: 'upload',
            eager: [
              { quality: 'auto:good', fetch_format: 'auto' },
              { width: 1200, height: 1200, crop: 'limit', quality: 'auto:good' },
            ],
            overwrite: true,
          }
        );
        
        optimizationResults.push(optimized);
      }

      return optimizationResults;
    } catch (error) {
      console.error('Erro na otimização de imagens:', error);
      throw new Error(`Falha na otimização: ${error.message}`);
    }
  }

  // Gerar relatório de uso
  async getUsageReport(): Promise<any> {
    try {
      const usage = await cloudinary.api.usage();
      
      return {
        plan: usage.plan,
        last_updated: usage.last_updated,
        objects: {
          used: usage.objects.used,
          limit: usage.objects.limit,
          usage_pct: (usage.objects.used / usage.objects.limit) * 100,
        },
        bandwidth: {
          used: usage.bandwidth.used,
          limit: usage.bandwidth.limit,
          usage_pct: (usage.bandwidth.used / usage.bandwidth.limit) * 100,
        },
        storage: {
          used: usage.storage.used,
          limit: usage.storage.limit,
          usage_pct: (usage.storage.used / usage.storage.limit) * 100,
        },
        requests: usage.requests || 0,
        resources: usage.resources || 0,
        derived_resources: usage.derived_resources || 0,
      };
    } catch (error) {
      console.error('Erro ao obter relatório de uso:', error);
      throw new Error(`Falha ao obter relatório: ${error.message}`);
    }
  }
}

export const cloudinaryService = new CloudinaryService();
export { CloudinaryService };