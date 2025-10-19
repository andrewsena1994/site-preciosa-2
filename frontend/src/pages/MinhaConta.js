import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { Package, User, MessageCircle, ShoppingBag } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MinhaConta = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${API}/orders/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const getStatusColor = (status) => {
    const colors = {
      pendente: 'bg-yellow-100 text-yellow-800',
      confirmado: 'bg-blue-100 text-blue-800',
      enviado: 'bg-purple-100 text-purple-800',
      entregue: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" data-testid="profile-section">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-600 to-pink-400 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" data-testid="user-name">{user.nome}</h1>
              <p className="text-gray-600" data-testid="user-email">{user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">CPF/CNPJ</p>
              <p className="font-semibold" data-testid="user-cpf">{user.cpf_cnpj}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Telefone</p>
              <p className="font-semibold" data-testid="user-phone">{user.telefone}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Tipo de Conta</p>
              <p className="font-semibold capitalize" data-testid="user-type">{user.tipo}</p>
            </div>
          </div>
        </div>

        {/* VIP WhatsApp */}
        <div className="bg-gradient-to-r from-pink-600 to-pink-400 rounded-2xl shadow-lg p-8 mb-8 text-white" data-testid="vip-section">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Grupo VIP WhatsApp</h2>
              <p className="text-white/90">
                Acesse nosso grupo exclusivo para revendedores e receba dicas, ofertas especiais e suporte prioritário!
              </p>
            </div>
            <a
              href="https://wa.me/5511999999999?text=Olá! Gostaria de entrar no grupo VIP de revendedores da Preciosa Modas."
              target="_blank"
              rel="noopener noreferrer"
              data-testid="whatsapp-vip-btn"
            >
              <Button className="bg-white text-pink-600 hover:bg-gray-100 font-semibold px-8 py-6">
                <MessageCircle className="mr-2" />
                Entrar no Grupo VIP
              </Button>
            </a>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-2xl shadow-lg p-8" data-testid="orders-section">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Package className="w-6 h-6 text-pink-600" />
            Meus Pedidos
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="shimmer w-16 h-16 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando pedidos...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12" data-testid="no-orders">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Você ainda não fez nenhum pedido.</p>
              <Button onClick={() => navigate('/produtos')} className="btn-primary" data-testid="shop-now-btn">
                Comece a Comprar
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow" data-testid={`order-${order.id}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Pedido #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`} data-testid={`order-status-${order.id}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    {order.produtos.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.nome} (x{item.quantidade})</span>
                        <span className="font-semibold">R$ {(item.preco_unitario * item.quantidade).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-pink-600" data-testid={`order-total-${order.id}`}>
                      R$ {order.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Pagamento: <span className="font-semibold capitalize">{order.metodo_pagamento}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MinhaConta;
