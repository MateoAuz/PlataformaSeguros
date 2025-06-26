import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css';
import AuthGuard from './components/guards/AuthGuard';
import { UserProvider } from './context/UserContext';
import { DashboardAdmin } from './pages/admin/DashboardAdmin';
import { DashboardAgente } from './pages/agente/DashboardAgente';
import { DashboardCliente } from './pages/Cliente/DashboardCliente';
import { Login } from './pages/Login/index';
import { NOT_FOUND } from './pages/NOT_FOUND/index';
import { Pagina_inicio } from './pages/Pagina_inicio/index';

function App() {
  return (
    <div className="App">
      <UserProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<Pagina_inicio/>} />
              <Route path='/login' element={<Login />} />

              {/* Rutas protegidas */}
              <Route element={<AuthGuard allowedTypes={[0]} />}>
                <Route path="/admin/*" element={<DashboardAdmin />} />
              </Route>

              <Route element={<AuthGuard allowedTypes={[1]} />}>
                <Route path="/agente/*" element={<DashboardAgente />} />
              </Route>

              <Route element={<AuthGuard allowedTypes={[2]} />}>
                <Route path="/cliente/*" element={<DashboardCliente />} />
              </Route>

              <Route path='*' element={<NOT_FOUND />} />
            </Routes>
          </BrowserRouter>
        </LocalizationProvider>
      </UserProvider>
    </div>
  );
}

export default App;
