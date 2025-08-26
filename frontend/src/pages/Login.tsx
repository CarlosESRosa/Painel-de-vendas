import {
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, demoLogin, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: 'admin@painel.dev',
    password: 'admin123',
    rememberMe: false,
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    }
  };

  const handleDemoLogin = () => {
    demoLogin();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-info-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo e Título */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-glow mb-6">
            <ShoppingCartIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-info-600 bg-clip-text text-transparent">
            Painel de Vendas
          </h2>
          <p className="mt-2 text-secondary-600">Faça login para acessar seu painel</p>
        </div>

        {/* Formulário de Login */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-8">
          {error && (
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 bg-danger-100 rounded-full flex items-center justify-center">
                    <span className="text-danger-600 text-sm">!</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-danger-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-secondary-700 mb-2"
              >
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field pl-10 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Lembrar de mim e Esqueci a senha */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-secondary-700">
                  Lembrar de mim
                </label>
              </div>
              <div className="text-sm">
                <Link
                  to="/esqueci-senha"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>
            </div>

            {/* Botão de Login */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-tech hover:shadow-glow transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LockClosedIcon className="h-5 w-5 text-primary-300 group-hover:text-primary-200 transition-colors" />
                </span>
                {isLoading ? 'Entrando...' : 'Entrar no Sistema'}
              </button>
            </div>

            {/* Divisor */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-secondary-500">ou</span>
              </div>
            </div>

            {/* Botão de Demo */}
            <div>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="group relative w-full flex justify-center py-3 px-4 border border-secondary-300 text-sm font-medium rounded-xl text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 transition-all duration-200 shadow-soft hover:shadow-tech"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <ShoppingCartIcon className="h-5 w-5 text-secondary-400 group-hover:text-secondary-500 transition-colors" />
                </span>
                Acessar Demo
              </button>
            </div>
          </form>
        </div>

        {/* Footer 
                <div className="text-center">
                    <p className="text-sm text-secondary-500">
                        Não tem uma conta?{' '}
                        <Link
                            to="/cadastro"
                            className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                        >
                            Cadastre-se aqui
                        </Link>
                    </p>
                </div>
                */}
        {/* Informações de Segurança 
                <div className="bg-secondary-50 rounded-xl p-4 border border-secondary-200">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <div className="w-6 h-6 bg-info-100 rounded-full flex items-center justify-center">
                                <LockClosedIcon className="w-4 h-4 text-info-600" />
                            </div>
                        </div>
                        <div className="text-sm text-secondary-600">
                            <p className="font-medium text-secondary-700 mb-1">Sistema Seguro</p>
                            <p>Seus dados estão protegidos com criptografia de ponta a ponta e autenticação de dois fatores.</p>
                        </div>
                    </div>
                </div>
                */}
      </div>
    </div>
  );
};

export default Login;
