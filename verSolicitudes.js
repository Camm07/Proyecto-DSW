import { db } from './app.js';
import {
    collection, getDocs, doc, updateDoc, getDoc
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Carga inicial de las solicitudes
async function cargarSolicitudes() {
    const querySnapshot = await getDocs(collection(db, "Coleccion_Solicitud"));
    querySnapshot.forEach(async (solicitudDoc) => {
        const data = solicitudDoc.data();
        // Asegurándose de que Id_Socio está presente
        if (data.Id_Socio) {
            const socioRef = doc(db, "Socios", data.Id_Socio);
            const socioDoc = await getDoc(socioRef);
            const socioData = socioDoc.exists() ? socioDoc.data() : { nombre: "Nombre no disponible", apellidos: "Apellido no disponible" };
            const row = document.createElement('tr');
            const btnAtender = document.createElement('button');
            btnAtender.textContent = 'Atender';
            btnAtender.addEventListener('click', () => mostrarModal(solicitudDoc.id, data.Descripcion));

            row.innerHTML = `
                <td>${solicitudDoc.id}</td>
                <td>${socioData.nombre} ${socioData.apellidos}</td>
                <td>${data.Descripcion}</td>
                <td>${data.Fecha_Hora_Atendida.toDate().toLocaleDateString()}</td>
                <td>${data.Id_Socio}</td>
                <td>${data.Estatus}</td>
            `;
            row.appendChild(btnAtender);
            document.getElementById('solicitudesList').appendChild(row);
        }
    });
}

// Muestra el modal para atender la solicitud
function mostrarModal(solicitudId, descripcion) {
    const modalContent = document.getElementById('modalContent');
    modalContent.textContent = `Atendiendo solicitud: ${solicitudId} - ${descripcion}`;
    document.getElementById('modal').style.display = 'block';

    document.getElementById('btnAceptar').onclick = () => atenderSolicitud(solicitudId, true);
    document.getElementById('btnRechazar').onclick = () => atenderSolicitud(solicitudId, false);
}

// Función para atender la solicitud
async function atenderSolicitud(solicitudId, aceptar) {
    const solicitudRef = doc(db, "Coleccion_Solicitud", solicitudId);
    await updateDoc(solicitudRef, {
        Estatus: aceptar ? "Atendida" : "Rechazada"
    });
    cerrarModal();
    location.reload(); // Recarga la página para actualizar la lista
}

// Cierra el modal
function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', cargarSolicitudes);
