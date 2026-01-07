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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import ImageIcon from '@mui/icons-material/Image';
import VideocamIcon from '@mui/icons-material/Videocam';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ContactsIcon from '@mui/icons-material/Contacts';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/AppLayout';
import { parseAndNormalizePhones } from '@/utils/phoneUtils';
import { useMensagensMassa } from '@/hooks/useMensagensMassa';
import { MensagemMassa } from '@/types/MensagemMassa';
import { supabase } from '@/lib/supabase';

const EMOJIS = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '👍', '👎', '👏', '🙌', '🤝', '💪', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💯', '✅', '⭐', '🔥', '🎉', '🎊'];

const MensagensMassa = () => {
  const { toast } = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    mensagens, 
    loading: loadingMensagens, 
    createMensagem, 
    deleteMensagem, 
    canSendMore, 
    remainingSlots,
    maxMensagens 
  } = useMensagensMassa();
  
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [media, setMedia] = useState<{ file: File; type: 'image' | 'video'; preview: string } | null>(null);
  const [tituloEmojiAnchor, setTituloEmojiAnchor] = useState<HTMLButtonElement | null>(null);
  const [mensagemEmojiAnchor, setMensagemEmojiAnchor] = useState<HTMLButtonElement | null>(null);
  const [phones, setPhones] = useState<string[]>([]);
  const [excelFileName, setExcelFileName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [instancia, setInstancia] = useState<'instancia1' | 'instancia2'>('instancia1');
  const [selectedMensagem, setSelectedMensagem] = useState<MensagemMassa | null>(null);

  const handleTituloEmojiClick = (emoji: string) => {
    setTitulo(prev => prev + emoji);
  };

  const handleMensagemEmojiClick = (emoji: string) => {
    setMensagem(prev => prev + emoji);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const { convertMediaToStandardFormat } = await import('@/utils/mediaConverter');
        const convertedFile = await convertMediaToStandardFormat(file, type);
        const preview = URL.createObjectURL(convertedFile);
        setMedia({ file: convertedFile, type, preview });
        
        if (file.name !== convertedFile.name) {
          toast({
            title: 'Arquivo convertido',
            description: type === 'image' ? 'Imagem convertida para PNG' : 'Vídeo convertido para MP4',
          });
        }
      } catch (error) {
        console.error('Erro ao converter arquivo:', error);
        toast({
          title: 'Erro',
          description: 'Falha ao converter arquivo',
          variant: 'destructive',
        });
      }
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

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const sendToN8n = async (payload: unknown) => {
    const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

    console.log('[N8N] Enviando payload:', payload);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      console.log('[N8N] Status:', response.status);
      return { status: response.status, received: true };
    } catch (error: any) {
      clearTimeout(timeout);
      console.error('[N8N] Falha no envio:', error.message);
      throw new Error('Falha na comunicação com o servidor');
    }
  };

  const uploadMediaToSupabase = async (file: File): Promise<string> => {
    console.log('[UPLOAD] Início do upload');

    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `messages/${fileName}`;

    const url = `${SUPABASE_URL}/storage/v1/object/whatsapp-media/${filePath}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error('Falha ao fazer upload da mídia no Supabase');
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/whatsapp-media/${filePath}`;
    console.log('[UPLOAD] Upload concluído:', publicUrl);

    return publicUrl;
  };

  const handleDeleteMensagem = async (id: string) => {
    const { error } = await deleteMensagem(id);
    if (error) {
      toast({ title: 'Erro', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Sucesso', description: 'Mensagem excluída do histórico' });
    }
  };

  const handleEnviar = async () => {
    if (!mensagem.trim()) {
      toast({ title: 'Erro', description: 'Digite uma mensagem', variant: 'destructive' });
      return;
    }
    if (phones.length === 0) {
      toast({ title: 'Erro', description: 'Faça upload de um arquivo Excel com contatos', variant: 'destructive' });
      return;
    }
    if (!canSendMore) {
      toast({ 
        title: 'Limite atingido', 
        description: `Você atingiu o limite de ${maxMensagens} mensagens. Exclua algumas do histórico para continuar.`, 
        variant: 'destructive' 
      });
      return;
    }

    if (media && media.file.size > 16 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'A mídia deve ter no máximo 16MB',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);

    try {
      let mediaUrl: string | null = null;
      let mediaType: 'image' | 'video' | null = null;

      if (media) {
        mediaUrl = await uploadMediaToSupabase(media.file);
        mediaType = media.type;
      }

      const payload = {
        job_id: crypto.randomUUID(),
        instancia: instancia,
        message: {
          id: crypto.randomUUID(),
          title: titulo.trim() || null,
          text: mensagem,
          media_url: mediaUrl,
          media_type: mediaType,
        },
        phones: phones,
      };
      
      const result = await sendToN8n(payload);
      console.log('[N8N] Resultado:', result);

      // Save to Supabase
      const { error: saveError } = await createMensagem(
        instancia,
        phones,
        titulo.trim() || 'Sem título',
        mensagem,
        mediaUrl,
        mediaType
      );

      if (saveError) {
        console.error('Erro ao salvar mensagem:', saveError);
      }

      toast({ 
        title: 'Enviado!', 
        description: `Mensagem enviada para processamento (${phones.length} contatos)` 
      });
      
      // Reset form
      setTitulo('');
      setMensagem('');
      handleRemoveMedia();
      handleRemoveContacts();
    } catch (error: any) {
      console.error('Error sending:', error);
      toast({ 
        title: 'Erro', 
        description: error.message || 'Falha ao enviar', 
        variant: 'destructive' 
      });
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
        <Typography 
          variant={isMobile ? 'h5' : 'h4'} 
          sx={{ 
            color: 'hsl(var(--foreground))', 
            fontWeight: 700, 
            mb: { xs: 2, md: 4 },
            fontSize: { xs: '1.25rem', md: '2rem' },
          }}
        >
          Mensagens em Massa
        </Typography>

        <Box sx={{ display: 'grid', gap: { xs: 2, md: 4 }, gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' } }}>
          {/* Form */}
          <Paper sx={{ p: { xs: 2, md: 4 }, bgcolor: 'hsl(var(--card))', borderRadius: { xs: 2, md: 3 } }}>
            {/* Limite de mensagens */}
            {!canSendMore && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                Limite de {maxMensagens} mensagens atingido. Exclua algumas do histórico para continuar.
              </Alert>
            )}
            {canSendMore && remainingSlots <= 10 && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Você pode enviar mais {remainingSlots} mensagens. ({mensagens.length}/{maxMensagens})
              </Alert>
            )}

            {/* Seleção de Instância */}
            <Box sx={{ mb: { xs: 2, md: 3 } }}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: 'hsl(var(--foreground))', fontSize: { xs: '0.8rem', md: '1rem' } }}>
                  Selecionar Instância
                </InputLabel>
                <Select
                  value={instancia}
                  label="Selecionar Instância"
                  onChange={(e) => setInstancia(e.target.value as 'instancia1' | 'instancia2')}
                  sx={{
                    bgcolor: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                    fontSize: { xs: '0.85rem', md: '1rem' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'hsl(var(--border))' },
                  }}
                >
                  <MenuItem value="instancia1">Instância 1</MenuItem>
                  <MenuItem value="instancia2">Instância 2</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Título da Mensagem */}
            <Box sx={{ mb: { xs: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: 'hsl(var(--foreground))', fontWeight: 600, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                  Título da Mensagem
                </Typography>
                <IconButton 
                  size="small"
                  onClick={(e) => setTituloEmojiAnchor(e.currentTarget)}
                  sx={{ color: 'hsl(var(--primary))' }}
                >
                  <EmojiEmotionsIcon fontSize="small" />
                </IconButton>
              </Box>
              <TextField
                fullWidth
                size="small"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Digite o título em destaque..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'hsl(var(--background))',
                    '& fieldset': { borderColor: 'hsl(var(--border))' },
                  },
                  '& .MuiInputBase-input': {
                    color: 'hsl(var(--foreground))',
                    fontWeight: 600,
                    fontSize: { xs: '0.85rem', md: '1rem' },
                  },
                }}
              />
              <EmojiPopover 
                anchor={tituloEmojiAnchor} 
                onClose={() => setTituloEmojiAnchor(null)} 
                onSelect={handleTituloEmojiClick} 
              />
            </Box>

            {/* Mensagem */}
            <Box sx={{ mb: { xs: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: 'hsl(var(--foreground))', fontWeight: 600, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                  Mensagem
                </Typography>
                <IconButton 
                  size="small"
                  onClick={(e) => setMensagemEmojiAnchor(e.currentTarget)}
                  sx={{ color: 'hsl(var(--primary))' }}
                >
                  <EmojiEmotionsIcon fontSize="small" />
                </IconButton>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={isMobile ? 3 : 4}
                size="small"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Digite sua mensagem aqui..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'hsl(var(--background))',
                    '& fieldset': { borderColor: 'hsl(var(--border))' },
                  },
                  '& .MuiInputBase-input': { color: 'hsl(var(--foreground))', fontSize: { xs: '0.85rem', md: '1rem' } },
                }}
              />
              <EmojiPopover 
                anchor={mensagemEmojiAnchor} 
                onClose={() => setMensagemEmojiAnchor(null)} 
                onSelect={handleMensagemEmojiClick} 
              />
            </Box>

            {/* Upload de Contatos */}
            <Box sx={{ mb: { xs: 2, md: 3 } }}>
              <Typography variant="subtitle2" sx={{ color: 'hsl(var(--foreground))', mb: 1, fontWeight: 600, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
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
                  size="small"
                  startIcon={<UploadFileIcon />}
                  onClick={() => excelInputRef.current?.click()}
                  sx={{
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--foreground))',
                  }}
                >
                  Carregar Excel
                </Button>
              ) : (
                <Chip
                  icon={<ContactsIcon />}
                  label={`${phones.length} contatos - ${excelFileName}`}
                  color="primary"
                  size="small"
                  onDelete={handleRemoveContacts}
                />
              )}
            </Box>

            {/* Upload de Mídia */}
            <Box sx={{ mb: { xs: 2, md: 3 } }}>
              <Typography variant="subtitle2" sx={{ color: 'hsl(var(--foreground))', mb: 1, fontWeight: 600, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                Mídia (opcional)
              </Typography>
              
              {!media ? (
                <Stack direction="row" spacing={1}>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    ref={fileInputRef}
                    onChange={(e) => handleFileSelect(e, 'image')}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ImageIcon />}
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.accept = 'image/*';
                        fileInputRef.current.click();
                      }
                    }}
                    sx={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  >
                    Imagem
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VideocamIcon />}
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.accept = 'video/*';
                        fileInputRef.current.click();
                      }
                    }}
                    sx={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  >
                    Vídeo
                  </Button>
                </Stack>
              ) : (
                <Card sx={{ maxWidth: 300, position: 'relative', bgcolor: 'hsl(var(--background))' }}>
                  {media.type === 'image' ? (
                    <CardMedia
                      component="img"
                      image={media.preview}
                      alt="Preview"
                      sx={{ maxHeight: 150, objectFit: 'contain' }}
                    />
                  ) : (
                    <CardMedia
                      component="video"
                      src={media.preview}
                      controls
                      sx={{ maxHeight: 150 }}
                    />
                  )}
                  <IconButton
                    size="small"
                    onClick={handleRemoveMedia}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'hsl(var(--destructive))',
                      color: 'hsl(var(--destructive-foreground))',
                      '&:hover': { bgcolor: 'hsl(var(--destructive) / 0.8)' },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Card>
              )}
            </Box>

            {/* Botão Enviar */}
            <Button
              fullWidth
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SendIcon sx={{ fontSize: { xs: 18, md: 22 } }} />}
              onClick={handleEnviar}
              disabled={loading || !canSendMore}
              sx={{
                bgcolor: '#25D366',
                color: '#fff',
                py: { xs: 1, md: 1.5 },
                fontWeight: 600,
                fontSize: { xs: '0.85rem', md: '1rem' },
                '&:hover': { bgcolor: '#128C7E' },
                '&:disabled': { bgcolor: '#25D366', opacity: 0.7 },
              }}
            >
              {loading ? 'Preparando...' : 'Enviar em Massa'}
            </Button>
          </Paper>

          {/* Histórico */}
          <Paper sx={{ p: { xs: 2, md: 4 }, bgcolor: 'hsl(var(--card))', borderRadius: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <HistoryIcon sx={{ color: 'hsl(var(--primary))', fontSize: { xs: 20, md: 24 } }} />
              <Typography variant="h6" sx={{ color: 'hsl(var(--foreground))', fontWeight: 700, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                Histórico
              </Typography>
              <Chip 
                label={`${mensagens.length}/${maxMensagens}`} 
                size="small" 
                color={canSendMore ? 'primary' : 'error'}
              />
            </Box>
            <Divider sx={{ mb: 2, borderColor: 'hsl(var(--border))' }} />

            {loadingMensagens ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: { xs: 2, md: 4 } }}>
                <CircularProgress size={isMobile ? 24 : 40} />
              </Box>
            ) : mensagens.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: { xs: 2, md: 4 } }}>
                <HistoryIcon sx={{ fontSize: { xs: 36, md: 48 }, color: 'hsl(var(--muted-foreground))', mb: 1 }} />
                <Typography color="text.secondary" sx={{ fontSize: { xs: '0.85rem', md: '1rem' } }}>
                  Nenhuma mensagem enviada ainda
                </Typography>
              </Box>
            ) : (
              <List sx={{ maxHeight: { xs: 300, md: 500 }, overflow: 'auto' }}>
                {mensagens.map((msg) => (
                  <ListItem
                    key={msg.id}
                    onClick={() => setSelectedMensagem(msg)}
                    sx={{
                      bgcolor: 'hsl(var(--background))',
                      borderRadius: 2,
                      mb: 1,
                      border: '1px solid hsl(var(--border))',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        bgcolor: 'hsl(var(--accent))',
                      },
                    }}
                  >
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                            <Typography fontWeight="bold" sx={{ color: 'hsl(var(--foreground))', fontSize: { xs: '0.85rem', md: '1rem' } }}>
                              {msg.title || 'Sem título'}
                            </Typography>
                            <Chip label={msg.instancia} size="small" variant="outlined" sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }} />
                            <Chip label={`${msg.phones.length}`} size="small" color="primary" sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }} />
                            {msg.media_type && (
                              <Chip 
                                label={isMobile ? '' : msg.media_type} 
                                size="small" 
                                color="info"
                                icon={msg.media_type === 'image' ? <ImageIcon sx={{ fontSize: 14 }} /> : <VideocamIcon sx={{ fontSize: 14 }} />}
                                sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'hsl(var(--muted-foreground))',
                                mt: 0.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: isMobile ? 1 : 2,
                                WebkitBoxOrient: 'vertical',
                                fontSize: { xs: '0.75rem', md: '0.875rem' },
                              }}
                            >
                              {msg.text}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))', mt: 0.5, display: 'block', fontSize: { xs: '0.65rem', md: '0.75rem' } }}>
                              {formatDate(msg.created_at)}
                            </Typography>
                          </>
                        }
                      />
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMensagem(msg.id);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Box>

        {/* Modal de Detalhes */}
        <Dialog 
          open={!!selectedMensagem} 
          onClose={() => setSelectedMensagem(null)}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              bgcolor: 'hsl(var(--card))',
              color: 'hsl(var(--foreground))',
              maxHeight: isMobile ? '100vh' : '90vh',
              m: isMobile ? 0 : 2,
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid hsl(var(--border))',
            pb: 2,
            px: { xs: 2, md: 3 },
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
              <HistoryIcon sx={{ color: 'hsl(var(--primary))', fontSize: { xs: 20, md: 24 }, flexShrink: 0 }} />
              <Typography variant="h6" fontWeight="bold" noWrap sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                {selectedMensagem?.title || 'Sem título'}
              </Typography>
            </Box>
            <IconButton onClick={() => setSelectedMensagem(null)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 3, px: { xs: 2, md: 3 } }}>
            {selectedMensagem && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Info */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip label={selectedMensagem.instancia} size="small" variant="outlined" />
                  <Chip label={`${selectedMensagem.phones.length} contatos`} size="small" color="primary" />
                  {selectedMensagem.media_type && (
                    <Chip 
                      label={selectedMensagem.media_type} 
                      size="small" 
                      color="info"
                      icon={selectedMensagem.media_type === 'image' ? <ImageIcon /> : <VideocamIcon />}
                    />
                  )}
                </Box>

                {/* Data */}
                <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                  Enviado em: {formatDate(selectedMensagem.created_at)}
                </Typography>

                {/* Mensagem */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'hsl(var(--foreground))' }}>
                    Mensagem
                  </Typography>
                  <Paper sx={{ 
                    p: 2, 
                    bgcolor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 2,
                  }}>
                    <Typography sx={{ whiteSpace: 'pre-wrap', color: 'hsl(var(--foreground))' }}>
                      {selectedMensagem.text}
                    </Typography>
                  </Paper>
                </Box>

                {/* Mídia */}
                {selectedMensagem.media_url && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'hsl(var(--foreground))' }}>
                      Mídia
                    </Typography>
                    {selectedMensagem.media_type === 'image' ? (
                      <Box 
                        component="img"
                        src={selectedMensagem.media_url}
                        alt="Mídia"
                        sx={{ 
                          maxWidth: '100%', 
                          maxHeight: 200, 
                          borderRadius: 2,
                          border: '1px solid hsl(var(--border))',
                        }}
                      />
                    ) : (
                      <Box
                        component="video"
                        src={selectedMensagem.media_url}
                        controls
                        sx={{ 
                          maxWidth: '100%', 
                          maxHeight: 200, 
                          borderRadius: 2,
                          border: '1px solid hsl(var(--border))',
                        }}
                      />
                    )}
                  </Box>
                )}

                {/* Lista de Contatos */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'hsl(var(--foreground))', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon fontSize="small" />
                    Contatos Enviados ({selectedMensagem.phones.length})
                  </Typography>
                  <Paper sx={{ 
                    bgcolor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 2,
                    maxHeight: 200,
                    overflow: 'auto',
                  }}>
                    <List dense>
                      {selectedMensagem.phones.map((phone, index) => (
                        <ListItem 
                          key={index}
                          sx={{
                            borderBottom: index < selectedMensagem.phones.length - 1 ? '1px solid hsl(var(--border))' : 'none',
                          }}
                        >
                          <PhoneIcon sx={{ mr: 1, fontSize: 16, color: 'hsl(var(--muted-foreground))' }} />
                          <ListItemText 
                            primary={phone}
                            primaryTypographyProps={{
                              fontFamily: 'monospace',
                              fontSize: '0.875rem',
                              color: 'hsl(var(--foreground))',
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Box>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </AppLayout>
  );
};

export default MensagensMassa;
