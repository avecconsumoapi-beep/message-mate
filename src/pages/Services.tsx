import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Grid,
  Snackbar,
  Alert,
  Chip,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Message as MessageIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useServices } from '@/hooks/useServices';

const Services = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { services, saveService, deleteService } = useServices();

  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codigo.trim() || !nome.trim()) {
      setSnackbar({ open: true, message: 'Código e nome são obrigatórios', severity: 'error' });
      return;
    }

    saveService(codigo.trim(), nome.trim(), descricao.trim());
    setCodigo('');
    setNome('');
    setDescricao('');
    setSnackbar({ open: true, message: 'Serviço salvo com sucesso!', severity: 'success' });
  };

  const handleDelete = (id: string) => {
    deleteService(id);
    setSnackbar({ open: true, message: 'Serviço excluído!', severity: 'success' });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <BuildIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Gerenciar Serviços
          </Typography>
          <Button
            color="inherit"
            startIcon={<MessageIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            Mensagens
          </Button>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AddIcon color="primary" />
                Novo Serviço
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  label="Código do Serviço"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Ex: 0020"
                  sx={{ mb: 3 }}
                  required
                />
                
                <TextField
                  fullWidth
                  label="Nome do Serviço"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Manutenção Preventiva"
                  sx={{ mb: 3 }}
                  required
                />
                
                <TextField
                  fullWidth
                  label="Descrição"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descrição detalhada do serviço..."
                  multiline
                  rows={3}
                  sx={{ mb: 3 }}
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<AddIcon />}
                  sx={{ py: 1.5 }}
                >
                  Salvar Serviço
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BuildIcon color="primary" />
              Serviços Cadastrados ({services.length})
            </Typography>

            {services.length === 0 ? (
              <Paper elevation={1} sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                <BuildIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography color="text.secondary">
                  Nenhum serviço cadastrado ainda.
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {services.map((service) => (
                  <Card key={service.id} elevation={2}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Chip 
                          label={service.codigo} 
                          color="primary" 
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                        <Typography variant="h6" component="span">
                          {service.nome}
                        </Typography>
                      </Box>
                      {service.descricao && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {service.descricao}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Criado em: {new Date(service.created_at).toLocaleDateString('pt-BR')}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(service.id)}
                      >
                        Excluir
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
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

export default Services;
