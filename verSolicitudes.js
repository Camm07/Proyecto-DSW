// verSolicitudes.js
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
        <input type="text" id="commentBox" placeholder="Escribe un comentario">
    `;
    document.getElementById('modal').style.display = 'block';

    document.getElementById('btnAceptar').onclick = () => atenderSolicitud(solicitudId, true);
    document.getElementById('btnRechazar').onclick = () => atenderSolicitud(solicitudId, false);
}
// Función para atender las solicitudes y actualizar su estado
async function atenderSolicitud(solicitudId, aceptar) {
    const comentario = document.getElementById('commentBox').value; // Obtener el contenido de la caja de texto
    const solicitudRef = doc(db, "Coleccion_Solicitud", solicitudId);

    try {
        await updateDoc(solicitudRef, {
            Estatus: aceptar ? "Atendida" : "Rechazada",
            Comentario: comentario // Agregar el comentario a la colección
        });

        // Obtener los datos del socio
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
            console.error('Error al enviar el correo de notificación:', response.statusText);
        } else {
            console.log('Correo de notificación enviado con éxito');
        }
        alert('La solicitud ha sido actualizada.');
        cerrarModal();
        cargarSolicitudes(document.getElementById('filterStatus').value); // Refrescar la lista de solicitudes
    } catch (error) {
        console.error("Error al actualizar la solicitud:", error);
        alert("Error al procesar la solicitud.");
    }
}


function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
}

