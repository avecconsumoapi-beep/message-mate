import React, { useState } from 'react';
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
  Divider,
  Typography,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Stack,
} from '@mui/material';
import {
  Add,
  Build as BuildIcon,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useServicos } from '@/hooks/useServicos';
import AppLayout from '@/components/AppLayout';

const Servicos: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const { servicos, loading, createServico, deleteServico } = useServicos();

  const [novoServico, setNovoServico] = useState('');
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleAddServico = async () => {
    if (!novoServico.trim()) {
      setSnackbar({ open: true, message: 'Digite o nome do serviço', severity: 'error' });
      return;
    }

    setSaving(true);
    const { error } = await createServico(novoServico.trim());
    setSaving(false);

    if (error) {
      setSnackbar({ open: true, message: error, severity: 'error' });
    } else {
      setSnackbar({ open: true, message: 'Serviço criado com sucesso!', severity: 'success' });
      setNovoServico('');
    }
  };

  const handleDeleteServico = async (id: string) => {
    const { error } = await deleteServico(id);
    if (error) {
      setSnackbar({ open: true, message: error, severity: 'error' });
    } else {
      setSnackbar({ open: true, message: 'Serviço excluído', severity: 'success' });
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: { xs: 2, md: 4 } }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            size={isMobile ? 'small' : 'medium'}
          >
            Voltar
          </Button>
          <Typography 
            variant={isMobile ? 'h5' : 'h4'} 
            fontWeight="bold" 
            sx={{ color: 'hsl(var(--foreground))' }}
          >
            Gerenciar Serviços
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Typography 
              variant={isMobile ? 'h6' : 'h5'} 
              fontWeight="bold" 
              gutterBottom 
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <BuildIcon color="primary" />
              Serviços Cadastrados
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              sx={{ mb: 3 }}
            >
              <TextField
                fullWidth
                label="Nome do Serviço"
                value={novoServico}
                onChange={(e) => setNovoServico(e.target.value)}
                placeholder="Ex: Corte de Cabelo"
                size={isMobile ? 'small' : 'medium'}
                onKeyPress={(e) => e.key === 'Enter' && handleAddServico()}
              />
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Add />}
                onClick={handleAddServico}
                disabled={saving}
                sx={{
                  minWidth: { xs: '100%', sm: 'auto' },
                  whiteSpace: 'nowrap',
                  background: 'linear-gradient(135deg, #0d9488, #0891b2)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0f766e, #0e7490)',
                  },
                }}
              >
                Adicionar
              </Button>
            </Stack>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : servicos.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2 }}>
                <BuildIcon sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
                <Typography color="text.secondary">Nenhum serviço cadastrado</Typography>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {servicos.map((servico) => (
                  <Chip
                    key={servico.id}
                    label={servico.nome}
                    onDelete={() => handleDeleteServico(servico.id)}
                    color={servico.ativo ? 'primary' : 'default'}
                    variant={servico.ativo ? 'filled' : 'outlined'}
                    sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                  />
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

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

export default Servicos;
