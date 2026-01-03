export interface MensagemMassa {
  id: string;
  instancia: string;
  phones: string[];
  title: string;
  text: string;
  media_url: string | null;
  media_type: 'image' | 'video' | 'document' | null;
  created_at: string;
}
