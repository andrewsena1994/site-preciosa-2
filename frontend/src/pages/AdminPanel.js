import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Package, ShoppingBag } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [loginData, setLoginData] = useState({ username: '', senha: '' });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    nome: '',
    descricao: '',
    preco_atacado: '',
    preco_varejo: '',
    categoria: '',
    imagens: '',
    estoque: '',
    disponivel: true,
    destaque: false
  });

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
      fetchProducts();
      fetchOrders();
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/admin/login`, loginData);
      setToken(response.data.token);
      localStorage.setItem('admin_token', response.data.token);
      setIsLoggedIn(true);
      toast.success('Login admin realizado com sucesso!');
    } catch (error) {
      toast.error('Credenciais inválidas');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...productForm,
        preco_atacado: parseFloat(productForm.preco_atacado),
        preco_varejo: parseFloat(productForm.preco_varejo),
        estoque: parseInt(productForm.estoque),
        imagens: productForm.imagens.split(',').map(url => url.trim())
      };

      if (editingProduct) {
        await axios.put(`${API}/admin/products/${editingProduct.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Produto atualizado!');
      } else {
        await axios.post(`${API}/admin/products`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Produto criado!');
      }
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error('Erro ao salvar produto');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este produto?')) return;
    try {
      await axios.delete(`${API}/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Produto deletado!');
      fetchProducts();
    } catch (error) {
      toast.error('Erro ao deletar produto');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      nome: product.nome,
      descricao: product.descricao,
      preco_atacado: product.preco_atacado.toString(),
      preco_varejo: product.preco_varejo.toString(),
      categoria: product.categoria,
      imagens: product.imagens.join(', '),
      estoque: product.estoque.toString(),
      disponivel: product.disponivel,
      destaque: product.destaque
    });
  };

  const resetForm = () => {
    setEditingProduct(null);
    setProductForm({
      nome: '',
      descricao: '',
      preco_atacado: '',
      preco_varejo: '',
      categoria: '',
      imagens: '',
      estoque: '',
      disponivel: true,
      destaque: false
    });
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`${API}/admin/orders/${orderId}/status?status=${status}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Status atualizado!');
      fetchOrders();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen py-12 bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <h1 className="text-3xl font-bold mb-6 text-center" data-testid="admin-login-title">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4" data-testid="admin-login-form">
            <div>
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                required
                data-testid="admin-username-input"
              />
            </div>
            <div>
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={loginData.senha}
                onChange={(e) => setLoginData({ ...loginData, senha: e.target.value })}
                required
                data-testid="admin-password-input"
              />
            </div>
            <Button type="submit" className="w-full btn-primary" data-testid="admin-login-btn">
              Entrar
            </Button>
            <p className="text-xs text-gray-500 text-center mt-4">
              Usuário: admin | Senha: admin123
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold" data-testid="admin-panel-title">Painel Administrativo</h1>
          <Button onClick={() => {
            localStorage.removeItem('admin_token');
            setIsLoggedIn(false);
            setToken(null);
          }} variant="outline" data-testid="admin-logout-btn">
            Sair
          </Button>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="products" data-testid="tab-products">Produtos</TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">Pedidos</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Product Form */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                  </h2>
                  <form onSubmit={handleSaveProduct} className="space-y-4" data-testid="product-form">
                    <div>
                      <Label htmlFor="nome">Nome</Label>
                      <Input
                        id="nome"
                        value={productForm.nome}
                        onChange={(e) => setProductForm({ ...productForm, nome: e.target.value })}
                        required
                        data-testid="product-name-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        value={productForm.descricao}
                        onChange={(e) => setProductForm({ ...productForm, descricao: e.target.value })}
                        rows={3}
                        required
                        data-testid="product-desc-input"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="preco_atacado">Preço Atacado</Label>
                        <Input
                          id="preco_atacado"
                          type="number"
                          step="0.01"
                          value={productForm.preco_atacado}
                          onChange={(e) => setProductForm({ ...productForm, preco_atacado: e.target.value })}
                          required
                          data-testid="product-wholesale-price-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="preco_varejo">Preço Varejo</Label>
                        <Input
                          id="preco_varejo"
                          type="number"
                          step="0.01"
                          value={productForm.preco_varejo}
                          onChange={(e) => setProductForm({ ...productForm, preco_varejo: e.target.value })}
                          required
                          data-testid="product-retail-price-input"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="categoria">Categoria</Label>
                      <Input
                        id="categoria"
                        value={productForm.categoria}
                        onChange={(e) => setProductForm({ ...productForm, categoria: e.target.value })}
                        required
                        data-testid="product-category-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="imagens">URLs das Imagens (separadas por vírgula)</Label>
                      <Textarea
                        id="imagens"
                        value={productForm.imagens}
                        onChange={(e) => setProductForm({ ...productForm, imagens: e.target.value })}
                        rows={3}
                        required
                        data-testid="product-images-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="estoque">Estoque</Label>
                      <Input
                        id="estoque"
                        type="number"
                        value={productForm.estoque}
                        onChange={(e) => setProductForm({ ...productForm, estoque: e.target.value })}
                        required
                        data-testid="product-stock-input"
                      />
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={productForm.disponivel}
                          onChange={(e) => setProductForm({ ...productForm, disponivel: e.target.checked })}
                          data-testid="product-available-checkbox"
                        />
                        Disponível
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={productForm.destaque}
                          onChange={(e) => setProductForm({ ...productForm, destaque: e.target.checked })}
                          data-testid="product-featured-checkbox"
                        />
                        Destaque
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1 btn-primary" data-testid="product-save-btn">
                        {editingProduct ? 'Atualizar' : 'Criar'}
                      </Button>
                      {editingProduct && (
                        <Button type="button" onClick={resetForm} variant="outline" data-testid="product-cancel-btn">
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Products List */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Produtos ({products.length})
                  </h2>
                  <div className="space-y-4" data-testid="products-list">
                    {products.map((product) => (
                      <div key={product.id} className="border rounded-lg p-4 flex gap-4" data-testid={`product-item-${product.id}`}>
                        <img src={product.imagens[0]} alt={product.nome} className="w-20 h-20 rounded object-cover" />
                        <div className="flex-grow">
                          <h3 className="font-semibold">{product.nome}</h3>
                          <p className="text-sm text-gray-600 mb-2">{product.categoria}</p>
                          <div className="flex gap-4 text-sm">
                            <span>Atacado: R$ {product.preco_atacado.toFixed(2)}</span>
                            <span>Varejo: R$ {product.preco_varejo.toFixed(2)}</span>
                            <span>Estoque: {product.estoque}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)} data-testid={`edit-product-${product.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(product.id)} data-testid={`delete-product-${product.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Pedidos ({orders.length})
              </h2>
              <div className="space-y-4" data-testid="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4" data-testid={`order-item-${order.id}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-semibold">{order.user_nome}</p>
                        <p className="text-sm text-gray-600">#{order.id.slice(0, 8)} - {new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                          data-testid={`order-status-select-${order.id}`}
                        >
                          <option value="pendente">Pendente</option>
                          <option value="confirmado">Confirmado</option>
                          <option value="enviado">Enviado</option>
                          <option value="entregue">Entregue</option>
                        </select>
                      </div>
                    </div>
                    <div className="text-sm space-y-1 mb-2">
                      {order.produtos.map((item, idx) => (
                        <p key={idx} className="text-gray-600">
                          {item.nome} (x{item.quantidade}) - R$ {(item.preco_unitario * item.quantidade).toFixed(2)}
                        </p>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-gray-600 capitalize">Pagamento: {order.metodo_pagamento}</span>
                      <span className="font-bold text-lg text-pink-600">R$ {order.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
