import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Build as BuildIcon,
  Campaign as CampaignIcon,
  Logout,
  Send,
  Menu as MenuIcon,
  ChevronLeft,
  Close,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

const drawerWidthOpen = 240;
const drawerWidthClosed = 64;

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
  onToggle: () => void;
}

const menuItems = [
  { title: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
  { title: 'Mensagens em Massa', path: '/mensagens-massa', icon: CampaignIcon },
];

const AppSidebar = ({ open, onClose, onToggle }: AppSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const drawerContent = (
    <>
      <Toolbar sx={{ justifyContent: open ? 'space-between' : 'center', px: open ? 2 : 1, minHeight: { xs: 56, md: 64 } }}>
        {open && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Send sx={{ fontSize: { xs: 20, md: 24 } }} />
            <Typography variant="h6" noWrap fontWeight="bold" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
              MessageFlow
            </Typography>
          </Box>
        )}
        <IconButton onClick={isMobile ? onClose : onToggle} sx={{ color: 'white' }}>
          {isMobile ? <Close /> : (open ? <ChevronLeft /> : <MenuIcon />)}
        </IconButton>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

      <List sx={{ flex: 1, pt: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ px: 1, mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                  },
                  justifyContent: open ? 'flex-start' : 'center',
                  px: open ? 2 : 1,
                  py: { xs: 1, md: 1.5 },
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: open ? 40 : 'auto' }}>
                  <item.icon sx={{ fontSize: { xs: 20, md: 24 } }} />
                </ListItemIcon>
                {open && (
                  <ListItemText 
                    primary={item.title} 
                    primaryTypographyProps={{ 
                      fontSize: { xs: '0.85rem', md: '0.95rem' } 
                    }} 
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
      
      <Box sx={{ p: { xs: 1.5, md: 2 } }}>
        {open && (
          <Typography 
            variant="body2" 
            sx={{ 
              opacity: 0.8, 
              mb: 1, 
              textAlign: 'center',
              fontSize: { xs: '0.75rem', md: '0.875rem' },
            }} 
            noWrap
          >
            {user?.email}
          </Typography>
        )}
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.15)',
            },
            justifyContent: open ? 'flex-start' : 'center',
            px: open ? 2 : 1,
            py: { xs: 1, md: 1.5 },
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: open ? 40 : 'auto' }}>
            <Logout sx={{ fontSize: { xs: 20, md: 24 } }} />
          </ListItemIcon>
          {open && (
            <ListItemText 
              primary="Sair" 
              primaryTypographyProps={{ 
                fontSize: { xs: '0.85rem', md: '0.95rem' } 
              }} 
            />
          )}
        </ListItemButton>
      </Box>
    </>
  );

  // Mobile: temporary drawer (overlay)
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidthOpen,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #0d9488 0%, #0891b2 100%)',
            color: 'white',
          },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  // Desktop: permanent drawer
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidthOpen : drawerWidthClosed,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidthOpen : drawerWidthClosed,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #0d9488 0%, #0891b2 100%)',
          color: 'white',
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default AppSidebar;