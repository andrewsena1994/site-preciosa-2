import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard, FileText, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState('pix');
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  React.useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/carrinho');
    }
    if (!user) {
      toast.error('Faça login para continuar');
      navigate('/login');
    }
  }, [cartItems, user, navigate]);

  const handleFinalizarPedido = async () => {
    setLoading(true);
    try {
      const orderData = {
        user_id: user.id,
        user_nome: user.nome,
        produtos: cartItems.map(item => ({
          product_id: item.id,
          nome: item.nome,
          quantidade: item.quantidade,
          preco_unitario: item.tipo === 'atacado' ? item.preco_atacado : item.preco_varejo
        })),
        total: getCartTotal(),
        metodo_pagamento: selectedPayment
      };

      await axios.post(`${API}/orders`, orderData);
      
      // Show mock payment success
      setShowPaymentModal(true);
      
      // Clear cart after 2 seconds and redirect
      setTimeout(() => {
        clearCart();
        toast.success('Pedido realizado com sucesso!');
        navigate('/minha-conta');
      }, 2000);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      toast.error('Erro ao processar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'pix', name: 'PIX', icon: Smartphone, desc: 'Pagamento instantâneo' },
    { id: 'cartao', name: 'Cartão', icon: CreditCard, desc: 'Crédito ou Débito' },
    { id: 'boleto', name: 'Boleto', icon: FileText, desc: 'Vencimento em 3 dias' }
  ];

  if (cartItems.length === 0 || !user) return null;

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8" data-testid="checkout-title">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Method */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Método de Pagamento</h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedPayment === method.id
                          ? 'border-pink-600 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                      data-testid={`payment-${method.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          selectedPayment === method.id ? 'bg-pink-600 text-white' : 'bg-gray-100'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-semibold">{method.name}</p>
                          <p className="text-sm text-gray-600">{method.desc}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* User Info */}
            <div className="bg-white rounded-xl shadow-lg p-6" data-testid="user-info">
              <h2 className="text-xl font-bold mb-4">Dados do Comprador</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Nome:</span> {user.nome}</p>
                <p><span className="font-semibold">E-mail:</span> {user.email}</p>
                <p><span className="font-semibold">CPF/CNPJ:</span> {user.cpf_cnpj}</p>
                <p><span className="font-semibold">Telefone:</span> {user.telefone}</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6" data-testid="order-summary">
              <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cartItems.map((item) => {
                  const preco = item.tipo === 'atacado' ? item.preco_atacado : item.preco_varejo;
                  return (
                    <div key={`${item.id}-${item.tipo}`} className="flex gap-4 pb-4 border-b" data-testid={`summary-item-${item.id}`}>
                      <img src={item.imagens[0]} alt={item.nome} className="w-16 h-16 rounded object-cover" />
                      <div className="flex-grow">
                        <p className="font-semibold text-sm">{item.nome}</p>
                        <p className="text-xs text-gray-600 capitalize">{item.tipo}</p>
                        <p className="text-xs text-gray-600">Qtd: {item.quantidade}</p>
                        <p className="text-pink-600 font-bold">R$ {(preco * item.quantidade).toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">R$ {getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frete:</span>
                  <span className="text-green-600 font-semibold">Grátis</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-3xl font-bold text-pink-600" data-testid="final-total">
                    R$ {getCartTotal().toFixed(2)}
                  </span>
                </div>
              </div>
              <Button
                onClick={handleFinalizarPedido}
                className="w-full btn-primary py-6 text-lg mt-6"
                disabled={loading}
                data-testid="finalize-order-btn"
              >
                {loading ? 'Processando...' : 'Confirmar Pedido'}
              </Button>
            </div>
          </div>
        </div>

        {/* Mock Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="payment-modal">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Pagamento Confirmado!</h2>
              <p className="text-gray-600 mb-4">
                Seu pedido foi processado com sucesso via {selectedPayment.toUpperCase()}.
              </p>
              <p className="text-sm text-gray-500">
                Redirecionando para sua conta...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
