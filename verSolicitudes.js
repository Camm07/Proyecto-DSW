import { db } from './app.js';
import {
    collection, query, orderBy, where, getDocs, doc, getDoc
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { updateDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
    cargarSolicitudes();
    document.querySelector('.modal-close').addEventListener('click', cerrarModal);
    document.getElementById('filterStatus').addEventListener('change', function(e) {
        cargarSolicitudes(e.target.value);
    });
});

async function cargarSolicitudes(estatus = 'Todos') {
    let q;
    if (estatus === 'Todos') {
        q = query(collection(db, "Coleccion_Solicitud"), orderBy("Fecha_Hora_Atendida", "desc"));
    } else {
        q = query(
            collection(db, "Coleccion_Solicitud"),
            where("Estatus", "==", estatus),
            orderBy("Fecha_Hora_Atendida", "desc")
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
    results.sort((a, b) => b.data.Fecha_Hora_Atendida.toDate() - a.data.Fecha_Hora_Atendida.toDate());

    const tableBody = document.getElementById('solicitudesList').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    results.forEach(({ id, socioData, data }) => appendRow(id, socioData, data));
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
    date.setDate(date.getDate() - 1); //Errorsillo xd, pero se resta para ajustar xd

    const diaSemana = diasSemana[date.getUTCDay()];
    const dia = date.getUTCDate();
    const mes = meses[date.getUTCMonth()];
    const anio = date.getUTCFullYear();
    const horas = date.getUTCHours().toString().padStart(2, '0');
    const minutos = date.getUTCMinutes().toString().padStart(2, '0');
    const segundos = date.getUTCSeconds().toString().padStart(2, '0');

    return `${diaSemana}, ${dia} de ${mes} de ${anio} ${horas}:${minutos}:${segundos}`;
}

function appendRow(id, socioData, data) {
    const tableBody = document.getElementById('solicitudesList').getElementsByTagName('tbody')[0];
    const btnAtender = document.createElement('button');
    btnAtender.textContent = 'Atender';
    btnAtender.classList.add('btnAtender');
    btnAtender.onclick = () => mostrarModal(id, data, `${socioData.nombre} ${socioData.apellidos}`);

    if (data.Estatus === 'Pendiente') {
        btnAtender.textContent = 'Atender';
    } else {
        btnAtender.textContent = 'Editar';
        btnAtender.classList.add('btn-editar');
    }

    const row = document.createElement('tr');
    row.classList.add('solicitud-' + data.Estatus.toLowerCase()); 
    row.innerHTML = `
        <td>${id}</td>
        <td>${socioData.nombre} ${socioData.apellidos}</td>
        <td>${data.Descripcion}</td>
        <td>${formatearFecha(data.Fecha_Hora_Atendida.toDate())}</td>
        <td>${data.Id_Socio}</td>
        <td id = 'xdcolor'>${data.Estatus}</td>
        <td></td>
    `;
    row.children[6].appendChild(btnAtender);
    tableBody.appendChild(row);
}

function mostrarModal(solicitudId, data, nombreSocio) {
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <p><strong>Atendiendo solicitud:</strong></p>
        <p><strong>ID Solicitud:</strong> ${solicitudId}</p>
        <p><strong>ID Socio:</strong> ${data.Id_Socio}</p>
        <p><strong>Nombre:</strong> ${nombreSocio}</p>
        <p><strong>Fecha:</strong> ${formatearFecha(data.Fecha_Hora_Atendida.toDate())}</p>
        <p><strong>Descripción:</strong> ${data.Descripcion}</p>
        <input type="text" id="commentBox" placeholder="Escribe un comentario">
    `;
    document.getElementById('modal').style.display = 'block';

    document.getElementById('btnAceptar').onclick = () => atenderSolicitud(solicitudId, true);
    document.getElementById('btnRechazar').onclick = () => atenderSolicitud(solicitudId, false);
}

async function atenderSolicitud(solicitudId, aceptar) {
    const comentario = document.getElementById('commentBox').value;
    const solicitudRef = doc(db, "Coleccion_Solicitud", solicitudId);

    try {
        await updateDoc(solicitudRef, {
            Estatus: aceptar ? "Atendida" : "Rechazada",
            Comentario: comentario
        });

        // Suponiendo que los datos del socio están disponibles
        const solicitudDoc = await getDoc(solicitudRef);
        const solicitudData = solicitudDoc.data();
        const socioRef = doc(db, "Socios", solicitudData.Id_Socio);
        const socioDoc = await getDoc(socioRef);
        const socioData = socioDoc.data();

        // Enviar correo al socio
        const response = await fetch('http://localhost:3000/correo-solicitud', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: socioData.nombre,
                email: socioData.correo,
                comentario: comentario,
                estatus: aceptar ? "Atendida" : "Rechazada"
            })
        });

        if (!response.ok) {
            await showMessageModal('Error al enviar el correo de notificación: ' + response.statusText);
        } else {
            await showMessageModal('Correo de notificación enviado con éxito');
        }

        await showMessageModal('La solicitud ha sido actualizada.');
        cerrarModal();
        cargarSolicitudes(document.getElementById('filterStatus').value);

    } catch (error) {
        console.error("Error al actualizar la solicitud:", error);
        await showMessageModal("Error al procesar la solicitud: " + error.message);
    }
}

function showMessageModal(message) {
    const modalBody = document.getElementById('messageModalBody');
    modalBody.textContent = message;
    
    const messageModal = new bootstrap.Modal(document.getElementById('messageModal'), {
      keyboard: false
    });
    
    messageModal.show();

    return new Promise((resolve) => {
        document.getElementById('messageModal').addEventListener('hidden.bs.modal', function () {
            resolve();
        }, { once: true });
    });
}

function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
}
