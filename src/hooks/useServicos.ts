import { useState, useEffect, useCallback } from 'react';
import { Servico } from '@/types/Servico';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const useServicos = () => {
  const { user } = useAuth();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServicos = useCallback(async () => {
    if (!user) {
      setServicos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('servicos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar serviços:', error);
      setServicos([]);
    } else {
      setServicos(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchServicos();
  }, [fetchServicos]);

  const createServico = async (nome: string): Promise<{ data?: Servico; error?: string }> => {
    if (!user) {
      return { error: 'Usuário não autenticado' };
    }

    const { data, error } = await supabase
      .from('servicos')
      .insert({
        user_id: user.id,
        nome: nome.trim(),
        ativo: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar serviço:', error);
      return { error: error.message };
    }

    setServicos(prev => [data, ...prev]);
    return { data };
  };

  const updateServico = async (id: string, updates: Partial<Pick<Servico, 'nome' | 'ativo'>>): Promise<{ error?: string }> => {
    const { error } = await supabase
      .from('servicos')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar serviço:', error);
      return { error: error.message };
    }

    setServicos(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    return {};
  };

  const deleteServico = async (id: string): Promise<{ error?: string }> => {
    const { error } = await supabase
      .from('servicos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir serviço:', error);
      return { error: error.message };
    }

    setServicos(prev => prev.filter(s => s.id !== id));
    return {};
  };

  return {
    servicos,
    loading,
    createServico,
    updateServico,
    deleteServico,
    refetch: fetchServicos,
  };
};
