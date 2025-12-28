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
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Build as BuildIcon,
  Campaign as CampaignIcon,
  Logout,
  Send,
  Menu as MenuIcon,
  ChevronLeft,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

const drawerWidth = 260;

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
  onToggle: () => void;
}

const menuItems = [
  { title: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
  { title: 'Serviços', path: '/services', icon: BuildIcon },
  { title: 'Mensagens em Massa', path: '/mensagens-massa', icon: CampaignIcon },
];

const AppSidebar = ({ open, onClose, onToggle }: AppSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : 72,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : 72,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #0d9488 0%, #0891b2 100%)',
          color: 'white',
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
        },
      }}
    >
      <Toolbar sx={{ justifyContent: open ? 'space-between' : 'center', px: open ? 2 : 1 }}>
        {open && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Send />
            <Typography variant="h6" noWrap fontWeight="bold">
              MessageFlow
            </Typography>
          </Box>
        )}
        <IconButton onClick={onToggle} sx={{ color: 'white' }}>
          {open ? <ChevronLeft /> : <MenuIcon />}
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
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: open ? 40 : 'auto' }}>
                  <item.icon />
                </ListItemIcon>
                {open && <ListItemText primary={item.title} />}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
      
      <Box sx={{ p: 2 }}>
        {open && (
          <Typography variant="body2" sx={{ opacity: 0.8, mb: 1, textAlign: 'center' }} noWrap>
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
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: open ? 40 : 'auto' }}>
            <Logout />
          </ListItemIcon>
          {open && <ListItemText primary="Sair" />}
        </ListItemButton>
      </Box>
    </Drawer>
  );
};

export default AppSidebar;
