// ... existing code ...
import { BrowserRouter as Router, Routes, Route } from '@remix-run/router';
import ClientHome from "@/pages/cliente/ClientHome";
// ... existing code ...

function App() {
  return (
    <Router>
      <Routes>
        {/* Outras rotas */}
        <Route path="/cliente" element={<ClientHome />} />
        {/* Rota de fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
// ... existing code ...