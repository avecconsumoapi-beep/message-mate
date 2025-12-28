import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  IconButton,
  Popover,
  Card,
  CardMedia,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import ImageIcon from '@mui/icons-material/Image';
import VideocamIcon from '@mui/icons-material/Videocam';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ContactsIcon from '@mui/icons-material/Contacts';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/AppLayout';
import { parseAndNormalizePhones } from '@/utils/phoneUtils';

const EMOJIS = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '👍', '👎', '👏', '🙌', '🤝', '💪', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💯', '✅', '⭐', '🔥', '🎉', '🎊'];

const MensagensMassa = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [media, setMedia] = useState<{ file: File; type: 'image' | 'video'; preview: string } | null>(null);
  const [tituloEmojiAnchor, setTituloEmojiAnchor] = useState<HTMLButtonElement | null>(null);
  const [mensagemEmojiAnchor, setMensagemEmojiAnchor] = useState<HTMLButtonElement | null>(null);
  const [phones, setPhones] = useState<string[]>([]);
  const [excelFileName, setExcelFileName] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleTituloEmojiClick = (emoji: string) => {
    setTitulo(prev => prev + emoji);
  };

  const handleMensagemEmojiClick = (emoji: string) => {
    setMensagem(prev => prev + emoji);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setMedia({ file, type, preview });
    }
  };

  const handleRemoveMedia = () => {
    if (media) {
      URL.revokeObjectURL(media.preview);
      setMedia(null);
    }
  };

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

      // Check if 'phone' column exists
      if (jsonData.length > 0) {
        const hasPhoneColumn = Object.keys(jsonData[0]).some(
          key => key.toLowerCase() === 'phone'
        );
        
        if (!hasPhoneColumn) {
          toast({ 
            title: 'Erro', 
            description: 'O arquivo deve conter uma coluna chamada "phone"', 
            variant: 'destructive' 
          });
          return;
        }
      }

      const normalizedPhones = parseAndNormalizePhones(jsonData);
      setPhones(normalizedPhones);
      setExcelFileName(file.name);
      
      toast({ 
        title: 'Sucesso', 
        description: `${normalizedPhones.length} contatos carregados (duplicados removidos)` 
      });
    } catch (error) {
      console.error('Error parsing Excel:', error);
      toast({ 
        title: 'Erro', 
        description: 'Erro ao processar o arquivo Excel', 
        variant: 'destructive' 
      });
    }
  };

  const handleRemoveContacts = () => {
    setPhones([]);
    setExcelFileName('');
    if (excelInputRef.current) {
      excelInputRef.current.value = '';
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const handleEnviar = async () => {
    if (!titulo.trim()) {
      toast({ title: 'Erro', description: 'Digite um título para a mensagem', variant: 'destructive' });
      return;
    }
    if (!mensagem.trim()) {
      toast({ title: 'Erro', description: 'Digite uma mensagem', variant: 'destructive' });
      return;
    }
    if (phones.length === 0) {
      toast({ title: 'Erro', description: 'Faça upload de um arquivo Excel com contatos', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      let mediaUrl: string | null = null;
      let mediaType: 'image' | 'video' | null = null;

      // Convert media to base64 for backend to handle
      if (media) {
        mediaUrl = await fileToBase64(media.file);
        mediaType = media.type;
      }

      const payload = {
        job_id: crypto.randomUUID(),
        message: {
          id: crypto.randomUUID(),
          title: titulo,
          text: mensagem,
          media_url: mediaUrl,
          media_type: mediaType,
        },
        phones: phones,
      };

      console.log('Payload to send:', payload);

      // TODO: Replace with actual API endpoint
      // const response = await fetch('YOUR_API_ENDPOINT', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });

      toast({ title: 'Sucesso', description: `Mensagem preparada para ${phones.length} contatos!` });
      
      // Reset form
      setTitulo('');
      setMensagem('');
      handleRemoveMedia();
      handleRemoveContacts();
    } catch (error) {
      console.error('Error sending:', error);
      toast({ title: 'Erro', description: 'Erro ao preparar envio', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const EmojiPopover = ({ 
    anchor, 
    onClose, 
    onSelect 
  }: { 
    anchor: HTMLButtonElement | null; 
    onClose: () => void; 
    onSelect: (emoji: string) => void;
  }) => (
    <Popover
      open={Boolean(anchor)}
      anchorEl={anchor}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Box sx={{ p: 2, maxWidth: 320, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {EMOJIS.map((emoji, index) => (
          <IconButton 
            key={index} 
            onClick={() => onSelect(emoji)}
            sx={{ fontSize: '1.5rem', p: 0.5 }}
          >
            {emoji}
          </IconButton>
        ))}
      </Box>
    </Popover>
  );

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ color: 'hsl(var(--foreground))', fontWeight: 700, mb: 4 }}>
          Mensagens em Massa - WhatsApp
        </Typography>

        <Paper sx={{ p: 4, bgcolor: 'hsl(var(--card))', borderRadius: 3 }}>
          {/* Título com destaque e emoji */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}>
                Título da Mensagem
              </Typography>
              <IconButton 
                onClick={(e) => setTituloEmojiAnchor(e.currentTarget)}
                sx={{ color: 'hsl(var(--primary))' }}
              >
                <EmojiEmotionsIcon />
              </IconButton>
            </Box>
            <TextField
              fullWidth
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Digite o título em destaque... 🎉"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'hsl(var(--background))',
                  '& fieldset': { borderColor: 'hsl(var(--border))' },
                  '&:hover fieldset': { borderColor: 'hsl(var(--primary))' },
                  '&.Mui-focused fieldset': { borderColor: 'hsl(var(--primary))' },
                },
                '& .MuiInputBase-input': {
                  color: 'hsl(var(--foreground))',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                },
              }}
            />
            <EmojiPopover 
              anchor={tituloEmojiAnchor} 
              onClose={() => setTituloEmojiAnchor(null)} 
              onSelect={handleTituloEmojiClick} 
            />
          </Box>

          {/* Mensagem com emojis */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}>
                Mensagem
              </Typography>
              <IconButton 
                onClick={(e) => setMensagemEmojiAnchor(e.currentTarget)}
                sx={{ color: 'hsl(var(--primary))' }}
              >
                <EmojiEmotionsIcon />
              </IconButton>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={6}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Digite sua mensagem aqui... 😊"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'hsl(var(--background))',
                  '& fieldset': { borderColor: 'hsl(var(--border))' },
                  '&:hover fieldset': { borderColor: 'hsl(var(--primary))' },
                  '&.Mui-focused fieldset': { borderColor: 'hsl(var(--primary))' },
                },
                '& .MuiInputBase-input': {
                  color: 'hsl(var(--foreground))',
                },
              }}
            />
            <EmojiPopover 
              anchor={mensagemEmojiAnchor} 
              onClose={() => setMensagemEmojiAnchor(null)} 
              onSelect={handleMensagemEmojiClick} 
            />
          </Box>

          {/* Upload de Contatos Excel */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ color: 'hsl(var(--foreground))', mb: 2, fontWeight: 600 }}>
              Lista de Contatos (Excel)
            </Typography>
            
            <input
              type="file"
              accept=".xlsx,.xls"
              hidden
              ref={excelInputRef}
              onChange={handleExcelUpload}
            />

            {phones.length === 0 ? (
              <Button
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={() => excelInputRef.current?.click()}
                sx={{
                  borderColor: 'hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                  '&:hover': { borderColor: 'hsl(var(--primary))', bgcolor: 'hsl(var(--accent))' },
                }}
              >
                Carregar Excel com coluna "phone"
              </Button>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  icon={<ContactsIcon />}
                  label={`${phones.length} contatos - ${excelFileName}`}
                  color="primary"
                  onDelete={handleRemoveContacts}
                />
              </Box>
            )}

            <Alert severity="info" sx={{ mt: 2 }}>
              O arquivo Excel deve conter uma coluna chamada <strong>"phone"</strong>. 
              Os números serão normalizados para o formato DDI+DDD+número e duplicados serão removidos.
            </Alert>
          </Box>

          {/* Upload de Mídia */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ color: 'hsl(var(--foreground))', mb: 2, fontWeight: 600 }}>
              Adicionar Mídia (opcional)
            </Typography>
            
            {!media ? (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={fileInputRef}
                  onChange={(e) => handleFileSelect(e, 'image')}
                />
                <Button
                  variant="outlined"
                  startIcon={<ImageIcon />}
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = 'image/*';
                      fileInputRef.current.click();
                    }
                  }}
                  sx={{
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--foreground))',
                    '&:hover': { borderColor: 'hsl(var(--primary))', bgcolor: 'hsl(var(--accent))' },
                  }}
                >
                  Adicionar Imagem
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<VideocamIcon />}
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = 'video/*';
                      fileInputRef.current.click();
                    }
                  }}
                  sx={{
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--foreground))',
                    '&:hover': { borderColor: 'hsl(var(--primary))', bgcolor: 'hsl(var(--accent))' },
                  }}
                >
                  Adicionar Vídeo
                </Button>
              </Box>
            ) : (
              <Card sx={{ maxWidth: 400, position: 'relative', bgcolor: 'hsl(var(--background))' }}>
                {media.type === 'image' ? (
                  <CardMedia
                    component="img"
                    image={media.preview}
                    alt="Preview"
                    sx={{ maxHeight: 250, objectFit: 'contain' }}
                  />
                ) : (
                  <CardMedia
                    component="video"
                    src={media.preview}
                    controls
                    sx={{ maxHeight: 250 }}
                  />
                )}
                <IconButton
                  onClick={handleRemoveMedia}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'hsl(var(--destructive))',
                    color: 'hsl(var(--destructive-foreground))',
                    '&:hover': { bgcolor: 'hsl(var(--destructive) / 0.8)' },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Card>
            )}
          </Box>

          {/* Botão Enviar */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            onClick={handleEnviar}
            disabled={loading}
            sx={{
              bgcolor: '#25D366',
              color: '#fff',
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              '&:hover': { bgcolor: '#128C7E' },
              '&:disabled': { bgcolor: '#25D366', opacity: 0.7 },
            }}
          >
            {loading ? 'Preparando...' : 'Enviar em Massa'}
          </Button>
        </Paper>
      </Container>
    </AppLayout>
  );
};

export default MensagensMassa;
