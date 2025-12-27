import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import ImageIcon from '@mui/icons-material/Image';
import VideocamIcon from '@mui/icons-material/Videocam';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import { useToast } from '@/hooks/use-toast';

const EMOJIS = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '👍', '👎', '👏', '🙌', '🤝', '💪', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💯', '✅', '⭐', '🔥', '🎉', '🎊'];

const MensagensMassa = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [media, setMedia] = useState<{ file: File; type: 'image' | 'video'; preview: string } | null>(null);
  const [emojiAnchor, setEmojiAnchor] = useState<HTMLButtonElement | null>(null);

  const handleEmojiClick = (emoji: string) => {
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

  const handleEnviar = () => {
    if (!titulo.trim()) {
      toast({ title: 'Erro', description: 'Digite um título para a mensagem', variant: 'destructive' });
      return;
    }
    if (!mensagem.trim()) {
      toast({ title: 'Erro', description: 'Digite uma mensagem', variant: 'destructive' });
      return;
    }

    // Aqui você pode implementar a lógica de envio
    console.log({ titulo, mensagem, media: media?.file });
    
    toast({ title: 'Sucesso', description: 'Mensagem preparada para envio em massa!' });
    
    // Limpar campos
    setTitulo('');
    setMensagem('');
    handleRemoveMedia();
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'hsl(var(--background))', py: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ color: 'hsl(var(--foreground))' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ color: 'hsl(var(--foreground))', fontWeight: 700 }}>
            Mensagens em Massa - WhatsApp
          </Typography>
        </Box>

        <Paper sx={{ p: 4, bgcolor: 'hsl(var(--card))', borderRadius: 3 }}>
          {/* Título com destaque */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ color: 'hsl(var(--foreground))', mb: 1, fontWeight: 600 }}>
              Título da Mensagem
            </Typography>
            <TextField
              fullWidth
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Digite o título em destaque..."
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
          </Box>

          {/* Mensagem com emojis */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}>
                Mensagem
              </Typography>
              <IconButton 
                onClick={(e) => setEmojiAnchor(e.currentTarget)}
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
            
            {/* Popover de Emojis */}
            <Popover
              open={Boolean(emojiAnchor)}
              anchorEl={emojiAnchor}
              onClose={() => setEmojiAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Box sx={{ p: 2, maxWidth: 320, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {EMOJIS.map((emoji, index) => (
                  <IconButton 
                    key={index} 
                    onClick={() => handleEmojiClick(emoji)}
                    sx={{ fontSize: '1.5rem', p: 0.5 }}
                  >
                    {emoji}
                  </IconButton>
                ))}
              </Box>
            </Popover>
          </Box>

          {/* Upload de Mídia */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ color: 'hsl(var(--foreground))', mb: 2, fontWeight: 600 }}>
              Adicionar Mídia
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
            startIcon={<SendIcon />}
            onClick={handleEnviar}
            sx={{
              bgcolor: '#25D366',
              color: '#fff',
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              '&:hover': { bgcolor: '#128C7E' },
            }}
          >
            Preparar Envio em Massa
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default MensagensMassa;
