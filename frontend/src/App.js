import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Produtos from './pages/Produtos';
import ProdutoDetalhes from './pages/ProdutoDetalhes';
import Login from './pages/Login';
import MinhaConta from './pages/MinhaConta';
import Carrinho from './pages/Carrinho';
import Checkout from './pages/Checkout';
import Sobre from './pages/Sobre';
import Contato from './pages/Contato';
import AdminPanel from './pages/AdminPanel';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="App">
          <BrowserRouter>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/produtos" element={<Produtos />} />
              <Route path="/produto/:id" element={<ProdutoDetalhes />} />
              <Route path="/login" element={<Login />} />
              <Route path="/minha-conta" element={<MinhaConta />} />
              <Route path="/carrinho" element={<Carrinho />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/sobre" element={<Sobre />} />
              <Route path="/contato" element={<Contato />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
            <Footer />
            <Toaster richColors position="top-right" />
          </BrowserRouter>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
