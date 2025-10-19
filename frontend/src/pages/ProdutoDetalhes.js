import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProdutoDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [tipo, setTipo] = useState('atacado');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      toast.error('Produto não encontrado');
      navigate('/produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantidade, tipo);
    toast.success(`${product.nome} adicionado ao carrinho!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="shimmer w-16 h-16 rounded-full"></div>
      </div>
    );
  }

  if (!product) return null;

  const preco = tipo === 'atacado' ? product.preco_atacado : product.preco_varejo;

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Images */}
            <div>
              <div className="aspect-square mb-4 rounded-xl overflow-hidden">
                <img
                  src={product.imagens[selectedImage]}
                  alt={product.nome}
                  className="w-full h-full object-cover"
                  data-testid="product-main-image"
                />
              </div>
              {product.imagens.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.imagens.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 ${
                        selectedImage === idx ? 'border-pink-600' : 'border-gray-200'
                      }`}
                      data-testid={`thumbnail-${idx}`}
                    >
                      <img src={img} alt={`${product.nome} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <div className="mb-2">
                <span className="text-sm bg-pink-100 text-pink-600 px-3 py-1 rounded-full" data-testid="product-category">
                  {product.categoria}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-4" data-testid="product-name">{product.nome}</h1>
              <p className="text-gray-600 mb-6" data-testid="product-description">{product.descricao}</p>

              {/* Price Type Toggle */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Tipo de Preço</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setTipo('atacado')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 font-semibold transition-all ${
                      tipo === 'atacado'
                        ? 'border-pink-600 bg-pink-50 text-pink-600'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                    data-testid="price-type-atacado"
                  >
                    Atacado
                    <div className="text-2xl font-bold mt-1">R$ {product.preco_atacado.toFixed(2)}</div>
                  </button>
                  <button
                    onClick={() => setTipo('varejo')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 font-semibold transition-all ${
                      tipo === 'varejo'
                        ? 'border-pink-600 bg-pink-50 text-pink-600'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                    data-testid="price-type-varejo"
                  >
                    Varejo
                    <div className="text-2xl font-bold mt-1">R$ {product.preco_varejo.toFixed(2)}</div>
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Quantidade</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    data-testid="decrease-quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-2xl font-bold w-16 text-center" data-testid="quantity-display">{quantidade}</span>
                  <button
                    onClick={() => setQuantidade(Math.min(product.estoque, quantidade + 1))}
                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    data-testid="increase-quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-gray-600 text-sm">
                    ({product.estoque} disponíveis)
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-3xl font-bold text-pink-600" data-testid="total-price">
                    R$ {(preco * quantidade).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Add to Cart */}
              <Button
                onClick={handleAddToCart}
                className="w-full btn-primary py-6 text-lg"
                disabled={!product.disponivel || product.estoque === 0}
                data-testid="add-to-cart-btn"
              >
                <ShoppingCart className="mr-2" />
                {product.disponivel && product.estoque > 0 ? 'Adicionar ao Carrinho' : 'Indisponível'}
              </Button>

              {/* Stock Warning */}
              {product.estoque < 10 && product.estoque > 0 && (
                <p className="text-orange-600 text-sm mt-4 text-center" data-testid="stock-warning">
                  Apenas {product.estoque} unidades em estoque!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProdutoDetalhes;
