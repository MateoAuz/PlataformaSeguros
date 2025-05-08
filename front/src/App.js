import logo from './logo.svg';
import './App.css';
import Button from '@mui/material/Button';
import {BrowserRouter, Routes, Route} from "react-router-dom"
import { Pagina_inicio } from './pages/Pagina_inicio/index';
import { Login } from './pages/Login/index';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Pagina_inicio/>}/>
          <Route path='*' element={<>NOT FOUND</>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/dashboard' element={<>Pagina del dashboard</>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
