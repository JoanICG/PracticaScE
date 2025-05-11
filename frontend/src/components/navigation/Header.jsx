import { useState } from 'react';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Avatar,
  Divider,
  Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import AddIcon from '@mui/icons-material/Add';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import InventoryIcon from '@mui/icons-material/Inventory';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
// Esta pagina consiste en el menu de navegacion de arriba
// En este caso hemos intentado usar en el mayo de lo posible iconos de Material UI
const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Estados para controlar los menús desplegables
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  
  // Abrir/cerrar menú de navegación (móvil)
  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  
  // Abrir/cerrar menú de usuario
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  
  // Cerrar menú de navegación
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };
  
  // Cerrar menú de usuario
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  // Navegar a una ruta y cerrar menús
  const handleMenuClick = (route) => {
    navigate(route);
    handleCloseNavMenu();
    handleCloseUserMenu();
  };
  
  // Función para manejar el logout
  const handleLogout = () => {
    logout();
    navigate('/login');
    handleCloseUserMenu();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Logo/Título (visible en todos los tamaños) */}
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            display: { xs: 'none', sm: 'block' },
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/')}
        >
          RC Nomad
        </Typography>
        
        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            size="large"
            aria-label="menú de navegación"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleOpenNavMenu}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorElNav}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            sx={{
              display: { xs: 'block', md: 'none' },
            }}
          >
            <MenuItem onClick={() => handleMenuClick('/')}>
              <Typography textAlign="center">Productos</Typography>
            </MenuItem>
            
            {user && (
              <MenuItem onClick={() => handleMenuClick('/orders')}>
                <Typography textAlign="center">Mis Pedidos</Typography>
              </MenuItem>
            )}
            
            {user && user.role === 'admin' ? [
              <MenuItem key="users" onClick={() => handleMenuClick('/admin/users')}>
                <Typography textAlign="center">Gestionar Usuarios</Typography>
              </MenuItem>,
              <MenuItem key="orders" onClick={() => handleMenuClick('/admin/orders')}>
                <Typography textAlign="center">Gestionar Pedidos</Typography>
              </MenuItem>,
              <MenuItem key="add-product" onClick={() => handleMenuClick('/admin/add-product')}>
                <Typography textAlign="center">Añadir Productos</Typography>
              </MenuItem>
            ] : null}
          </Menu>
        </Box>

        {/* Logo (versión móvil) */}
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            flexGrow: 1,
            display: { xs: 'flex', sm: 'none' },
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/')}
        >
          RC Cars
        </Typography>

        {/* Enlaces de navegación (escritorio) */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 5 }}>
          {/* Botón Productos */}
          <Tooltip title="Productos">
            <IconButton
              onClick={() => handleMenuClick('/')}
              color="inherit"
              size="large"
              sx={{ my: 2 }}
            >
              <InventoryIcon />
            </IconButton>
          </Tooltip>
          
          {user && (
          <Tooltip title="Mis Pedidos">
            <IconButton
              onClick={() => handleMenuClick('/orders')}
              color="inherit"
              size="large"
              sx={{ my: 2 }}
            >
              <BookmarkBorderIcon />
            </IconButton>
          </Tooltip>
            )}
          
          {user && user.role === 'admin' && (
            <>
              <Tooltip title="Gestionar Usuarios">
                <IconButton
                  onClick={() => handleMenuClick('/admin/users')}
                  color="inherit"
                  size="large"
                  sx={{ my: 2 }}
                >
                  <ManageAccountsIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Gestionar Pedidos">
                <IconButton
                  onClick={() => handleMenuClick('/admin/orders')}
                  color="inherit"
                  size="large"
                  sx={{ my: 2 }}
                >
                  <ProductionQuantityLimitsIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Añadir Productos">
                <IconButton
                  onClick={() => handleMenuClick('/admin/add-product')}
                  color="inherit"
                  size="large"
                  sx={{ my: 2 }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>

        {/* Carrito (si el usuario está autenticado) */}
        {user && (
          <Box sx={{ display: 'flex', mr: 2 }}>
            <Tooltip title="Ver carrito">
              <IconButton 
                onClick={() => navigate('/cart')} 
                color="inherit"
                size="large"
              >
                <Badge color="secondary" badgeContent={0}>
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* Menú de usuario */}
        <Box sx={{ flexGrow: 0 }}>
          {user ? (
            // Usuario autenticado
            <>
              <Tooltip title="Abrir menú">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem disabled>
                  <Typography textAlign="center">
                    Hola, {user.name}
                  </Typography>
                </MenuItem>
                <Divider />
                
                <MenuItem onClick={() => handleMenuClick('/orders')}>
                  <ListItemIcon>
                    <ReceiptIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Mis Pedidos</ListItemText>
                </MenuItem>
                
                {user.role === 'admin' ? [
                  <MenuItem key="admin-users" onClick={() => handleMenuClick('/admin/users')}>
                    <ListItemIcon>
                      <PeopleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Gestionar Usuarios</ListItemText>
                  </MenuItem>,
                  <MenuItem key="admin-orders" onClick={() => handleMenuClick('/admin/orders')}>
                    <ListItemIcon>
                      <ShoppingBagIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Gestionar Pedidos</ListItemText>
                  </MenuItem>,
                  <MenuItem key="admin-add-product" onClick={() => handleMenuClick('/admin/add-product')}>
                    <ListItemIcon>
                      <ShoppingBagIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Añadir Productos</ListItemText>
                  </MenuItem>
                ] : null}
                
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Cerrar sesión</ListItemText>
                </MenuItem>
              </Menu>
            </>
          ) : (
            // Usuario no autenticado
            <Button 
              color="inherit"
              startIcon={<AccountCircleIcon />}
              onClick={() => navigate('/login')}
            >
              Iniciar sesión
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;