import { db } from './app.js';
import {
    collection, query, orderBy, where, getDocs, doc, updateDoc, getDoc
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Escuchar el evento de carga del documento para asegurar que el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    cargarSolicitudes(); // Cargar todas las solicitudes al iniciar
    document.getElementById('filterStatus').addEventListener('change', function(e) {
        cargarSolicitudes(e.target.value); // Cargar solicitudes según el estatus seleccionado
    });
});

// Función para cargar solicitudes con o sin filtro de estatus
async function cargarSolicitudes(estatus = 'Todos') {
    let q;
    if (estatus === 'Todos') {
        q = query(collection(db, "Coleccion_Solicitud"), orderBy("Fecha_Hora_Atendida", "desc"));
    } else {
        q = query(collection(db, "Coleccion_Solicitud"), where("Estatus", "==", estatus), orderBy("Fecha_Hora_Atendida", "desc"));
    }

    const querySnapshot = await getDocs(q);
    const tableBody = document.getElementById('solicitudesList').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos datos

    querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const socioRef = doc(db, "Socios", data.Id_Socio);
        getDoc(socioRef).then(socioDoc => {
            const socioData = socioDoc.exists() ? socioDoc.data() : { nombre: "Nombre no disponible", apellidos: "" };

            const btnAtender = document.createElement('button');
            btnAtender.textContent = 'Atender';
            btnAtender.classList.add('btnAtender');
            btnAtender.onclick = () => mostrarModal(docSnapshot.id, data, `${socioData.nombre} ${socioData.apellidos}`);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${docSnapshot.id}</td>
                <td>${socioData.nombre} ${socioData.apellidos}</td>
                <td>${data.Descripcion}</td>
                <td>${data.Fecha_Hora_Atendida.toDate().toLocaleDateString("es-ES")}</td>
                <td>${data.Id_Socio}</td>
                <td>${data.Estatus}</td>
                <td></td>
            `;
            row.children[6].appendChild(btnAtender);
            tableBody.appendChild(row);
        });
    });
}

// Función para mostrar el modal con los detalles de la solicitud
function mostrarModal(solicitudId, data, nombreSocio) {
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <p><strong>Atendiendo solicitud:</strong></p>
        <p><strong>ID Solicitud:</strong> ${solicitudId}</p>
        <p><strong>ID Socio:</strong> ${data.Id_Socio}</p>
        <p><strong>Nombre:</strong> ${nombreSocio}</p>
        <p><strong>Fecha:</strong> ${data.Fecha_Hora_Atendida.toDate().toLocaleDateString("es-ES")}</p>
        <p><strong>Descripción:</strong> ${data.Descripcion}</p>
    `;
    document.getElementById('modal').style.display = 'block';

    document.getElementById('btnAceptar').onclick = () => atenderSolicitud(solicitudId, true);
    document.getElementById('btnRechazar').onclick = () => atenderSolicitud(solicitudId, false);
}

// Función para atender la solicitud y actualizar su estado
async function atenderSolicitud(solicitudId, aceptar) {
    const solicitudRef = doc(db, "Coleccion_Solicitud", solicitudId);
    await updateDoc(solicitudRef, {
        Estatus: aceptar ? "Atendida" : "Rechazada"
    });
    cerrarModal();
    cargarSolicitudes(document.getElementById('filterStatus').value); // Recargar las solicitudes después de modificar el estatus
}

// Función para cerrar el modal
function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
}
