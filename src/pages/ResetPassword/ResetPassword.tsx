import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../resources/api';
import '../Login/login.css';
import { FaLock, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    if (!token) {
      toast.error("Token de redefinição inválido ou ausente.");
      navigate('/login');
    }
  }, [token, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validatePassword = (password: string, passwordConfirmation: string): boolean => {
      const validations = [
        { valid: !password, message: "Por favor, preencha a nova senha." },
        { valid: !passwordConfirmation, message: "Por favor, confirme a nova senha." },
        { valid: password.length < 8, message: "A senha deve ter pelo menos 8 caracteres." },
        { valid: password !== passwordConfirmation, message: "As senhas não coincidem." },
        { valid: !/[A-Z]/.test(password), message: "A senha deve conter pelo menos uma letra maiúscula." },
        { valid: !/[a-z]/.test(password), message: "A senha deve conter pelo menos uma letra minúscula." },
        { valid: !/[0-9]/.test(password), message: "A senha deve conter pelo menos um número." },
        { valid: !/[!@#$%^&*(),.?":{}|<>]/.test(password), message: "A senha deve conter pelo menos um caractere especial." },
      ];

      for (const { valid, message } of validations) {
        if (valid) {
          toast.error(message);
          return false;
        }
      }

      return true;
    };

    if (!validatePassword(password, passwordConfirmation)) return;

    setIsLoading(true);
    try {
      await api.post('/reset-password', {
        token,
        password,
        password_confirmation: passwordConfirmation,
      });

      toast.success("Senha redefinida com sucesso!");
      setTimeout(() => navigate('/login'), 2000);

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Não foi possível redefinir a senha. O token pode ser inválido ou ter expirado.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ backgroundImage: `url(/assets/background.jpg)` }}>
      <div className="login-form">
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'contents' }}>
          <h2>Crie uma Nova Senha</h2>
          <p>Digite e confirme sua nova senha abaixo.</p>
          <div className="input-group">
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                className="login-input"
                placeholder="Nova Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          <div className="input-group">
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type={showPasswordConfirmation ? "text" : "password"}
                className="login-input"
                placeholder="Confirme a Nova Senha"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
              />
              <span className="password-toggle-icon" onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}>
                {showPasswordConfirmation ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? <FaSpinner className="spinner" /> : 'Salvar Nova Senha'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
