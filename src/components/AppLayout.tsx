import { useState, useEffect } from 'react';
import { Box, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import AppSidebar from './AppSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Close sidebar when switching to mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      {/* Mobile header with menu button */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: 56,
            bgcolor: 'hsl(var(--background))',
            borderBottom: '1px solid hsl(var(--border))',
            display: 'flex',
            alignItems: 'center',
            px: 1,
            zIndex: 1100,
          }}
        >
          <IconButton
            onClick={() => setSidebarOpen(true)}
            sx={{ color: 'hsl(var(--foreground))' }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      )}
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'hsl(var(--background))',
          minHeight: '100vh',
          transition: 'margin 0.3s ease',
          pt: isMobile ? '56px' : 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AppLayout;