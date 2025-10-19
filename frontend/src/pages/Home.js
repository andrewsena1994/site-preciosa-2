import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gem, ShoppingBag, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get(`${API}/products?destaque=true`);
      setFeaturedProducts(response.data.slice(0, 4));
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-[600px] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1678637803384-947954f11c10?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHwyfHxlbGVnYW50JTIwd29tYW4lMjBmYXNoaW9ufGVufDB8fHx8MTc2MDg2MTQ0MHww&ixlib=rb-4.1.0&q=85')`,
        }}
        data-testid="hero-section"
      >
        <div className="container mx-auto px-4 text-center text-white">
          <div className="fade-in-up">
            <Gem className="w-16 h-16 mx-auto mb-6 diamond-sparkle" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Bem-vinda à Preciosa Modas
            </h1>
            <p className="text-base sm:text-lg max-w-2xl mx-auto mb-8 text-gray-200">
              Moda feminina de qualidade com preços especiais para revendedores.
              Lucre com estilo e sofisticação.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/produtos" data-testid="hero-shop-btn">
                <Button className="btn-primary px-8 py-6 text-lg">
                  Ver Catálogo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login" data-testid="hero-register-btn">
                <Button className="btn-secondary px-8 py-6 text-lg">
                  Seja Revendedor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Black Friday Banner */}
      <section className="bg-gradient-to-r from-yellow-400 to-orange-500 py-8" data-testid="black-friday-banner">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-black mb-2">
                BLACK FRIDAY PRECIOSA! 🔥
              </h2>
              <p className="text-black text-lg">
                Até 70% OFF em peças selecionadas. Aproveite!
              </p>
            </div>
            <Link to="/produtos" data-testid="black-friday-btn">
              <Button className="bg-black text-white hover:bg-gray-800 px-8 py-6 text-lg">
                Ver Ofertas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow" data-testid="feature-wholesale">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Preços de Atacado</h3>
              <p className="text-gray-600 text-sm">
                Compre em quantidade e tenha as melhores margens de lucro do mercado.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow" data-testid="feature-quality">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gem className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Qualidade Garantida</h3>
              <p className="text-gray-600 text-sm">
                Peças selecionadas com tecidos premium e acabamento impecável.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow" data-testid="feature-support">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Suporte VIP</h3>
              <p className="text-gray-600 text-sm">
                Grupo exclusivo no WhatsApp com dicas e suporte personalizado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20" data-testid="featured-products">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Produtos em Destaque</h2>
              <p className="text-gray-600 text-base">Confira nossas peças mais vendidas</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link to={`/produto/${product.id}`} key={product.id} className="product-card" data-testid={`product-card-${product.id}`}>
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.imagens[0]}
                      alt={product.nome}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.nome}</h3>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Atacado</p>
                        <p className="text-pink-600 font-bold text-xl">
                          R$ {product.preco_atacado.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Varejo</p>
                        <p className="text-gray-700 font-semibold">
                          R$ {product.preco_varejo.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/produtos" data-testid="view-all-products-btn">
                <Button className="btn-primary px-8 py-4">
                  Ver Todos os Produtos
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-600 to-pink-400" data-testid="cta-section">
        <div className="container mx-auto px-4 text-center text-white">
          <TrendingUp className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Comece a Lucrar Hoje!
          </h2>
          <p className="text-base sm:text-lg max-w-2xl mx-auto mb-8">
            Cadastre-se agora e tenha acesso a preços exclusivos, descontos especiais
            e suporte personalizado para alavancar suas vendas.
          </p>
          <Link to="/login" data-testid="cta-register-btn">
            <Button className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
              Criar Conta de Revendedor
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
