// Estado inicial de la cuenta
let saldoActual = 4500.00;
let transacciones = [];

// Elementos del DOM
const balanceDisplay = document.getElementById('user-balance');
const paymentForm = document.getElementById('payment-form');
const transactionList = document.getElementById('transaction-list');
const txCountBadge = document.getElementById('tx-count-badge');
const btnRecharge = document.getElementById('btn-recharge');
const btnReset = document.getElementById('btn-reset');
const receiptModal = document.getElementById('receipt-modal');
const receiptDetails = document.getElementById('receipt-details');
const btnCloseModal = document.getElementById('btn-close-modal');

// Cargar datos persistentes de la simulación
document.addEventListener('DOMContentLoaded', () => {
    const savedBalance = localStorage.getItem('banco_saldo_v3');
    const savedTransactions = localStorage.getItem('banco_transacciones_v3');

    if (savedBalance !== null) {
        saldoActual = parseFloat(savedBalance);
    }
    if (savedTransactions) {
        transacciones = JSON.parse(savedTransactions);
    }
    
    actualizarInterfaz();
});

// Botón de recarga / abono de saldo de prueba
btnRecharge.addEventListener('click', () => {
    saldoActual += 5000.00;
    localStorage.setItem('banco_saldo_v3', saldoActual);
    actualizarInterfaz();
    alert("¡Depósito simulado exitoso! Se han acreditado Bs. 5.000,00 a su cuenta.");
});

// Botón de reset de base de datos local
btnReset.addEventListener('click', () => {
    if (confirm("¿Desea reiniciar los datos de la cuenta y vaciar el historial?")) {
        localStorage.removeItem('banco_saldo_v3');
        localStorage.removeItem('banco_transacciones_v3');
        saldoActual = 4500.00;
        transacciones = [];
        actualizarInterfaz();
        alert("Sistema restablecido a los valores de fábrica.");
    }
});

// Generar número de referencia de 8 dígitos al azar
function generarReferencia() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// Evento de procesamiento de pago
paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const bancoSelect = document.getElementById('dest-bank');
    const bancoNombre = bancoSelect.options[bancoSelect.selectedIndex].text;
    const telefono = document.getElementById('dest-phone').value.trim();
    const tipoDoc = document.getElementById('dest-doc-type').value;
    const cedula = document.getElementById('dest-id').value.trim();
    const concepto = document.getElementById('dest-concept').value.trim();
    const monto = parseFloat(document.getElementById('dest-amount').value);

    if (isNaN(monto) || monto <= 0) {
        alert("Error: Ingrese un monto de transferencia válido.");
        return;
    }

    if (monto > saldoActual) {
        alert("Fondos Insuficientes: El monto supera el saldo disponible.");
        return;
    }

    if (telefono.length < 11) {
        alert("Error: El teléfono debe tener 11 dígitos.");
        return;
    }

    saldoActual -= monto;
    const numReferencia = generarReferencia();
    const fechaHora = new Date().toLocaleString('es-VE', { 
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit' 
    });

    const nuevaTransaccion = {
        referencia: numReferencia,
        banco: bancoNombre,
        destinatario: `${tipoDoc}${cedula}`,
        telefono: telefono,
        concepto: concepto,
        monto: monto.toFixed(2),
        fecha: fechaHora
    };

    transacciones.unshift(nuevaTransaccion);

    localStorage.setItem('banco_saldo_v3', saldoActual);
    localStorage.setItem('banco_transacciones_v3', JSON.stringify(transacciones));

    actualizarInterfaz();
    paymentForm.reset();

    // Mostrar Comprobante Modal en lugar de alerta simple
    mostrarComprobante(nuevaTransaccion);
});

// Mostrar modal de comprobante
function mostrarComprobante(tx) {
    receiptDetails.innerHTML = `
        <p><strong>Referencia DB2:</strong> <span>#${tx.referencia}</span></p>
        <p><strong>Fecha/Hora:</strong> <span>${tx.fecha}</span></p>
        <p><strong>Banco Destino:</strong> <span>${tx.banco}</span></p>
        <p><strong>Teléfono:</strong> <span>${tx.telefono}</span></p>
        <p><strong>Cédula:</strong> <span>${tx.destinatario}</span></p>
        <p><strong>Concepto:</strong> <span>${tx.concepto}</span></p>
        <p style="border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-top: 8px; font-size: 1rem;"><strong>Monto Pagado:</strong> <span style="color: #ef4444; font-weight: bold;">Bs. ${tx.monto}</span></p>
    `;
    receiptModal.classList.add('active');
}

btnCloseModal.addEventListener('click', () => {
    receiptModal.classList.remove('active');
});

// Renderizado de datos en pantalla
function actualizarInterfaz() {
    balanceDisplay.textContent = `Bs. ${saldoActual.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`;
    txCountBadge.textContent = `${transacciones.length} registros`;

    transactionList.innerHTML = '';

    if (transacciones.length === 0) {
        transactionList.innerHTML = '<li style="border-left: 4px solid #cbd5e1; justify-content: center; color: #64748b;">No hay movimientos registrados hoy</li>';
        return;
    }

    transacciones.forEach(tx => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="tx-main">
                <strong>${tx.banco}</strong>
                <span class="tx-meta">Telf: ${tx.telefono} | Doc: ${tx.destinatario}</span>
                <span class="tx-meta">Motivo: ${tx.concepto}</span>
                <span class="tx-ref">Ref. DB2: #${tx.referencia} - ${tx.fecha}</span>
            </div>
            <div>
                <div class="tx-amount">-Bs. ${parseFloat(tx.monto).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</div>
            </div>
        `;
        transactionList.appendChild(li);
    });
}