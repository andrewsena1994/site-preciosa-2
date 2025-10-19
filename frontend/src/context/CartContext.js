import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantidade = 1, tipo = 'atacado') => {
    const existingItem = cartItems.find(item => item.id === product.id && item.tipo === tipo);
    
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id && item.tipo === tipo
          ? { ...item, quantidade: item.quantidade + quantidade }
          : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantidade, tipo }]);
    }
  };

  const removeFromCart = (productId, tipo) => {
    setCartItems(cartItems.filter(item => !(item.id === productId && item.tipo === tipo)));
  };

  const updateQuantity = (productId, tipo, quantidade) => {
    if (quantidade <= 0) {
      removeFromCart(productId, tipo);
    } else {
      setCartItems(cartItems.map(item =>
        item.id === productId && item.tipo === tipo
          ? { ...item, quantidade }
          : item
      ));
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const preco = item.tipo === 'atacado' ? item.preco_atacado : item.preco_varejo;
      return total + (preco * item.quantidade);
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantidade, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
