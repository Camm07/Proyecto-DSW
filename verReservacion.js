import { db } from './app.js';
import {
    collection, query, orderBy, where, getDocs, doc, updateDoc, getDoc
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
    cargarReservaciones();
    document.querySelector('.modal-close').addEventListener('click', cerrarModal);
    document.getElementById('filterStatus').addEventListener('change', function (e) {
        cargarReservaciones(e.target.value);
    });
});

async function cargarReservaciones(estatus = 'Todos') {
    let q;
    if (estatus === 'Todos') {
        q = query(collection(db, "Coleccion_Reservacion"), orderBy("Fecha_Hora_Solicitud", "desc"));
    } else {
        q = query(
            collection(db, "Coleccion_Reservacion"),
            where("Estatus", "==", estatus),
            orderBy("Fecha_Hora_Solicitud", "desc")
        );
    }

    const querySnapshot = await getDocs(q);
    const results = await Promise.all(querySnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        const socioRef = doc(db, "Socios", data.Id_Socio);
        return getDoc(socioRef).then(socioDoc => {
            const socioData = socioDoc.exists() ? socioDoc.data() : { nombre: "Nombre no disponible", apellidos: "" ,correo:""};
            return {
                id: docSnapshot.id,
                socioData,
                data
            };
        });
    }));

    const tableBody = document.getElementById('reservacionesList').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    results.forEach(({ id, socioData, data }) => appendRow(id, socioData, data));
}

function appendRow(id, socioData, data) {
    const tableBody = document.getElementById('reservacionesList').getElementsByTagName('tbody')[0];
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
        <td></td> 
    `;
    row.cells[5].appendChild(btnAtender);
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
        <p><strong>Fecha de Solicitud:</strong> ${data.Fecha_Hora_Solicitud.toDate().toLocaleString()}</p>
        <p><strong>Espacio:</strong> ${data.Espacio}</p>
        <input type="text" id="commentBox" placeholder="Escribe un comentario">
    `;
    document.getElementById('modal').style.display = 'block';
    document.getElementById('btnAceptar').onclick = () => autorizarReserva(reservaId, true);
    document.getElementById('btnRechazar').onclick = () => autorizarReserva(reservaId, false);
}

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
