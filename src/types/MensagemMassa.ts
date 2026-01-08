export type MensagemMassaStatus = 'enviando' | 'enviado' | 'cancelado';

export interface MensagemMassa {
  id: string;
  user_id: string;
  instancia: string;
  phones: string[];
  title: string;
  text: string;
  media_url: string | null;
  media_type: 'image' | 'video' | 'document' | null;
  status: MensagemMassaStatus;
  created_at: string;
}
