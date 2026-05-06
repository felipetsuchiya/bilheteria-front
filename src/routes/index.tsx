import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from '../pages/Home';
import { EventDetails } from '../pages/EventDetails';
import { Login } from '../pages/Login';
import { RegisterClient } from '../pages/Register/RegisterClient';
import { RegisterOrganization } from '../pages/Register/RegisterOrganization';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detalhes" element={<EventDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro/cliente" element={<RegisterClient />} />
        <Route path="/cadastro/organizacao" element={<RegisterOrganization />} />
      </Routes>
    </BrowserRouter>
  );
}