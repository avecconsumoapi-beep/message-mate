import { useState } from 'react';
import { Box } from '@mui/material';
import AppSidebar from './AppSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'hsl(var(--background))',
          minHeight: '100vh',
          transition: 'margin 0.3s ease',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AppLayout;
