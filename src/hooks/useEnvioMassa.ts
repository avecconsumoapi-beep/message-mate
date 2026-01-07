import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface EnvioMassaState {
  enviando: boolean;
  cancelando: boolean;
}

const POLLING_INTERVAL = 30000; // 30 segundos

export const useEnvioMassa = () => {
  const [state, setState] = useState<EnvioMassaState>({ enviando: false, cancelando: false });
  const [loading, setLoading] = useState(true);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setState({ enviando: false, cancelando: false });
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('enviando, cancelando')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('[useEnvioMassa] Erro ao buscar status:', error);
      setLoading(false);
      return;
    }

    const enviando = data?.enviando ?? false;
    const cancelando = data?.cancelando ?? false;

    // Corrigir estado inválido: cancelando=true mas enviando=false
    if (!enviando && cancelando) {
      await supabase
        .from('profiles')
        .update({ cancelando: false })
        .eq('id', user.id);
      setState({ enviando: false, cancelando: false });
    } else {
      setState({ enviando, cancelando });
    }

    setLoading(false);
  }, []);

  // Inicia o polling
  const startPolling = useCallback(() => {
    if (pollingRef.current) return;
    
    pollingRef.current = setInterval(() => {
      fetchStatus();
    }, POLLING_INTERVAL);
  }, [fetchStatus]);

  // Para o polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Ao abrir a tela, busca o status e inicia polling se necessário
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Gerencia o polling baseado no estado
  useEffect(() => {
    if (state.enviando || state.cancelando) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [state.enviando, state.cancelando, startPolling, stopPolling]);

  // Inicia o envio: seta enviando=true, cancelando=false
  const iniciarEnvio = async (): Promise<{ error?: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado' };

    // Verifica se já está enviando
    if (state.enviando) {
      return { error: 'Já existe um envio em andamento' };
    }

    const { error } = await supabase
      .from('profiles')
      .update({ enviando: true, cancelando: false })
      .eq('id', user.id);

    if (error) {
      console.error('[useEnvioMassa] Erro ao iniciar envio:', error);
      return { error: error.message };
    }

    setState({ enviando: true, cancelando: false });
    return {};
  };

  // Solicita cancelamento: seta cancelando=true (mantém enviando=true)
  const solicitarCancelamento = async (): Promise<{ error?: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuário não autenticado' };

    if (!state.enviando) {
      return { error: 'Nenhum envio em andamento para cancelar' };
    }

    const { error } = await supabase
      .from('profiles')
      .update({ cancelando: true })
      .eq('id', user.id);

    if (error) {
      console.error('[useEnvioMassa] Erro ao solicitar cancelamento:', error);
      return { error: error.message };
    }

    setState(prev => ({ ...prev, cancelando: true }));
    return {};
  };

  // Computa o estado da UI
  const getUIState = (): 'ocioso' | 'enviando' | 'cancelando' => {
    if (state.cancelando) return 'cancelando';
    if (state.enviando) return 'enviando';
    return 'ocioso';
  };

  return {
    ...state,
    loading,
    uiState: getUIState(),
    iniciarEnvio,
    solicitarCancelamento,
    refetch: fetchStatus,
  };
};
