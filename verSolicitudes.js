import { db } from './app.js';
import {
    collection, getDocs, doc, updateDoc, getDoc
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Carga inicial de las solicitudes
async function cargarSolicitudes() {
    const querySnapshot = await getDocs(collection(db, "Coleccion_Solicitud"));
    // En el forEach que itera sobre las solicitudes:
    querySnapshot.forEach(async (solicitudDoc) => {
        const data = solicitudDoc.data();
        if (data.Id_Socio) {
            const socioRef = doc(db, "Socios", data.Id_Socio);
            const socioDoc = await getDoc(socioRef);
            const socioData = socioDoc.exists() ? socioDoc.data() : { nombre: "Nombre no disponible", apellidos: "Apellido no disponible" };
            const row = document.createElement('tr');
            const btnAtender = document.createElement('button');
            btnAtender.textContent = 'Atender';
            btnAtender.classList.add('btnAtender');
            btnAtender.addEventListener('click', () => mostrarModal(
                solicitudDoc.id, 
                data.Descripcion, 
                `${socioData.nombre} ${socioData.apellidos}`, 
                data.Fecha_Hora_Atendida.toDate().toLocaleDateString("es-ES"),
                data.Id_Socio // Pasar el ID del socio a la función modal
            ));
    
            row.innerHTML = `
                <td>${solicitudDoc.id}</td>
                <td>${socioData.nombre} ${socioData.apellidos}</td>
                <td>${data.Descripcion}</td>
                <td>${data.Fecha_Hora_Atendida.toDate().toLocaleDateString("es-ES")}</td>
                <td>${data.Id_Socio}</td>
                <td>${data.Estatus}</td>
            `;
            row.appendChild(btnAtender);
            document.getElementById('solicitudesList').appendChild(row);
        }
    });
    

}

// Muestra el modal para atender la solicitud
function mostrarModal(solicitudId, descripcion, nombreSocio, fecha, idSocio) {
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <p><strong>Atendiendo solicitud:</strong></p>
        <p><strong>ID Solicitud:</strong> ${solicitudId}</p>
        <p><strong>ID Socio:</strong> ${idSocio}</p>
        <p><strong>Nombre:</strong> ${nombreSocio}</p>
        <p><strong>Fecha:</strong> ${fecha}</p>
        <p><strong>Descripción:</strong> ${descripcion}</p>
        
    `;
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
