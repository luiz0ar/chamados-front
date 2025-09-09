import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../resources/api';
import './form.css';
import { FaEnvelope, FaSpinner } from 'react-icons/fa';
import '../Login/login.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isResending && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setIsResending(false);
      setCountdown(60);
    }
    return () => clearTimeout(timer);
  }, [isResending, countdown]);

  const startResendCooldown = () => {
    setIsResending(true);
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();

    if (!email.trim()) {
      toast.error("Por favor, preencha seu email.");
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      toast.error("O e-mail contém caracteres inválidos ou formato incorreto.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/request-password-reset', { email });
      if (!isSubmitted) setIsSubmitted(true);
      startResendCooldown();
      toast.success("Link de recuperação enviado com sucesso!");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Não foi possível processar a solicitação.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = () => {
    if (!isResending) {
      handleSubmit();
    }
  };

  return (
    <div
      className="forgot-password-container"
      style={{ backgroundImage: `url(/assets/background-min.jpg)` }}
    >
      <div className="forgot-password-form">
        {isSubmitted ? (
          <div className="success-message">
            <h2>Verifique seu e-mail</h2>
            <p>
              Se um e-mail correspondente for encontrado, um link para redefinir sua senha foi enviado para <strong>{email}</strong>.
            </p>
            <button
              className="btn-secondary"
              onClick={handleResendEmail}
              disabled={isResending || isLoading}
            >
              {isLoading
                ? <FaSpinner className="spinner" />
                : isResending
                  ? `Reenviar em ${countdown}s`
                  : 'Reenviar e-mail'}
            </button>
            <Link to="/login" className="back-to-login-link">Voltar para o Login</Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ width: '100%', display: 'contents' }}
            noValidate
          >
            <h2>Recuperar Senha</h2>
            <p>Digite seu e-mail abaixo e enviaremos um link para você redefinir sua senha.</p>
            <div className="input-group">
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  className="login-input"
                  placeholder="Seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? <FaSpinner className="spinner" /> : 'ENVIAR LINK DE RECUPERAÇÃO'}
            </button>
            <Link to="/login" className="back-to-login-link">Voltar para o login</Link>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
