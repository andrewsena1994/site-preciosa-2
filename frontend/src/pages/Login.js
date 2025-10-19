import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Gem } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, register, user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    cpf_cnpj: '',
    senha: ''
  });

  const [registerData, setRegisterData] = useState({
    nome: '',
    email: '',
    cpf_cnpj: '',
    telefone: '',
    senha: '',
    tipo: 'atacado'
  });

  React.useEffect(() => {
    if (user) {
      navigate('/minha-conta');
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginData.cpf_cnpj, loginData.senha);
      toast.success('Login realizado com sucesso!');
      navigate('/minha-conta');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(registerData);
      toast.success('Cadastro realizado com sucesso!');
      navigate('/minha-conta');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-gray-50 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Gem className="w-12 h-12 text-pink-600 mx-auto mb-4 diamond-sparkle" />
            <h1 className="text-3xl font-bold mb-2">Bem-vinda!</h1>
            <p className="text-gray-600">Acesse sua conta de revendedor</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" data-testid="login-tab">Entrar</TabsTrigger>
              <TabsTrigger value="register" data-testid="register-tab">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4" data-testid="login-form">
                <div>
                  <Label htmlFor="login-cpf">CPF/CNPJ</Label>
                  <Input
                    id="login-cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={loginData.cpf_cnpj}
                    onChange={(e) => setLoginData({ ...loginData, cpf_cnpj: e.target.value })}
                    required
                    data-testid="login-cpf-input"
                  />
                </div>
                <div>
                  <Label htmlFor="login-senha">Senha</Label>
                  <Input
                    id="login-senha"
                    type="password"
                    placeholder="Sua senha"
                    value={loginData.senha}
                    onChange={(e) => setLoginData({ ...loginData, senha: e.target.value })}
                    required
                    data-testid="login-password-input"
                  />
                </div>
                <Button type="submit" className="w-full btn-primary" disabled={loading} data-testid="login-submit-btn">
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4" data-testid="register-form">
                <div>
                  <Label htmlFor="register-nome">Nome Completo</Label>
                  <Input
                    id="register-nome"
                    type="text"
                    placeholder="Seu nome"
                    value={registerData.nome}
                    onChange={(e) => setRegisterData({ ...registerData, nome: e.target.value })}
                    required
                    data-testid="register-name-input"
                  />
                </div>
                <div>
                  <Label htmlFor="register-email">E-mail</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                    data-testid="register-email-input"
                  />
                </div>
                <div>
                  <Label htmlFor="register-cpf">CPF/CNPJ</Label>
                  <Input
                    id="register-cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={registerData.cpf_cnpj}
                    onChange={(e) => setRegisterData({ ...registerData, cpf_cnpj: e.target.value })}
                    required
                    data-testid="register-cpf-input"
                  />
                </div>
                <div>
                  <Label htmlFor="register-telefone">Telefone</Label>
                  <Input
                    id="register-telefone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={registerData.telefone}
                    onChange={(e) => setRegisterData({ ...registerData, telefone: e.target.value })}
                    required
                    data-testid="register-phone-input"
                  />
                </div>
                <div>
                  <Label htmlFor="register-senha">Senha</Label>
                  <Input
                    id="register-senha"
                    type="password"
                    placeholder="Crie uma senha"
                    value={registerData.senha}
                    onChange={(e) => setRegisterData({ ...registerData, senha: e.target.value })}
                    required
                    data-testid="register-password-input"
                  />
                </div>
                <Button type="submit" className="w-full btn-primary" disabled={loading} data-testid="register-submit-btn">
                  {loading ? 'Cadastrando...' : 'Criar Conta'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Login;
