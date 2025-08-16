import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository, User } from '../repositories/UserRepository';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export class AuthService {
  private userRepository: UserRepository;
  private jwtSecret: string;
  private jwtRefreshSecret: string;
  private jwtExpiresIn: string;
  private jwtRefreshExpiresIn: string;

  constructor() {
    this.userRepository = new UserRepository();
    this.jwtSecret = process.env['JWT_SECRET'] || 'default-secret';
    this.jwtRefreshSecret = process.env['JWT_REFRESH_SECRET'] || 'default-refresh-secret';
    this.jwtExpiresIn = process.env['JWT_EXPIRES_IN'] || '24h';
    this.jwtRefreshExpiresIn = process.env['JWT_REFRESH_EXPIRES_IN'] || '7d';
  }

  /**
   * Fazer login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Buscar usuário por email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Email ou senha inválidos');
    }

    // Verificar se usuário está ativo
    if (!user.active) {
      throw new Error('Usuário inativo');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Email ou senha inválidos');
    }

    // Gerar tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const token = (jwt.sign as any)(tokenPayload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn
    });

    const refreshToken = (jwt.sign as any)(tokenPayload, this.jwtRefreshSecret, {
      expiresIn: this.jwtRefreshExpiresIn
    });

    // Remover senha do retorno
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      refreshToken
    };
  }

  /**
   * Renovar token
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      const payload = jwt.verify(refreshToken, this.jwtRefreshSecret) as TokenPayload;
      
      // Verificar se usuário ainda existe e está ativo
      const user = await this.userRepository.findById(payload.userId);
      if (!user || !user.active) {
        throw new Error('Usuário inválido');
      }

      // Gerar novos tokens
      const newTokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const newToken = (jwt.sign as any)(newTokenPayload, this.jwtSecret, {
        expiresIn: this.jwtExpiresIn
      });

      const newRefreshToken = (jwt.sign as any)(newTokenPayload, this.jwtRefreshSecret, {
        expiresIn: this.jwtRefreshExpiresIn
      });

      return {
        token: newToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new Error('Token de refresh inválido');
    }
  }

  /**
   * Verificar token
   */
  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as TokenPayload;
      
      // Verificar se usuário ainda existe e está ativo
      const user = await this.userRepository.findById(payload.userId);
      if (!user || !user.active) {
        throw new Error('Usuário inválido');
      }

      return payload;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  /**
   * Hash de senha
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verificar senha
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Criar usuário
   */
  async createUser(userData: {
    email: string;
    password: string;
    name: string;
    role?: 'admin' | 'manager' | 'operator' | 'mechanic';
  }): Promise<Omit<User, 'password_hash'>> {
    const { email, password, name, role = 'operator' } = userData;

    // Verificar se email já existe
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email já está em uso');
    }

    // Hash da senha
    const passwordHash = await this.hashPassword(password);

    // Criar usuário
    const user = await this.userRepository.create({
      email,
      password_hash: passwordHash,
      name,
      role,
      active: true
    });

    // Remover senha do retorno
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Alterar senha
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      throw new Error('Senha atual inválida');
    }

    // Hash da nova senha
    const newPasswordHash = await this.hashPassword(newPassword);

    // Atualizar senha
    await this.userRepository.updatePassword(userId, newPasswordHash);
  }
}