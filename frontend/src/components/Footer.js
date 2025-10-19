import React from 'react';
import { Link } from 'react-router-dom';
import { Gem, Instagram, MessageCircle, MapPin, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Gem className="w-6 h-6 text-pink-400" />
              <span className="text-xl font-bold">Preciosa Modas</span>
            </div>
            <p className="text-gray-400 text-sm">
              Moda feminina acessível e lucrativa para revendedores.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="font-semibold mb-4 text-pink-400">Links Rápidos</h3>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-gray-400 hover:text-pink-400 transition-colors text-sm">
                Início
              </Link>
              <Link to="/produtos" className="text-gray-400 hover:text-pink-400 transition-colors text-sm">
                Produtos
              </Link>
              <Link to="/sobre" className="text-gray-400 hover:text-pink-400 transition-colors text-sm">
                Sobre Nós
              </Link>
              <Link to="/contato" className="text-gray-400 hover:text-pink-400 transition-colors text-sm">
                Contato
              </Link>
            </div>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-semibold mb-4 text-pink-400">Contato</h3>
            <div className="flex flex-col gap-3">
              <a href="tel:+5511999999999" className="flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors text-sm">
                <Phone className="w-4 h-4" />
                (11) 99999-9999
              </a>
              <a href="mailto:contato@preciosamodas.com" className="flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors text-sm">
                <Mail className="w-4 h-4" />
                contato@preciosamodas.com
              </a>
              <div className="flex items-start gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>Rua das Flores, 123<br />São Paulo - SP</span>
              </div>
            </div>
          </div>

          {/* Redes Sociais */}
          <div>
            <h3 className="font-semibold mb-4 text-pink-400">Siga-nos</h3>
            <div className="flex gap-4">
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors"
                data-testid="whatsapp-link"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/preciosamodas"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors"
                data-testid="instagram-link"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2024 Preciosa Modas. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
