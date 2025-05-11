// Importaciones necesarias
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import Header from './components/navigation/Header';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminRoute from './components/layout/AdminRoute';
import UsersPage from './pages/admin/UsersPage';
import OrdersAdminPage from './pages/admin/OrdersAdminPage';
import AddProductPage from './pages/admin/AddProductPage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ProductDetailPage from './pages/ProductDetailPage';

// Parte del Material UI para cambiar el tema de l'aplicación
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6d1f20',
      light: '#693b3b',
      dark: '#582326',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#c76060',
    },
    background: {
      default: '#ffffff',
    },
  },
});
// funcion principal de la aplicación
function App() {
  return (
    // añadiendo el tema y el contexto de autenticación
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        {/* Funcion del React-Router */}
        <Router>
          <Header/> {/* Fichero donde se ve el menu superior de la pagina web */}
          <Box component="main" sx={{ p: 3 }}>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<ProductsPage />} />
              <Route path="/products/:productId" element={<ProductDetailPage />} />
              
              {/* Rutas protegidas para cualquier usuario autenticado */}
              <Route element={<ProtectedRoute />}>
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<OrdersPage />} />
              </Route>
              
              {/* Rutas protegidas solo para administradores */}
              <Route element={<AdminRoute />}>
                <Route path="/admin/users" element={<UsersPage />} />
                <Route path="/admin/orders" element={<OrdersAdminPage />} />
                <Route path="/admin/add-product" element={<AddProductPage />} /> {/* Añadir productos */}
              </Route>
              
              {/* Ruta 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

// Funcion para cerrar sesion del usuario el qual tambien elimna las cookies para una mayor seguridad
const logout = () => {
  clearAuthCookies();
  setUser(null);
};