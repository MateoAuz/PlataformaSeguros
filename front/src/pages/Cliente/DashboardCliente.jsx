"use client";
import React from "react";
import { Routes, Route } from "react-router-dom";
import {MenuCliente} from '../../components/Cliente/MenuCliente';
import { ContratacionCliente } from "../../components/Cliente/ContratacionCliente";
import PagosCliente from '../../components/Cliente/PagosCliente';
import ReembolsosCliente  from "../../components/Cliente/ReembolsosCliente";
import Historial from '../../components/Cliente/Historial';
import NotificacionesCliente from "../../components/Cliente/NotificacionesCliente";
import Cliente  from "../../components/Cliente/Cliente";
import { PerfilUsuario } from '../../components/PerfilUsuario/PerfilUsuario';


export const DashboardCliente = () => {
  return (
    <div className="dashboard-cliente">
      <MenuCliente>
        <Routes>
          <Route index element={<Cliente />} />
          <Route path="contratacion" element={<ContratacionCliente />} />
          <Route path="pagos" element={<PagosCliente />} />
          <Route path="reembolsos" element={<ReembolsosCliente />} />
          <Route path="historial" element={<Historial />} />
          <Route path="notificaciones" element={<NotificacionesCliente />} />
          <Route path="perfil" element={<PerfilUsuario />} />
        </Routes>
      </MenuCliente>
    </div>
  );
};

export default DashboardCliente;