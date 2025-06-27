// back/services/pagoScheduler.js

const cron = require('node-cron');
const db = require('../db/connection'); // ajuste si tu conexión está en otro path

/**
 * Función auxiliar que, dado un Date y un string de 'Mensual'|'Trimestral'|'Anual',
 * devuelve un nuevo Date con el período agregado.
 */
function agregarPeriodo(fechaBase, tiempoPago) {
  const f = new Date(fechaBase); // clonar
  switch (tiempoPago.toLowerCase()) {
    case 'mensual':
      f.setMonth(f.getMonth() + 1);
      break;
    case 'trimestral':
      f.setMonth(f.getMonth() + 3);
      break;
    case 'anual':
      f.setFullYear(f.getFullYear() + 1);
      break;
    default:
      // Si tuvieras otros casos, manejarlos aquí. Por defecto, no suma nada.
      break;
  }
  return f;
}

/**
 * Programa un cron job que corre todos los días a las 00:00 (medianoche) y
 * verifica cada contrato activo. Si ya llegó la fecha de pago y el usuario aún
 * no ha pagado el período (o nunca ha pagado), marca estado_pago = 0.
 */
function iniciarPagoScheduler() {
  // '0 0 * * *' => a las 00:00 cada día
  cron.schedule('0 0 * * *', () => {
    console.log('[pagoScheduler] Iniciando revisión de pagos pendientes:', new Date().toISOString());

    // 1. Traer todos los contratos activos (estado = 1) junto con su info de seguro (tiempo_pago)
    const sqlContratos = `
      SELECT us.id_usuario_seguro, us.fecha_contrato, us.estado_pago,
             s.tiempo_pago
      FROM usuario_seguro us
      JOIN seguro s ON us.id_seguro_per = s.id_seguro
      WHERE us.estado = 1
    `;

    db.query(sqlContratos, (err, contratos) => {
      if (err) {
        console.error('[pagoScheduler] Error al obtener contratos activos:', err);
        return;
      }

      const hoy = new Date();
      // Recorrer cada contrato
      contratos.forEach((contrato) => {
        const idUsrSeg = contrato.id_usuario_seguro;
        const fechaContrato = contrato.fecha_contrato; // tipo DATE (YYYY-MM-DD)
        const tiempoPago = contrato.tiempo_pago;       // 'Mensual'|'Trimestral'|'Anual'
        
        // 2. Obtener la última fecha de pago realizado para este contrato (si existe)
        const sqlUltPago = `
          SELECT MAX(fecha_pago) AS ultima_fecha
          FROM pago_seguro
          WHERE id_usuario_seguro_per = ?
        `;

        db.query(sqlUltPago, [idUsrSeg], (err2, rowsPago) => {
          if (err2) {
            console.error(`[pagoScheduler] Error al obtener último pago de contrato ${idUsrSeg}:`, err2);
            return;
          }

          // Si no hay pagos, rowsPago[0].ultima_fecha será null => usar fechaContrato como base
          let fechaReferencia = fechaContrato;
          if (rowsPago.length && rowsPago[0].ultima_fecha) {
            fechaReferencia = rowsPago[0].ultima_fecha;
          }

          // 3. Calcular la próxima fecha de vencimiento sumando un período a 'fechaReferencia'
          const proxVencimiento = agregarPeriodo(fechaReferencia, tiempoPago);
          // IMPORTANTE: convertir proxVencimiento a solo fecha (sin hora)
          proxVencimiento.setHours(0,0,0,0);

          // 4. Comparar con la fecha actual (sin horas)
          const hoySoloFecha = new Date(hoy);
          hoySoloFecha.setHours(0,0,0,0);

          if (hoySoloFecha >= proxVencimiento) {
            // Ya pasó (o es) la fecha de vencimiento.
            // Revisar si hay algún registro en pago_seguro con fecha_pago >= proxVencimiento.
            const sqlPagoEstePeriodo = `
              SELECT COUNT(*) AS cuenta 
              FROM pago_seguro 
              WHERE id_usuario_seguro_per = ?
                AND fecha_pago >= ?
            `;
            // Pasamos proxVencimiento en formato 'YYYY-MM-DD'
            const yyyy = proxVencimiento.getFullYear();
            const mm = String(proxVencimiento.getMonth() + 1).padStart(2, '0');
            const dd = String(proxVencimiento.getDate()).padStart(2, '0');
            const fechaStr = `${yyyy}-${mm}-${dd}`;

            db.query(sqlPagoEstePeriodo, [idUsrSeg, fechaStr], (err3, rowsCnt) => {
              if (err3) {
                console.error(`[pagoScheduler] Error al contar pagos para contrato ${idUsrSeg}:`, err3);
                return;
              }

              const pagosEnPeriodo = rowsCnt[0].cuenta;
              if (pagosEnPeriodo === 0) {
                // NO hay pagos desde la fecha de vencimiento (o nunca los hubo). → marcar impago.
                const sqlUpdateImpago = `
                  UPDATE usuario_seguro
                  SET estado_pago = 0
                  WHERE id_usuario_seguro = ?
                `;
                db.query(sqlUpdateImpago, [idUsrSeg], (err4) => {
                  if (err4) {
                    console.error(`[pagoScheduler] Error al actualizar estado_pago=0 para contrato ${idUsrSeg}:`, err4);
                  }
                });
              } else {
                // Existe al menos un pago para este período, no hacemos nada. 
                // Nota: aunque el pago ya puso estado_pago=1, podrías volver a garantizar que sigue en 1:
                const sqlEnsurePagado = `
                  UPDATE usuario_seguro
                  SET estado_pago = 1
                  WHERE id_usuario_seguro = ?
                `;
                db.query(sqlEnsurePagado, [idUsrSeg], (err5) => {
                  if (err5) {
                    console.error(`[pagoScheduler] Error al reafirmar estado_pago=1 para contrato ${idUsrSeg}:`, err5);
                  }
                });
              }
            });
          }
          // Si la fecha actual ES ANTES del próximo vencimiento, no hacemos nada: 
          // mantiene el estado_pago anterior (ya sea 1 o 0, según corresponda).
        });
      });
    });
  }, {
    timezone: 'America/Guayaquil' // Opcional: fuerzas a que el cron use la zona que corresponda
  });
}

module.exports = { iniciarPagoScheduler };
