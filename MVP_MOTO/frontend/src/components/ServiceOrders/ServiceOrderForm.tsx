// Formulário de Ordem de Serviço
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ServiceOrder, Client, Vehicle } from '@/types';
import { CreateServiceOrderData } from '@/services/serviceOrderService';
import { clientService } from '@/services/clientService';
import { 
  FileText, 
  User, 
  Car, 
  Wrench,
} from 'lucide-react';

interface ServiceOrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceOrderFormData) => Promise<void>;
  serviceOrder?: ServiceOrder | null;
  loading?: boolean;
}

export interface ServiceOrderFormData extends CreateServiceOrderData {
  clientSearch: string;
  vehicleSearch: string;
}

export const ServiceOrderForm: React.FC<ServiceOrderFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  serviceOrder,
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ServiceOrderFormData>();

  // Estados para busca
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [mechanics] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [clientSearchLoading, setClientSearchLoading] = useState(false);
  const [vehicleSearchLoading, setVehicleSearchLoading] = useState(false);

  const clientSearch = watch('clientSearch');
  const vehicleSearch = watch('vehicleSearch');

  // Resetar formulário quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (serviceOrder) {
        reset({
          clientId: serviceOrder.clientId,
          vehicleId: serviceOrder.vehicleId,
          mechanicId: serviceOrder.mechanicId || '',
          descriptionLine1: serviceOrder.descriptionLine1 || '',
          descriptionLine2: serviceOrder.descriptionLine2 || '',
          descriptionLine3: serviceOrder.descriptionLine3 || '',
          descriptionLine4: serviceOrder.descriptionLine4 || '',
          descriptionLine5: serviceOrder.descriptionLine5 || '',
          descriptionLine6: serviceOrder.descriptionLine6 || '',
          descriptionLine7: serviceOrder.descriptionLine7 || '',
          descriptionLine8: serviceOrder.descriptionLine8 || '',
          descriptionLine9: serviceOrder.descriptionLine9 || '',
          clientSearch: serviceOrder.client?.name || '',
          vehicleSearch: serviceOrder.vehicle ? `${serviceOrder.vehicle.plate} - ${serviceOrder.vehicle.brand} ${serviceOrder.vehicle.model}` : '',
        });
        setSelectedClient(serviceOrder.client || null);
        setSelectedVehicle(serviceOrder.vehicle || null);
      } else {
        reset({
          clientId: '',
          vehicleId: '',
          mechanicId: '',
          descriptionLine1: '',
          descriptionLine2: '',
          descriptionLine3: '',
          descriptionLine4: '',
          descriptionLine5: '',
          descriptionLine6: '',
          descriptionLine7: '',
          descriptionLine8: '',
          descriptionLine9: '',
          clientSearch: '',
          vehicleSearch: '',
        });
        setSelectedClient(null);
        setSelectedVehicle(null);
      }
    }
  }, [isOpen, serviceOrder, reset]);

  // Buscar clientes
  useEffect(() => {
    const searchClients = async () => {
      if (clientSearch && clientSearch.length >= 2) {
        try {
          setClientSearchLoading(true);
          const response = await clientService.getClients({
            search: clientSearch,
            limit: 10,
            active: true,
          });
          setClients(response.data.items);
        } catch (error) {
          console.error('Erro ao buscar clientes:', error);
        } finally {
          setClientSearchLoading(false);
        }
      } else {
        setClients([]);
      }
    };

    const debounceTimer = setTimeout(searchClients, 300);
    return () => clearTimeout(debounceTimer);
  }, [clientSearch]);

  // Buscar veículos do cliente selecionado
  useEffect(() => {
    const searchVehicles = async () => {
      if (selectedClient && vehicleSearch && vehicleSearch.length >= 1) {
        try {
          setVehicleSearchLoading(true);
          // Aqui você implementaria a busca de veículos do cliente
          // const response = await vehicleService.getVehiclesByClient(selectedClient.id, vehicleSearch);
          // setVehicles(response.data.items);
          setVehicles([]); // Placeholder
        } catch (error) {
          console.error('Erro ao buscar veículos:', error);
        } finally {
          setVehicleSearchLoading(false);
        }
      } else {
        setVehicles([]);
      }
    };

    const debounceTimer = setTimeout(searchVehicles, 300);
    return () => clearTimeout(debounceTimer);
  }, [selectedClient, vehicleSearch]);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setValue('clientId', client.id);
    setValue('clientSearch', client.name);
    setClients([]);
    
    // Limpar veículo selecionado
    setSelectedVehicle(null);
    setValue('vehicleId', '');
    setValue('vehicleSearch', '');
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setValue('vehicleId', vehicle.id);
    setValue('vehicleSearch', `${vehicle.plate} - ${vehicle.brand} ${vehicle.model}`);
    setVehicles([]);
  };

  const handleFormSubmit = async (data: ServiceOrderFormData) => {
    await onSubmit(data);
  };

  const handleClose = () => {
    reset();
    setSelectedClient(null);
    setSelectedVehicle(null);
    setClients([]);
    setVehicles([]);
    onClose();
  };

  const descriptionLines = [
    { key: 'descriptionLine1', label: 'Linha 1' },
    { key: 'descriptionLine2', label: 'Linha 2' },
    { key: 'descriptionLine3', label: 'Linha 3' },
    { key: 'descriptionLine4', label: 'Linha 4' },
    { key: 'descriptionLine5', label: 'Linha 5' },
    { key: 'descriptionLine6', label: 'Linha 6' },
    { key: 'descriptionLine7', label: 'Linha 7' },
    { key: 'descriptionLine8', label: 'Linha 8' },
    { key: 'descriptionLine9', label: 'Linha 9' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={serviceOrder ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
      size="xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Seleção de Cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Cliente *
          </label>
          <div className="relative">
            <input
              {...register('clientSearch', {
                required: 'Cliente é obrigatório',
              })}
              type="text"
              placeholder="Digite o nome do cliente..."
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
            />
            {clientSearchLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <LoadingSpinner size="sm" />
              </div>
            )}
            
            {/* Lista de clientes */}
            {clients.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {clients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => handleClientSelect(client)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium">{client.name}</p>
                      {client.phone && (
                        <p className="text-sm text-gray-500">{client.phone}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.clientSearch && (
            <p className="mt-1 text-sm text-red-600">{errors.clientSearch.message}</p>
          )}
        </div>

        {/* Seleção de Veículo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Car className="w-4 h-4 inline mr-2" />
            Veículo *
          </label>
          <div className="relative">
            <input
              {...register('vehicleSearch', {
                required: 'Veículo é obrigatório',
              })}
              type="text"
              placeholder={selectedClient ? "Digite a placa ou modelo..." : "Selecione um cliente primeiro"}
              disabled={loading || !selectedClient}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
            />
            {vehicleSearchLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <LoadingSpinner size="sm" />
              </div>
            )}
            
            {/* Lista de veículos */}
            {vehicles.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {vehicles.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    type="button"
                    onClick={() => handleVehicleSelect(vehicle)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium">{vehicle.plate}</p>
                      <p className="text-sm text-gray-500">
                        {vehicle.brand} {vehicle.model} - {vehicle.year}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.vehicleSearch && (
            <p className="mt-1 text-sm text-red-600">{errors.vehicleSearch.message}</p>
          )}
        </div>

        {/* Seleção de Mecânico */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Wrench className="w-4 h-4 inline mr-2" />
            Mecânico
          </label>
          <select
            {...register('mechanicId')}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
          >
            <option value="">Selecione um mecânico...</option>
            {mechanics.map((mechanic) => (
              <option key={mechanic.id} value={mechanic.id}>
                {mechanic.name}
              </option>
            ))}
          </select>
        </div>

        {/* Descrição do Serviço - 9 Linhas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <FileText className="w-4 h-4 inline mr-2" />
            Descrição do Serviço
          </label>
          <div className="space-y-3">
            {descriptionLines.map((line) => (
              <div key={line.key}>
                <label className="block text-xs text-gray-500 mb-1">
                  {line.label}
                </label>
                <textarea
                  {...register(line.key as keyof ServiceOrderFormData)}
                  rows={2}
                  placeholder={`Descrição ${line.label.toLowerCase()}...`}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 resize-none text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Botões */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !selectedClient || !selectedVehicle}
            className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading && <LoadingSpinner size="sm" color="white" className="mr-2" />}
            {serviceOrder ? 'Atualizar' : 'Criar'} OS
          </button>
        </div>
      </form>
    </Modal>
  );
};