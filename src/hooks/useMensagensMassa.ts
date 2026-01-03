import { useState, useEffect, useCallback } from 'react';
import { MensagemMassa } from '@/types/MensagemMassa';
import { supabase } from '@/lib/supabase';

const MAX_MENSAGENS = 50;

export const useMensagensMassa = () => {
  const [mensagens, setMensagens] = useState<MensagemMassa[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMensagens = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('mensagens_massa')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar mensagens em massa:', error);
      setMensagens([]);
    } else {
      setMensagens(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMensagens();
  }, [fetchMensagens]);

  const canSendMore = mensagens.length < MAX_MENSAGENS;
  const remainingSlots = MAX_MENSAGENS - mensagens.length;

  const extractMediaPath = (url: string | null): string | null => {
    if (!url) return null;
    // Extract path from URL like: https://xxx.supabase.co/storage/v1/object/public/whatsapp-media/messages/file.jpg
    const match = url.match(/whatsapp-media\/(.+)$/);
    return match ? match[1] : null;
  };

  const createMensagem = async (
    instancia: string,
    phones: string[],
    title: string,
    text: string,
    mediaUrl: string | null,
    mediaType: 'image' | 'video' | 'document' | null
  ): Promise<{ data?: MensagemMassa; error?: string }> => {
    if (!canSendMore) {
      return { error: `Limite de ${MAX_MENSAGENS} mensagens atingido. Exclua algumas mensagens do histórico para continuar.` };
    }

    const { data, error } = await supabase
      .from('mensagens_massa')
      .insert({
        instancia,
        phones,
        title,
        text,
        media_url: mediaUrl,
        media_type: mediaType,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar mensagem em massa:', error);
      return { error: error.message };
    }

    setMensagens(prev => [data, ...prev]);
    return { data };
  };

  const deleteMensagem = async (id: string): Promise<{ error?: string }> => {
    const mensagem = mensagens.find(m => m.id === id);
    
    // Delete media from storage if exists
    if (mensagem?.media_url) {
      const mediaPath = extractMediaPath(mensagem.media_url);
      if (mediaPath) {
        const { error: storageError } = await supabase.storage
          .from('whatsapp-media')
          .remove([mediaPath]);
        
        if (storageError) {
          console.error('Erro ao excluir mídia:', storageError);
        }
      }
    }

    const { error } = await supabase
      .from('mensagens_massa')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir mensagem em massa:', error);
      return { error: error.message };
    }

    setMensagens(prev => prev.filter(m => m.id !== id));
    return {};
  };

  return {
    mensagens,
    loading,
    createMensagem,
    deleteMensagem,
    canSendMore,
    remainingSlots,
    maxMensagens: MAX_MENSAGENS,
    refetch: fetchMensagens,
  };
};
