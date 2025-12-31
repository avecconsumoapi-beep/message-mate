import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { Email, Send } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

const ForgotPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await resetPassword(email);
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 50%, #0284c7 100%)',
          padding: 2,
        }}
      >
        <Card sx={{ maxWidth: 420, width: '100%', borderRadius: 3 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight="bold" color="success.main" gutterBottom>
              Email enviado!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Verifique sua caixa de entrada para redefinir sua senha.
            </Typography>
            <Button
              component={Link}
              to="/"
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #0d9488, #0891b2)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0f766e, #0e7490)',
                },
              }}
            >
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 50%, #0284c7 100%)',
        padding: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 420,
          width: '100%',
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0d9488, #0891b2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Send sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Recuperar Senha
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Digite seu email para receber o link de recuperação
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #0d9488, #0891b2)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0f766e, #0e7490)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Enviar Link'}
            </Button>
          </form>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 3 }}
          >
            Lembrou a senha?{' '}
            <Link to="/" style={{ color: '#0d9488', textDecoration: 'none', fontWeight: 'bold' }}>
              Fazer login
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPassword;
