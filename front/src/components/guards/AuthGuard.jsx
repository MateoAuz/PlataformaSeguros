import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

const AuthGuard = ({ allowedTypes }) => {
  const { usuario } = useContext(UserContext);

  // Si no ha iniciado sesión
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Si inició sesión, pero no tiene el rol permitido
  if (!allowedTypes.includes(usuario.tipo)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
