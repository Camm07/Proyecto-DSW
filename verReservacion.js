import { db } from './app.js';
import {
    collection, query, orderBy, where, getDocs, doc, updateDoc, getDoc
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
    cargarReservaciones();
    document.querySelector('.modal-close').addEventListener('click', cerrarModal);
    document.getElementById('filterStatus').addEventListener('change', function(e) {
        cargarReservaciones(e.target.value);
    });
});

async function cargarReservaciones(estatus = 'Todos') {
    let q;
    if (estatus === 'Todos') {
        q = query(collection(db, "Coleccion_Reservacion"), orderBy("Fecha_Reservacion", "desc"));
    } else {
        q = query(
            collection(db, "Coleccion_Reservacion"),
            where("Estatus", "==", estatus),
            orderBy("Fecha_Reservacion", "desc")
        );
    }

    const querySnapshot = await getDocs(q);
    const promises = querySnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        const socioRef = doc(db, "Socios", data.Id_Socio);
        return getDoc(socioRef).then(socioDoc => {
            const socioData = socioDoc.exists() ? socioDoc.data() : { nombre: "Nombre no disponible", apellidos: "" };
            return {
                id: docSnapshot.id,
                socioData,
                data
            };
        });
    });

    const results = await Promise.all(promises);
    results.sort((a, b) => b.data.Fecha_Reservacion - a.data.Fecha_Reservacion);

    const tableBody = document.getElementById('reservacionesList').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    results.forEach(({ id, socioData, data }) => appendRow(id, socioData, data));
}

function appendRow(id, socioData, data) {
    const tableBody = document.getElementById('reservacionesList').getElementsByTagName('tbody')[0];
    if (!tableBody) {
        console.error("No se encontró el cuerpo de la tabla");
        return;
    }

    const btnAtender = document.createElement('button');
    btnAtender.textContent = 'Atender';
    btnAtender.classList.add('btnAtender');
    btnAtender.onclick = () => mostrarModal(id, data, `${socioData.nombre} ${socioData.apellidos}`);

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${id}</td>
        <td>${socioData.nombre} ${socioData.apellidos}</td>
        <td>${data.Fecha_Reservacion}</td>
        <td>${data.Espacio}</td>
        <td>${data.Estatus}</td>
        <td></td> <!-- Asegúrate de que este td está para el botón -->
    `;
    
    const cell = row.cells[5]; // Usa cells para acceder de manera segura
    if (!cell) {
        console.error("No se encontró la celda para el botón");
        return;
    }

    cell.appendChild(btnAtender);
    tableBody.appendChild(row);
}


function mostrarModal(reservaId, data, nombreSocio) {
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <p><strong>Atendiendo reserva:</strong></p>
        <p><strong>ID Reserva:</strong> ${reservaId}</p>
        <p><strong>ID Socio:</strong> ${data.Id_Socio}</p>
        <p><strong>Nombre:</strong> ${nombreSocio}</p>
        <p><strong>Fecha de Reservación:</strong> ${data.Fecha_Reservacion}</p>
        <p><strong>Espacio:</strong> ${data.Espacio}</p>
        <input type="text" id="commentBox" placeholder="Escribe un comentario">
    `;
    document.getElementById('modal').style.display = 'block';

    document.getElementById('btnAceptar').onclick = () => autorizarReserva(reservaId, true);
    document.getElementById('btnRechazar').onclick = () => autorizarReserva(reservaId, false);
}

// Función para autorizar o rechazar reservas
async function autorizarReserva(reservaId, aceptar) {
    const comentario = document.getElementById('commentBox').value;
    const reservaRef = doc(db, "Coleccion_Reservacion", reservaId);
    await updateDoc(reservaRef, {
        Estatus: aceptar ? "Aprobada" : "Rechazada",
        Comentario: comentario
    });
    cerrarModal();
    cargarReservaciones(document.getElementById('filterStatus').value);
}

function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
}
