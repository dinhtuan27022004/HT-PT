import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import Home from './pages/Home';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import BrandManagement from './pages/admin/BrandManagement';
import BannerManagement from './pages/admin/BannerManagement';
import ProtectedRoute from './components/common/ProtectedRoute';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import ProductDetailPage from './pages/ProductDetail';
import CategoryPage from './pages/Category';
import { COLORS } from './theme/colors';
import { CartProvider } from './context/CartContext';
import CartPage from './pages/Cart';
import CheckoutPage from './pages/Checkout';
import SearchPage from './pages/Search';
import ProfilePage from './pages/Profile';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: COLORS.PRIMARY,
          borderRadius: 8,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }
      }}
    >
      <AntApp>
        <style>
          {`
            :root {
              --color-primary: ${COLORS.PRIMARY};
              --primary: ${COLORS.PRIMARY};
              --primary-hover: ${COLORS.PRIMARY_HOVER};
              --color-black: ${COLORS.BLACK};
              --color-white: ${COLORS.WHITE};
            }
          `}
        </style>
        <BrowserRouter>
          <CartProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/category/:id" element={<CategoryPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/search" element={<SearchPage />} />

              <Route path="/profile" element={<ProfilePage />}>
                <Route index element={<ProfilePage.PersonalInfo />} />
                <Route path="orders" element={<ProfilePage.Orders />} />
                <Route path="orders/:id" element={<ProfilePage.OrderDetail />} />
                <Route path="address" element={<ProfilePage.Address />} />
                <Route path="*" element={<ProfilePage.ComingSoon />} />
              </Route>

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="products/new" element={<AddProduct />} />
                <Route path="products/edit/:id" element={<EditProduct />} />
                <Route path="categories" element={<CategoryManagement />} />
                <Route path="brands" element={<BrandManagement />} />
                <Route path="banners" element={<BannerManagement />} />
                {/* Add more admin routes here */}
              </Route>
            </Routes>
          </CartProvider>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
