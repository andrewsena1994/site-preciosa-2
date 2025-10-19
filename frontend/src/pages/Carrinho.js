import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

const Carrinho = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Seu carrinho está vazio');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8" data-testid="cart-title">Meu Carrinho</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center" data-testid="empty-cart">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h2>
            <p className="text-gray-600 mb-8">Adicione produtos para começar a comprar!</p>
            <Link to="/produtos" data-testid="continue-shopping-btn">
              <Button className="btn-primary">Continuar Comprando</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const preco = item.tipo === 'atacado' ? item.preco_atacado : item.preco_varejo;
                return (
                  <div
                    key={`${item.id}-${item.tipo}`}
                    className="bg-white rounded-xl shadow-md p-6 flex gap-6"
                    data-testid={`cart-item-${item.id}`}
                  >
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.imagens[0]} alt={item.nome} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg" data-testid={`item-name-${item.id}`}>{item.nome}</h3>
                          <p className="text-sm text-gray-600 capitalize" data-testid={`item-type-${item.id}`}>
                            Preço: {item.tipo}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id, item.tipo)}
                          className="text-red-500 hover:text-red-700"
                          data-testid={`remove-item-${item.id}`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.tipo, item.quantidade - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            data-testid={`decrease-qty-${item.id}`}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-semibold w-12 text-center" data-testid={`item-qty-${item.id}`}>
                            {item.quantidade}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.tipo, item.quantidade + 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            data-testid={`increase-qty-${item.id}`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">R$ {preco.toFixed(2)} cada</p>
                          <p className="text-xl font-bold text-pink-600" data-testid={`item-total-${item.id}`}>
                            R$ {(preco * item.quantidade).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24" data-testid="cart-summary">
                <h2 className="text-2xl font-bold mb-6">Resumo do Pedido</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">R$ {getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Itens:</span>
                    <span className="font-semibold">{cartItems.reduce((sum, item) => sum + item.quantidade, 0)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-3xl font-bold text-pink-600" data-testid="cart-total">
                        R$ {getCartTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleCheckout}
                  className="w-full btn-primary py-6 text-lg"
                  data-testid="proceed-checkout-btn"
                >
                  Finalizar Compra
                </Button>
                <Link to="/produtos" className="block text-center mt-4 text-pink-600 hover:underline" data-testid="continue-shopping-link">
                  Continuar Comprando
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Carrinho;
