import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./login.css";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { VscAzure } from "react-icons/vsc";
import api from "../../resources/api";
import logoMinasul from "/assets/horizontal-borda.png";
import backgroundCafe from "/assets/background-min.jpg";

type InputFieldProps = {
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  error?: string;
  rightIcon?: React.ReactNode;
};

const InputField: React.FC<InputFieldProps> = ({
  type,
  placeholder,
  value,
  onChange,
  icon,
  error,
  rightIcon,
}) => (
  <div className="input-group">
    <div className="input-wrapper">
      {icon}
      <input
        type={type}
        className={`login-input ${error ? "input-error-border" : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {rightIcon}
    </div>
    {error && <span className="error-message">{error}</span>}
  </div>
);

const Login: React.FC = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setForm((prev) => ({ ...prev, email: rememberedEmail, rememberMe: true }));
    }
  }, []);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!form.email.trim()) newErrors.email = "Por favor, preencha seu email.";
    if (!form.password.trim())
      newErrors.password = "Por favor, preencha sua senha.";
    return newErrors;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.post("/login", {
        email: form.email,
        password: form.password,
        remember: form.rememberMe,
      });

      localStorage.setItem("authToken", data.token);
      form.rememberMe
        ? localStorage.setItem("rememberedEmail", form.email)
        : localStorage.removeItem("rememberedEmail");

      toast.success("Login realizado com sucesso!");
      setTimeout(() => navigate("/inicio"), 1500);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Falha no login. Verifique suas credenciais.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="login-container"
      style={{ backgroundImage: `url(${backgroundCafe})` }}
    >
      <form className="login-form" onSubmit={handleLogin}>
        <img src={logoMinasul} alt="Minasul Logo" className="login-logo" />
        <h2>Bem-vindo!</h2>
        <p>
          Digite seus dados para acessar os <strong>chamados</strong>.
        </p>

        <InputField
          type="text"
          placeholder="Email"
          value={form.email}
          onChange={(val) => handleChange("email", val)}
          icon={<FaUser className="input-icon" />}
          error={errors.email}
        />

        <InputField
          type={showPassword ? "text" : "password"}
          placeholder="Senha"
          value={form.password}
          onChange={(val) => handleChange("password", val)}
          icon={<FaLock className="input-icon" />}
          error={errors.password}
          rightIcon={
            <span
              className="password-toggle-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          }
        />

        <div className="options-group">
          <label className="remember-me">
            <input
              type="checkbox"
              checked={form.rememberMe}
              onChange={(e) => handleChange("rememberMe", e.target.checked)}
            />
            Lembrar login
          </label>
          <a href="/recuperar-senha" className="recover-password">
            Recuperar senha
          </a>
        </div>

        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? <FaSpinner className="spinner" /> : "ENTRAR"}
        </button>

        <div className="divider">
          <span>ou</span>
        </div>

        <button type="button" className="btn-secondary">
          <VscAzure size={18} />
          <strong>ENTRAR COM AZURE AD</strong>
        </button>
      </form>

      <span className="footer-text">
        Chamados © {new Date().getFullYear()} - Versão 01
      </span>
    </div>
  );
};

export default Login;
