// Utilitário para combinar classes CSS
// Sistema de Gestão de Oficina Mecânica de Motos

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}