import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login/login';
import Home from '../pages/Home/home';
import ForgotPassword from '../pages/RecuperarForm/form';
import ResetPassword from '../pages/ResetPassword/ResetPassword';
import GlobalConfigs from '../pages/GlobalConfigs/GlobalConfigs';
import UserConfig from '../pages/UserConfig/UserConfig';
import EditUser from '../pages/EditUser/EditUser';
import TicketManagement from '../pages/TicketManagement/TicketManagement';
import SelectCategory from '../pages/CreateTicket/SelectCategory';
import SelectService from '../pages/CreateTicket/SelectService';
import TicketForm from '../pages/CreateTicket/TicketForm';
import ViewTicket from '../pages/ViewTicket/ViewTicket';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/inicio" element={<Home />} />
      <Route path="/recuperar-senha" element={<ForgotPassword />} />
      <Route path="/redefinir-senha/:token" element={<ResetPassword />} />
      <Route path="/configuracoes" element={<GlobalConfigs />} />
      <Route path="/gerenciar-usuarios" element={<UserConfig />} />
      <Route path="/editar-usuario/:id" element={<EditUser />} />
      <Route path="/gestao-chamados" element={<TicketManagement />} />
      <Route path="/novo-chamado" element={<SelectCategory />} />
      <Route path="/novo-chamado/:categoryId" element={<SelectService />} />
      <Route path="/novo-chamado/:categoryId/:serviceId" element={<TicketForm />} />
      <Route path="chamado/:id" element={<ViewTicket />} />
      <Route path="*" element={<Login />} />
    </Routes>
  );
};
