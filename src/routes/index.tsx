import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from '../pages/Home';
import { EventDetails } from '../pages/EventDetails';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detalhes" element={<EventDetails />} />
      </Routes>
    </BrowserRouter>
  );
}