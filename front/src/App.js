import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Pagina_inicio } from './pages/Pagina_inicio/index';
import { Login } from './pages/Login/index';
import { NOT_FOUND } from './pages/NOT_FOUND/index';
import { DashboardAdmin } from './pages/admin/DashboardAdmin';
import { DashboardAgente } from './pages/agente/DashboardAgente';
import { PClientes } from './pages/Cliente/PClientes';
import { UserProvider } from './context/UserContext';
import AuthGuard from './components/guards/AuthGuard';

function App() {
  return (
    <div className="App">
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Pagina_inicio />} />
            <Route path='/login' element={<Login />} />

            {/* Rutas protegidas */}
            <Route element={<AuthGuard allowedTypes={[0]} />}>
              <Route path="/admin/*" element={<DashboardAdmin />} />
            </Route>

            <Route element={<AuthGuard allowedTypes={[1]} />}>
              <Route path="/agente/*" element={<DashboardAgente />} />
            </Route>

            <Route element={<AuthGuard allowedTypes={[2]} />}>
              <Route path="/cliente/*" element={<PClientes />} />
            </Route>

            <Route path='*' element={<NOT_FOUND />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </div>
  );
}

export default App;
