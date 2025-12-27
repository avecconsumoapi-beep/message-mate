import { useState, useEffect } from 'react';
import { Service } from '@/types/Service';
import { useAuth } from '@/contexts/AuthContext';

const STORAGE_KEY = 'user_services';

export const useServices = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadServices();
    }
    setLoading(false);
  }, [user]);

  const loadServices = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const allServices: Service[] = JSON.parse(stored);
      const userServices = allServices.filter(s => s.user_id === user?.id);
      setServices(userServices);
    }
  };

  const saveService = (codigo: string, nome: string, descricao: string): Service => {
    const newService: Service = {
      id: crypto.randomUUID(),
      user_id: user?.id || '',
      codigo,
      nome,
      descricao,
      created_at: new Date().toISOString(),
    };

    const stored = localStorage.getItem(STORAGE_KEY);
    const allServices: Service[] = stored ? JSON.parse(stored) : [];
    allServices.push(newService);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allServices));
    
    setServices(prev => [...prev, newService]);
    return newService;
  };

  const deleteService = (id: string) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const allServices: Service[] = JSON.parse(stored);
      const filtered = allServices.filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      setServices(prev => prev.filter(s => s.id !== id));
    }
  };

  return { services, loading, saveService, deleteService, refetch: loadServices };
};
