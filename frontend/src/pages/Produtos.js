import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Produtos = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState('todas');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (category === 'todas') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.categoria === category));
    }
  }, [category, products]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['todas', ...new Set(products.map(p => p.categoria))];

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-center" data-testid="products-title">
            Nosso Catálogo
          </h1>
          <p className="text-gray-600 text-center text-base mb-6">
            Encontre as melhores peças para revender com lucro
          </p>

          {/* Filter */}
          <div className="flex justify-center">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-64" data-testid="category-filter">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="shimmer w-16 h-16 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando produtos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20" data-testid="no-products">
            <p className="text-gray-600 text-lg">Nenhum produto encontrado nesta categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="products-grid">
            {filteredProducts.map((product) => (
              <Link to={`/produto/${product.id}`} key={product.id} className="product-card" data-testid={`product-${product.id}`}>
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.imagens[0]}
                    alt={product.nome}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="mb-2">
                    <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full">
                      {product.categoria}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.nome}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.descricao}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500">Atacado</p>
                      <p className="text-pink-600 font-bold text-xl">
                        R$ {product.preco_atacado.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Varejo</p>
                      <p className="text-gray-700 font-semibold">
                        R$ {product.preco_varejo.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">
                      Estoque: <span className="font-semibold">{product.estoque} unidades</span>
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Produtos;
