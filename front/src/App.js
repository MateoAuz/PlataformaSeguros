import './App.css';
import {BrowserRouter, Routes, Route} from "react-router-dom"
import { Pagina_inicio } from './pages/Pagina_inicio/index';
import { Login } from './pages/Login/index';
import { NOT_FOUND } from './pages/NOT_FOUND/index';
import { DashboardAdmin } from './pages/admin/DashboardAdmin';
import { DashboardAgente } from './pages/agente/DashboardAgente';
import { UserProvider } from './context/UserContext';
import { Clientes } from './components/Clientes';
import { PClientes } from './pages/cliente/PClientes';

function App() {
  return (
    <div className="App">
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Pagina_inicio/>}/>
            <Route path='*' element={<NOT_FOUND/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path="/admin/*" element={<DashboardAdmin />} />
            <Route path="/agente/*" element={<DashboardAgente />} />
            <Route path="/cliente/*" element={<PClientes />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </div>
  );
}

export default App;
