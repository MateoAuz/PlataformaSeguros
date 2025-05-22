"use client";
import React from "react";
import { Routes, Route } from "react-router-dom";
import {MenuCliente} from '../../components/Cliente/MenuCliente';
import { SegurosCliente } from "../../components/Cliente/SegurosCliente";
import { ContratacionCliente } from "../../components/Cliente/ContratacionCliente";
import PagosCliente from '../../components/Cliente/PagosCliente';
import { ReembolsosCliente } from "../../components/Cliente/ReembolsosCliente";
import HistorialCliente from '../../components/Cliente/HistorialCliente';
import { NotificacionesCliente } from "../../components/Cliente/NotificacionesCliente";
import { Cliente } from "../../components/Cliente/Cliente";

export const DashboardCliente = () => {
  return (
    <div className="dashboard-cliente">
      <MenuCliente>
        <Routes>
          <Route index element={<Cliente />} />
          <Route path="seguros" element={<SegurosCliente />} />
          <Route path="contratacion" element={<ContratacionCliente />} />
          <Route path="pagos" element={<PagosCliente />} />
          <Route path="reembolsos" element={<ReembolsosCliente />} />
          <Route path="historial" element={<HistorialCliente />} />
          <Route path="notificaciones" element={<NotificacionesCliente />} />
        </Routes>
      </MenuCliente>
    </div>
  );
};

export default DashboardCliente;