import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login/login';
import Home from '../pages/Home/home';
import ForgotPassword from '../pages/RecuperarForm/form';
import ResetPassword from '../pages/ResetPassword/ResetPassword';
import GlobalConfigs from '../pages/GlobalConfigs/GlobalConfigs';
import UserConfig from '../pages/UserConfig/UserConfig';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/inicio" element={<Home />} />
      <Route path="/recuperar-senha" element={<ForgotPassword />} />
      <Route path="/redefinir-senha/:token" element={<ResetPassword />} />
      <Route path="/configuracoes" element={<GlobalConfigs />} />
      <Route path="/gerenciar-usuarios" element={<UserConfig />} />
      <Route path="*" element={<Login />} />
    </Routes>
  );
};
