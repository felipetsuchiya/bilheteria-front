import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from '../pages/Home';
import { EventDetails } from '../pages/EventDetails';
import { Login } from '../pages/Login';
import { RegisterClient } from '../pages/Register/RegisterClient';
import { RegisterOrganization } from '../pages/Register/RegisterOrganization';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Dashboard } from '../pages/DashboardOrg';
import { CreateEvent } from '../pages/ManageEvents/CreateEvent';
import { EditEvent } from '../pages/ManageEvents/EditEvent';
import { Checkout } from '../pages/Checkout';
import { MeusIngressos } from '../pages/MeusIngressos';
import { NotFound } from '../pages/NotFound';
import { PrivateRoute } from '../components/PrivateRoute';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detalhes/:id" element={<EventDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro/cliente" element={<RegisterClient />} />
        <Route path="/cadastro/organizacao" element={<RegisterOrganization />} />
        <Route path="/dashboard" element={
          <PrivateRoute tipoPermitido="organizacao"><Dashboard /></PrivateRoute>
        } />
        <Route path="/evento/novo" element={
          <PrivateRoute tipoPermitido="organizacao"><CreateEvent /></PrivateRoute>
        } />
        <Route path="/evento/editar/:id" element={
          <PrivateRoute tipoPermitido="organizacao"><EditEvent /></PrivateRoute>
        } />
        <Route path="/checkout/:eventoId" element={
          <PrivateRoute tipoPermitido="cliente"><Checkout /></PrivateRoute>
        } />
        <Route path="/minha-conta" element={
          <PrivateRoute tipoPermitido="cliente"><MeusIngressos /></PrivateRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />

    </BrowserRouter>
  );
}