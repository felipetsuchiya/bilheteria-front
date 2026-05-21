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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/evento/novo" element={<CreateEvent />} />
        <Route path="/evento/editar/:id" element={<EditEvent />} />
        <Route path="/checkout/:eventoId" element={<Checkout />} />
        <Route path="/minha-conta" element={<MeusIngressos />} />
      </Routes>

      <Footer />

    </BrowserRouter>
  );
}