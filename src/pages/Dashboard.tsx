import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Snackbar,
  Alert,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Stack,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Save,
  Delete,
  Message as MessageIcon,
  Info,
  Build as BuildIcon,
  Image as ImageIcon,
  VideoLibrary,
  Check,
  Settings,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useServicos } from '@/hooks/useServicos';
import { useMensagens } from '@/hooks/useMensagens';
import AppLayout from '@/components/AppLayout';

const placeholders = ['{{nome}}', '{{data}}', '{{servico}}'];

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const { servicos, loading: loadingServicos } = useServicos();
  const { mensagens, loading: loadingMensagens, createMensagem, deleteMensagem, toggleAtiva } = useMensagens();

  // Mensagem form
  const [titulo, setTitulo] = useState('');
  const [servicoId, setServicoId] = useState('');
  const [template, setTemplate] = useState('');
  const [tipoMidia, setTipoMidia] = useState<'imagem' | 'video' | ''>('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleSaveMensagem = async () => {
    if (!titulo.trim() || !servicoId || !template.trim()) {
      setSnackbar({ open: true, message: 'Preencha todos os campos obrigatórios', severity: 'error' });
      return;
    }

    setSaving(true);
    const { error } = await createMensagem(
      servicoId,
      titulo.trim(),
      template.trim(),
      tipoMidia || undefined,
      arquivo || undefined
    );
    setSaving(false);

    if (error) {
      setSnackbar({ open: true, message: error, severity: 'error' });
    } else {
      setSnackbar({ open: true, message: 'Mensagem salva com sucesso!', severity: 'success' });
      setTitulo('');
      setServicoId('');
      setTemplate('');
      setTipoMidia('');
      setArquivo(null);
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    setTemplate(prev => prev + placeholder);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArquivo(file);
      if (file.type.startsWith('image/')) {
        setTipoMidia('imagem');
      } else if (file.type.startsWith('video/')) {
        setTipoMidia('video');
      }
    }
  };

  const handleDeleteMensagem = async (id: string) => {
    const { error } = await deleteMensagem(id);
    if (error) {
      setSnackbar({ open: true, message: error, severity: 'error' });
    } else {
      setSnackbar({ open: true, message: 'Mensagem excluída', severity: 'success' });
    }
  };

  const handleToggleAtiva = async (id: string, servicoId: string) => {
    const { error } = await toggleAtiva(id, servicoId);
    if (error) {
      setSnackbar({ open: true, message: error, severity: 'error' });
    }
  };

  const servicosAtivos = servicos.filter(s => s.ativo);

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, md: 4 }, flexWrap: 'wrap', gap: 2 }}>
          <Typography 
            variant={isMobile ? 'h5' : 'h4'} 
            fontWeight="bold" 
            sx={{ color: 'hsl(var(--foreground))' }}
          >
            Dashboard
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Settings />}
            onClick={() => navigate('/servicos')}
            size={isMobile ? 'small' : 'medium'}
          >
            Gerenciar Serviços
          </Button>
        </Box>
        
        <Box sx={{ display: 'grid', gap: { xs: 2, md: 4 }, gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' } }}>
          {/* Form Card */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Typography 
                variant={isMobile ? 'h6' : 'h5'} 
                fontWeight="bold" 
                gutterBottom 
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <MessageIcon color="primary" />
                Nova Mensagem
              </Typography>
              <Divider sx={{ my: 2 }} />

              <TextField
                fullWidth
                label="Título da Mensagem"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="Ex: Confirmação de Agendamento"
                size={isMobile ? 'small' : 'medium'}
              />

              <FormControl fullWidth sx={{ mb: 2 }} size={isMobile ? 'small' : 'medium'}>
                <InputLabel>Serviço</InputLabel>
                <Select
                  value={servicoId}
                  label="Serviço"
                  onChange={(e) => setServicoId(e.target.value)}
                >
                  {servicosAtivos.length === 0 ? (
                    <MenuItem disabled>Nenhum serviço ativo</MenuItem>
                  ) : (
                    servicosAtivos.map((servico) => (
                      <MenuItem key={servico.id} value={servico.id}>
                        {servico.nome}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                  <Typography variant="body2" color="text.secondary">
                    Placeholders:
                  </Typography>
                  <Tooltip title="Clique para inserir na mensagem">
                    <Info fontSize="small" color="action" />
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {placeholders.map((p) => (
                    <Chip
                      key={p}
                      label={p}
                      size="small"
                      onClick={() => insertPlaceholder(p)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'primary.light', color: 'white' },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <TextField
                fullWidth
                label="Template da Mensagem"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                multiline
                rows={isMobile ? 3 : 4}
                sx={{ mb: 2 }}
                placeholder="Olá {{nome}}, seu agendamento para {{data}} foi confirmado..."
                size={isMobile ? 'small' : 'medium'}
              />

              {/* File Upload */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Mídia (opcional)
                </Typography>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ImageIcon />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isMobile ? 'Imagem' : 'Adicionar Imagem'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VideoLibrary />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isMobile ? 'Vídeo' : 'Adicionar Vídeo'}
                  </Button>
                </Stack>
                {arquivo && (
                  <Chip
                    label={arquivo.name}
                    onDelete={() => {
                      setArquivo(null);
                      setTipoMidia('');
                    }}
                    size="small"
                    color="info"
                    icon={tipoMidia === 'imagem' ? <ImageIcon /> : <VideoLibrary />}
                  />
                )}
              </Box>

              <Button
                fullWidth
                variant="contained"
                size={isMobile ? 'medium' : 'large'}
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                onClick={handleSaveMensagem}
                disabled={saving}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #0d9488, #0891b2)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0f766e, #0e7490)',
                  },
                }}
              >
                Salvar Mensagem
              </Button>
            </CardContent>
          </Card>

          {/* Messages List */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight="bold" gutterBottom>
                Mensagens Salvas
              </Typography>
              <Divider sx={{ my: 2 }} />

              {loadingMensagens ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : mensagens.length === 0 ? (
                <Paper sx={{ p: { xs: 3, md: 4 }, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2 }}>
                  <MessageIcon sx={{ fontSize: { xs: 40, md: 48 }, color: 'grey.400', mb: 2 }} />
                  <Typography color="text.secondary">
                    Nenhuma mensagem criada ainda
                  </Typography>
                </Paper>
              ) : (
                <List sx={{ maxHeight: { xs: 300, md: 400 }, overflow: 'auto' }}>
                  {mensagens.map((msg) => (
                    <ListItem
                      key={msg.id}
                      sx={{
                        bgcolor: msg.ativa ? 'success.50' : 'grey.50',
                        borderRadius: 2,
                        mb: 1,
                        border: msg.ativa ? '2px solid' : 'none',
                        borderColor: msg.ativa ? 'success.main' : 'transparent',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: { xs: 1, sm: 0 },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography fontWeight="medium" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                              {msg.titulo}
                            </Typography>
                            <Chip 
                              label={msg.servico?.nome || 'Serviço'} 
                              size="small" 
                              color="primary" 
                              variant="outlined" 
                            />
                            {msg.ativa && (
                              <Chip label="Ativa" size="small" color="success" icon={<Check />} />
                            )}
                            {msg.tipo_midia && (
                              <Chip 
                                label={msg.tipo_midia} 
                                size="small" 
                                color="info" 
                                variant="outlined"
                                icon={msg.tipo_midia === 'imagem' ? <ImageIcon /> : <VideoLibrary />}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              fontSize: { xs: '0.75rem', md: '0.875rem' },
                            }}
                          >
                            {msg.template}
                          </Typography>
                        }
                      />
                      <Stack 
                        direction="row" 
                        spacing={0.5}
                        sx={{ 
                          mt: { xs: 1, sm: 0 },
                          width: { xs: '100%', sm: 'auto' },
                          justifyContent: { xs: 'flex-end', sm: 'flex-start' },
                        }}
                      >
                        <Tooltip title={msg.ativa ? 'Desativar' : 'Ativar'}>
                          <IconButton
                            size="small"
                            color={msg.ativa ? 'success' : 'default'}
                            onClick={() => handleToggleAtiva(msg.id, msg.servico_id)}
                          >
                            <Check />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteMensagem(msg.id)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            severity={snackbar.severity} 
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </AppLayout>
  );
};

export default Dashboard;
