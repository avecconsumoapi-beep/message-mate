import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
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
  ListItemSecondaryAction,
  Divider,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Logout,
  Send,
  Save,
  Delete,
  Build as BuildIcon,
  Message as MessageIcon,
  Info,
  Campaign as CampaignIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { useServices } from '@/hooks/useServices';

const placeholders = ['{{nome}}', '{{data}}', '{{servico}}'];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { messages, saveMessage, deleteMessage } = useMessages();
  const { services } = useServices();

  const [nome, setNome] = useState('');
  const [servicoId, setServicoId] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSave = () => {
    if (!nome.trim() || !servicoId || !mensagem.trim()) {
      setSnackbar({ open: true, message: 'Preencha todos os campos', severity: 'error' });
      return;
    }

    const selectedService = services.find(s => s.id === servicoId);
    const servicoNome = selectedService?.nome || '';
    
    saveMessage(nome.trim(), servicoNome, mensagem.trim());
    setSnackbar({ open: true, message: 'Mensagem salva com sucesso!', severity: 'success' });
    setNome('');
    setServicoId('');
    setMensagem('');
  };

  const insertPlaceholder = (placeholder: string) => {
    setMensagem(prev => prev + placeholder);
  };

  const handleDelete = (id: string) => {
    deleteMessage(id);
    setSnackbar({ open: true, message: 'Mensagem excluída', severity: 'success' });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <AppBar
        position="static"
        sx={{
          background: 'linear-gradient(135deg, #0d9488, #0891b2)',
        }}
      >
        <Toolbar>
          <Send sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            MessageFlow
          </Typography>
          <Button
            color="inherit"
            startIcon={<CampaignIcon />}
            onClick={() => navigate('/mensagens-massa')}
            sx={{ mr: 2 }}
          >
            Mensagens em Massa
          </Button>
          <Button
            color="inherit"
            startIcon={<BuildIcon />}
            onClick={() => navigate('/services')}
            sx={{ mr: 2 }}
          >
            Serviços
          </Button>
          <Typography variant="body2" sx={{ mr: 2, opacity: 0.9 }}>
            {user?.email}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          {/* Form Card */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MessageIcon color="primary" />
                Nova Mensagem
              </Typography>
              <Divider sx={{ my: 2 }} />

              <TextField
                fullWidth
                label="Nome da Mensagem"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="Ex: Confirmação de Agendamento"
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Serviço</InputLabel>
                <Select
                  value={servicoId}
                  label="Serviço"
                  onChange={(e) => setServicoId(e.target.value)}
                >
                  {services.length === 0 ? (
                    <MenuItem disabled>Nenhum serviço cadastrado</MenuItem>
                  ) : (
                    services.map((service) => (
                      <MenuItem key={service.id} value={service.id}>
                        {service.nome}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Placeholders disponíveis:
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
                label="Mensagem Personalizada"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                multiline
                rows={5}
                sx={{ mb: 3 }}
                placeholder="Olá {{nome}}, seu agendamento para {{data}} foi confirmado..."
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<Save />}
                onClick={handleSave}
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
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Mensagens Salvas
              </Typography>
              <Divider sx={{ my: 2 }} />

              {messages.length === 0 ? (
                <Paper
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                  }}
                >
                  <MessageIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography color="text.secondary">
                    Nenhuma mensagem criada ainda
                  </Typography>
                </Paper>
              ) : (
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {messages.map((msg, index) => (
                    <React.Fragment key={msg.id}>
                      <ListItem
                        sx={{
                          bgcolor: 'grey.50',
                          borderRadius: 2,
                          mb: 1,
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography fontWeight="medium">{msg.nome}</Typography>
                              <Chip label={msg.tipo_servico} size="small" color="primary" variant="outlined" />
                            </Box>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mt: 1,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {msg.mensagem}
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => handleDelete(msg.id)}
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < messages.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Box>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
