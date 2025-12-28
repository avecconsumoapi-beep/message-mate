import { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { useServices } from '@/hooks/useServices';
import AppLayout from '@/components/AppLayout';

const Services = () => {
  const { services, saveService, deleteService } = useServices();

  const [nome, setNome] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim()) {
      setSnackbar({ open: true, message: 'Nome é obrigatório', severity: 'error' });
      return;
    }

    saveService(nome.trim());
    setNome('');
    setSnackbar({ open: true, message: 'Serviço salvo com sucesso!', severity: 'success' });
  };

  const handleDelete = (id: string) => {
    deleteService(id);
    setSnackbar({ open: true, message: 'Serviço excluído!', severity: 'success' });
  };

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: 'hsl(var(--foreground))', mb: 4 }}>
          Gerenciar Serviços
        </Typography>

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
                  label="Nome do Serviço"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Manutenção Preventiva"
                  sx={{ mb: 3 }}
                  required
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
                      <Typography variant="h6" component="span">
                        {service.nome}
                      </Typography>
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
    </AppLayout>
  );
};

export default Services;
