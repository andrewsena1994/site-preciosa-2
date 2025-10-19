import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gem, ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" data-testid="logo-link">
            <Gem className="w-8 h-8 text-pink-600 diamond-sparkle" />
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent">
              Preciosa Modas
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-700 hover:text-pink-600 font-medium transition-colors" data-testid="nav-home">
              Início
            </Link>
            <Link to="/produtos" className="text-gray-700 hover:text-pink-600 font-medium transition-colors" data-testid="nav-products">
              Produtos
            </Link>
            <Link to="/sobre" className="text-gray-700 hover:text-pink-600 font-medium transition-colors" data-testid="nav-about">
              Sobre Nós
            </Link>
            <Link to="/contato" className="text-gray-700 hover:text-pink-600 font-medium transition-colors" data-testid="nav-contact">
              Contato
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="hidden md:flex items-center gap-4">
                <Link to="/minha-conta" data-testid="user-account-link">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{user.nome.split(' ')[0]}</span>
                  </Button>
                </Link>
                <Button variant="ghost" onClick={handleLogout} data-testid="logout-btn">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:block" data-testid="login-link">
                <Button variant="outline" className="border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white">
                  Entrar
                </Button>
              </Link>
            )}

            <Link to="/carrinho" className="relative" data-testid="cart-link">
              <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-pink-600 transition-colors cursor-pointer" />
              {getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold" data-testid="cart-count">
                  {getCartCount()}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-4 border-t pt-4" data-testid="mobile-menu">
            <Link to="/" className="text-gray-700 hover:text-pink-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Início
            </Link>
            <Link to="/produtos" className="text-gray-700 hover:text-pink-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Produtos
            </Link>
            <Link to="/sobre" className="text-gray-700 hover:text-pink-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Sobre Nós
            </Link>
            <Link to="/contato" className="text-gray-700 hover:text-pink-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Contato
            </Link>
            {user ? (
              <>
                <Link to="/minha-conta" className="text-gray-700 hover:text-pink-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Minha Conta
                </Link>
                <button onClick={handleLogout} className="text-left text-gray-700 hover:text-pink-600 font-medium">
                  Sair
                </button>
              </>
            ) : (
              <Link to="/login" className="text-pink-600 font-semibold" onClick={() => setMobileMenuOpen(false)}>
                Entrar / Cadastrar
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
