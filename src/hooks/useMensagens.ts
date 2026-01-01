import { useState, useEffect, useCallback } from 'react';
import { Mensagem } from '@/types/Mensagem';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const useMensagens = () => {
  const { user } = useAuth();
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMensagens = useCallback(async () => {
    if (!user) {
      setMensagens([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('mensagens')
      .select(`
        *,
        servico:servicos(nome)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar mensagens:', error);
      setMensagens([]);
    } else {
      setMensagens(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMensagens();
  }, [fetchMensagens]);

  const uploadArquivo = async (file: File, servicoId: string): Promise<{ path?: string; error?: string }> => {
    if (!user) {
      return { error: 'Usuário não autenticado' };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${servicoId}/${Date.now()}.${fileExt}`;
    const filePath = `mensagens/servicos/${fileName}`;

    const { error } = await supabase.storage
      .from('mensagens')
      .upload(filePath, file);

    if (error) {
      console.error('Erro ao fazer upload:', error);
      return { error: error.message };
    }

    return { path: filePath };
  };

  const createMensagem = async (
    servicoId: string,
    titulo: string,
    template: string,
    tipoMidia?: 'imagem' | 'video',
    arquivo?: File
  ): Promise<{ data?: Mensagem; error?: string }> => {
    if (!user) {
      return { error: 'Usuário não autenticado' };
    }

    let arquivoPath: string | null = null;

    // Upload file if provided
    if (arquivo && tipoMidia) {
      const { path, error } = await uploadArquivo(arquivo, servicoId);
      if (error) {
        return { error: `Erro no upload: ${error}` };
      }
      arquivoPath = path || null;
    }

    // Deactivate other messages for this service
    await supabase
      .from('mensagens')
      .update({ ativa: false })
      .eq('servico_id', servicoId)
      .eq('user_id', user.id);

    const { data, error } = await supabase
      .from('mensagens')
      .insert({
        user_id: user.id,
        servico_id: servicoId,
        titulo: titulo.trim(),
        template: template.trim(),
        tipo_midia: tipoMidia || null,
        arquivo_path: arquivoPath,
        ativa: true,
      })
      .select(`
        *,
        servico:servicos(nome)
      `)
      .single();

    if (error) {
      console.error('Erro ao criar mensagem:', error);
      return { error: error.message };
    }

    setMensagens(prev => [data, ...prev]);
    return { data };
  };

  const toggleAtiva = async (id: string, servicoId: string): Promise<{ error?: string }> => {
    if (!user) return { error: 'Usuário não autenticado' };

    // Deactivate all messages for this service
    await supabase
      .from('mensagens')
      .update({ ativa: false })
      .eq('servico_id', servicoId)
      .eq('user_id', user.id);

    // Activate the selected one
    const { error } = await supabase
      .from('mensagens')
      .update({ ativa: true })
      .eq('id', id);

    if (error) {
      console.error('Erro ao ativar mensagem:', error);
      return { error: error.message };
    }

    setMensagens(prev => prev.map(m => ({
      ...m,
      ativa: m.id === id
    })));

    return {};
  };

  const deleteMensagem = async (id: string): Promise<{ error?: string }> => {
    const mensagem = mensagens.find(m => m.id === id);
    
    // Delete file from storage if exists
    if (mensagem?.arquivo_path) {
      await supabase.storage
        .from('mensagens')
        .remove([mensagem.arquivo_path]);
    }

    const { error } = await supabase
      .from('mensagens')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir mensagem:', error);
      return { error: error.message };
    }

    setMensagens(prev => prev.filter(m => m.id !== id));
    return {};
  };

  const getArquivoUrl = (path: string): string => {
    const { data } = supabase.storage
      .from('mensagens')
      .getPublicUrl(path);
    return data.publicUrl;
  };

  return {
    mensagens,
    loading,
    createMensagem,
    toggleAtiva,
    deleteMensagem,
    getArquivoUrl,
    refetch: fetchMensagens,
  };
};
