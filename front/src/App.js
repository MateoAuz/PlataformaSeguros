import './App.css';
import {BrowserRouter, Routes, Route} from "react-router-dom"
import { Pagina_inicio } from './pages/Pagina_inicio/index';
import { Login } from './pages/Login/index';
import { NOT_FOUND } from './pages/NOT_FOUND/index';
import { DashboardAdmin } from './pages/admin/DashboardAdmin';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Pagina_inicio/>}/>
          <Route path='*' element={<NOT_FOUND/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/admin' element={<DashboardAdmin/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
