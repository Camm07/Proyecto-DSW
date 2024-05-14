import { db } from './app.js';
import {
    collection, query, orderBy, where, getDocs, doc, updateDoc, getDoc
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

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

function appendRow(id, socioData, data) {
    const tableBody = document.getElementById('solicitudesList').getElementsByTagName('tbody')[0];
    const btnAtender = document.createElement('button');
    btnAtender.textContent = 'Atender';
    btnAtender.classList.add('btnAtender');
    btnAtender.onclick = () => mostrarModal(id, data, `${socioData.nombre} ${socioData.apellidos}`);

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${id}</td>
        <td>${socioData.nombre} ${socioData.apellidos}</td>
        <td>${data.Descripcion}</td>
        <td>${data.Fecha_Hora_Atendida.toDate().toLocaleDateString("es-ES")}</td>
        <td>${data.Id_Socio}</td>
        <td>${data.Estatus}</td>
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
        <p><strong>Fecha:</strong> ${data.Fecha_Hora_Atendida.toDate().toLocaleDateString("es-ES")}</p>
        <p><strong>Descripción:</strong> ${data.Descripcion}</p>
    `;
    document.getElementById('modal').style.display = 'block';

    document.getElementById('btnAceptar').onclick = () => atenderSolicitud(solicitudId, true);
    document.getElementById('btnRechazar').onclick = () => atenderSolicitud(solicitudId, false);
}

// Función para atender las solicitudes y actualizar su estado
async function atenderSolicitud(solicitudId, aceptar) {
    const comentario = document.getElementById('commentBox').value; // Obtener el contenido de la caja de texto
    const solicitudRef = doc(db, "Coleccion_Solicitud", solicitudId);
    await updateDoc(solicitudRef, {
        Estatus: aceptar ? "Atendida" : "Rechazada",
        Comentario: comentario // Agregar el comentario a la colección
    });
    cerrarModal();
    cargarSolicitudes(document.getElementById('filterStatus').value);
}


export function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
}

