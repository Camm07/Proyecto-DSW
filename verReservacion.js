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

function showMessageModal(message) {
    const modalBody = document.getElementById('messageModalBody');
    modalBody.textContent = message;
    const messageModal = new bootstrap.Modal(document.getElementById('messageModal'), {
      keyboard: false
    });
    messageModal.show();
}

function formatearFecha(fecha) {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const diasSemana = [
        'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
    ];

    const date = new Date(fecha);

    const diaSemana = diasSemana[date.getUTCDay()];
    const dia = date.getUTCDate();
    const mes = meses[date.getUTCMonth()];
    const anio = date.getUTCFullYear();

    return `${diaSemana}, ${dia} de ${mes} de ${anio}`;
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
        <td>${formatearFecha(data.Fecha_Reservacion)}</td>
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
        <p><strong>Fecha de Reservación:</strong> ${formatearFecha(data.Fecha_Reservacion)}</p>
        <p><strong>Fecha de Solicitud:</strong> ${data.Fecha_Hora_Solicitud.toDate().toLocaleString()}</p>
        <p><strong>Espacio:</strong> ${data.Espacio}</p>
        <input type="text" id="commentBox" placeholder="Escribe un comentario">
    `;
    document.getElementById('modal').style.display = 'block';
    document.getElementById('btnAceptar').onclick = () => autorizarReserva(reservaId, true);
    document.getElementById('btnRechazar').onclick = () => autorizarReserva(reservaId, false);
}

async function autorizarReserva(reservaId, aceptar) {
    try {
        const comentario = document.getElementById('commentBox').value;
        const reservaRef = doc(db, "Coleccion_Reservacion", reservaId);
        const reservaDoc = await getDoc(reservaRef);
        if (!reservaDoc.exists()) {
            throw new Error('No se encontró la reservación');
        }
        const reservaData = reservaDoc.data();
        const socioRef = doc(db, "Socios", reservaData.Id_Socio);
        const socioDoc = await getDoc(socioRef);
        if (!socioDoc.exists()) {
            throw new Error('No se encontró el socio');
        }
        const socioData = socioDoc.data();
        await updateDoc(reservaRef, {
            Estatus: aceptar ? "Aprobada" : "Rechazada",
            Comentario: comentario
        });
        const estatus = aceptar ? "Aprobada" : "Rechazada";
        const response = await fetch('http://localhost:3000/correo-reservacion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: socioData.nombre,
                email: socioData.correo,
                espacio: reservaData.Espacio,
                fechaReservacion: formatearFecha(reservaData.Fecha_Reservacion),
                comentario: comentario,
                estatus: estatus
            })
        });
        if (!response.ok) {
            console.error('Error al enviar el correo de notificación:', response.statusText);
            showMessageModal('Error al enviar el correo de notificación: ' + response.statusText); // Reemplazado de alert()
        } else {
            console.log('Correo de notificación enviado con éxito');
            showMessageModal('Correo de notificación enviado con éxito'); // Reemplazado de alert()
        }
        cerrarModal();
        cargarReservaciones(document.getElementById('filterStatus').value);
    } catch (error) {
        console.error('Error en el proceso de autorizar reserva:', error.message);
        showMessageModal('Error en el proceso de autorizar reserva: ' + error.message); // Reemplazado de alert()
    }
}

function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
}
