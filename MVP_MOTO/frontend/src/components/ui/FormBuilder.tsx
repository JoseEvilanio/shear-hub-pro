// Componente FormBuilder Reutilizável
// Sistema de Gestão de Oficina Mecânica de Motos

import React from 'react';
import { useForm, Controller, FieldValues, Path, PathValue } from 'react-hook-form';
import { cn } from '@/utils/cn';
import { Eye, EyeOff, Calendar, Search } from 'lucide-react';

export interface FormField<T extends FieldValues = FieldValues> {
  name: Path<T>;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'datetime-local' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'search';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string | number; label: string }>;
  validation?: {
    required?: string;
    pattern?: { value: RegExp; message: string };
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    min?: { value: number; message: string };
    max?: { value: number; message: string };
    validate?: (value: any) => string | boolean;
  };
  className?: string;
  rows?: number;
  accept?: string;
  multiple?: boolean;
  defaultValue?: PathValue<T, Path<T>>;
  onChange?: (value: any) => void;
  onSearch?: (value: string) => void;
}

export interface FormBuilderProps<T extends FieldValues = FieldValues> {
  fields: FormField<T>[];
  onSubmit: (data: T) => void;
  defaultValues?: Partial<T>;
  loading?: boolean;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  className?: string;
  layout?: 'vertical' | 'horizontal';
  columns?: 1 | 2 | 3;
}

export function FormBuilder<T extends FieldValues = FieldValues>({
  fields,
  onSubmit,
  defaultValues,
  loading = false,
  submitText = 'Salvar',
  cancelText = 'Cancelar',
  onCancel,
  className,
  columns = 1,
}: FormBuilderProps<T>) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<T>({
    defaultValues: defaultValues as any,
  });

  const [showPasswords, setShowPasswords] = React.useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  const renderField = (field: FormField<T>) => {
    const error = errors[field.name];
    const fieldId = `field-${String(field.name)}`;

    return (
      <div key={String(field.name)} className="space-y-2">
        <label
          htmlFor={fieldId}
          className={cn(
            'block text-sm font-medium text-gray-700',
            field.required && "after:content-['*'] after:text-red-500 after:ml-1"
          )}
        >
          {field.label}
        </label>

        <Controller
          name={field.name}
          control={control}
          rules={field.validation}
          render={({ field: controllerField }) => {
            const baseInputClasses = cn(
              'w-full px-3 py-2 border border-gray-300 rounded-lg',
              'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'disabled:bg-gray-50 disabled:text-gray-500',
              error && 'border-red-500 focus:ring-red-500',
              field.className
            );

            switch (field.type) {
              case 'textarea':
                return (
                  <textarea
                    {...controllerField}
                    id={fieldId}
                    placeholder={field.placeholder}
                    disabled={field.disabled || loading}
                    rows={field.rows || 3}
                    className={baseInputClasses}
                    onChange={(e) => {
                      controllerField.onChange(e);
                      field.onChange?.(e.target.value);
                    }}
                  />
                );

              case 'select':
                return (
                  <select
                    {...controllerField}
                    id={fieldId}
                    disabled={field.disabled || loading}
                    className={baseInputClasses}
                    onChange={(e) => {
                      controllerField.onChange(e);
                      field.onChange?.(e.target.value);
                    }}
                  >
                    <option value="">{field.placeholder || 'Selecione...'}</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                );

              case 'checkbox':
                return (
                  <div className="flex items-center">
                    <input
                      {...controllerField}
                      type="checkbox"
                      id={fieldId}
                      disabled={field.disabled || loading}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      checked={controllerField.value || false}
                      onChange={(e) => {
                        controllerField.onChange(e.target.checked);
                        field.onChange?.(e.target.checked);
                      }}
                    />
                    <label htmlFor={fieldId} className="ml-2 text-sm text-gray-700">
                      {field.placeholder}
                    </label>
                  </div>
                );

              case 'radio':
                return (
                  <div className="space-y-2">
                    {field.options?.map((option) => (
                      <div key={option.value} className="flex items-center">
                        <input
                          {...controllerField}
                          type="radio"
                          id={`${fieldId}-${option.value}`}
                          value={option.value}
                          disabled={field.disabled || loading}
                          className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                          checked={controllerField.value === option.value}
                          onChange={(e) => {
                            controllerField.onChange(e.target.value);
                            field.onChange?.(e.target.value);
                          }}
                        />
                        <label
                          htmlFor={`${fieldId}-${option.value}`}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                );

              case 'file':
                return (
                  <input
                    {...controllerField}
                    type="file"
                    id={fieldId}
                    disabled={field.disabled || loading}
                    accept={field.accept}
                    multiple={field.multiple}
                    className={cn(
                      'w-full px-3 py-2 border border-gray-300 rounded-lg',
                      'file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0',
                      'file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700',
                      'hover:file:bg-primary-100',
                      error && 'border-red-500',
                      field.className
                    )}
                    onChange={(e) => {
                      const files = e.target.files;
                      const value = field.multiple ? files : files?.[0];
                      controllerField.onChange(value);
                      field.onChange?.(value);
                    }}
                  />
                );

              case 'password':
                return (
                  <div className="relative">
                    <input
                      {...controllerField}
                      type={showPasswords[String(field.name)] ? 'text' : 'password'}
                      id={fieldId}
                      placeholder={field.placeholder}
                      disabled={field.disabled || loading}
                      className={cn(baseInputClasses, 'pr-10')}
                      onChange={(e) => {
                        controllerField.onChange(e);
                        field.onChange?.(e.target.value);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(String(field.name))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords[String(field.name)] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                );

              case 'search':
                return (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...controllerField}
                      type="text"
                      id={fieldId}
                      placeholder={field.placeholder}
                      disabled={field.disabled || loading}
                      className={cn(baseInputClasses, 'pl-10')}
                      onChange={(e) => {
                        controllerField.onChange(e);
                        field.onChange?.(e.target.value);
                        field.onSearch?.(e.target.value);
                      }}
                    />
                  </div>
                );

              case 'date':
              case 'datetime-local':
                return (
                  <div className="relative">
                    <input
                      {...controllerField}
                      type={field.type}
                      id={fieldId}
                      placeholder={field.placeholder}
                      disabled={field.disabled || loading}
                      className={cn(baseInputClasses, 'pr-10')}
                      onChange={(e) => {
                        controllerField.onChange(e);
                        field.onChange?.(e.target.value);
                      }}
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                );

              default:
                return (
                  <input
                    {...controllerField}
                    type={field.type}
                    id={fieldId}
                    placeholder={field.placeholder}
                    disabled={field.disabled || loading}
                    className={baseInputClasses}
                    onChange={(e) => {
                      controllerField.onChange(e);
                      field.onChange?.(e.target.value);
                    }}
                  />
                );
            }
          }}
        />

        {error && (
          <p className="text-sm text-red-600">{String(error.message)}</p>
        )}
      </div>
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('space-y-6', className)}
    >
      <div className={cn('grid gap-6', gridClasses[columns])}>
        {fields.map(renderField)}
      </div>

      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelText}
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : submitText}
        </button>
      </div>
    </form>
  );
}