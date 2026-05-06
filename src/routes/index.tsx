import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from '../pages/Home';
import { EventDetails } from '../pages/EventDetails';
import { Login } from '../pages/Login';
import { RegisterClient } from '../pages/Register/RegisterClient';
import { RegisterOrganization } from '../pages/Register/RegisterOrganization';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Dashboard } from '../pages/Dashboard';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detalhes" element={<EventDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro/cliente" element={<RegisterClient />} />
        <Route path="/cadastro/organizacao" element={<RegisterOrganization />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>

      <Footer />

    </BrowserRouter>
  );
}