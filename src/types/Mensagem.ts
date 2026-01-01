export interface Mensagem {
  id: string;
  user_id: string;
  servico_id: string;
  titulo: string;
  template: string;
  tipo_midia: 'imagem' | 'video' | null;
  arquivo_path: string | null;
  ativa: boolean;
  created_at: string;
  // Joined data
  servico?: {
    nome: string;
  };
}
