import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { MapPin, Phone, Mail, MessageCircle, Instagram } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Contato = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/contact`, formData);
      toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      setFormData({ nome: '', email: '', telefone: '', mensagem: '' });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="contact-title">Entre em Contato</h1>
          <p className="text-gray-600 text-base">Estamos aqui para ajudar você!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Envie sua Mensagem</h2>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="contact-form">
              <div>
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  data-testid="contact-name-input"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  data-testid="contact-email-input"
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  required
                  data-testid="contact-phone-input"
                />
              </div>
              <div>
                <Label htmlFor="mensagem">Mensagem</Label>
                <Textarea
                  id="mensagem"
                  placeholder="Escreva sua mensagem aqui..."
                  value={formData.mensagem}
                  onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                  rows={5}
                  required
                  data-testid="contact-message-input"
                />
              </div>
              <Button type="submit" className="w-full btn-primary" disabled={loading} data-testid="contact-submit-btn">
                {loading ? 'Enviando...' : 'Enviar Mensagem'}
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {/* Info Cards */}
            <div className="bg-white rounded-2xl shadow-lg p-6" data-testid="contact-info-phone">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Telefone</h3>
                  <a href="tel:+5511999999999" className="text-gray-600 hover:text-pink-600">
                    (11) 99999-9999
                  </a>
                  <p className="text-sm text-gray-500 mt-1">Seg - Sex: 9h às 18h</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6" data-testid="contact-info-email">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">E-mail</h3>
                  <a href="mailto:contato@preciosamodas.com" className="text-gray-600 hover:text-pink-600">
                    contato@preciosamodas.com
                  </a>
                  <p className="text-sm text-gray-500 mt-1">Respondemos em até 24h</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6" data-testid="contact-info-address">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Endereço</h3>
                  <p className="text-gray-600">Rua das Flores, 123</p>
                  <p className="text-gray-600">São Paulo - SP</p>
                  <p className="text-gray-600">CEP: 01234-567</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-gradient-to-r from-pink-600 to-pink-400 rounded-2xl shadow-lg p-6 text-white" data-testid="contact-social">
              <h3 className="font-bold mb-4 text-lg">Redes Sociais</h3>
              <div className="space-y-3">
                <a
                  href="https://wa.me/5511999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  data-testid="contact-whatsapp-link"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span>WhatsApp: (11) 99999-9999</span>
                </a>
                <a
                  href="https://instagram.com/preciosamodas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  data-testid="contact-instagram-link"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <span>@preciosamodas</span>
                </a>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden" data-testid="contact-map">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1976!2d-46.6563!3d-23.5613!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMzJzQwLjciUyA0NsKwMzknMjIuNyJX!5e0!3m2!1spt-BR!2sbr!4v1234567890"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Localização Preciosa Modas"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contato;
