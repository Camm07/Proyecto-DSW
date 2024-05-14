// solicitud.js
import { db } from './app.js';
import { collection, addDoc, serverTimestamp, getDoc, doc, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

const formulario = document.getElementById('formularioSolicitud');
const messageDiv = document.querySelector('.message');
const solicitudesTableBody = document.querySelector('#solicitudesTable tbody');

document.addEventListener('DOMContentLoaded', function() {
    const idSocio = sessionStorage.getItem('socioId');
    if (idSocio) {
        document.getElementById('idSocio').value = idSocio;
        loadSolicitudes();
    } else {
        console.log("ID del socio no encontrado en sessionStorage");
    }
});

async function loadSolicitudes() {
    const idSocio = sessionStorage.getItem('socioId');
    if (idSocio) {
        solicitudesTableBody.innerHTML = ''; // Limpiar la tabla antes de cargar las solicitudes
        const solicitudesRef = collection(db, "Coleccion_Solicitud");
        const q = query(solicitudesRef, where("Id_Socio", "==", idSocio));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((solicitud) => {
            const data = solicitud.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.Fecha_Hora_Atendida.toDate().toLocaleString()}</td>
                <td>${data.Estatus}</td>
                <td>${solicitud.id}</td>
                <td>${data.Descripcion}</td>
                <td>${data.Comentario}</td>
            `;
            solicitudesTableBody.appendChild(row);
        });
    } else {
        console.log("ID del socio no disponible para cargar las solicitudes");
    }
}

formulario.addEventListener('submit', async function(event) {
    event.preventDefault();
    const idSocio = sessionStorage.getItem('socioId');
    const descripcion = document.getElementById('descripcionSolicitud').value;

    if (!idSocio) {
        console.error("No se pudo recuperar el ID del socio");
        messageDiv.textContent = "Error al enviar la solicitud: No se pudo recuperar el ID del socio";
        messageDiv.style.color = "red";
        return;
    }

    try {
        await addDoc(collection(db, "Coleccion_Solicitud"), {
            Id_Socio: idSocio,
            Descripcion: descripcion,
            Estatus: "Pendiente",
            Comentario: "",
            Fecha_Hora_Atendida: serverTimestamp(),
        });
        messageDiv.textContent = "Tu solicitud fue enviada exitosamente.";
        loadSolicitudes(); // Recargar la lista de solicitudes para ver la nueva solicitud agregada

        setTimeout(function() {
            messageDiv.textContent = "";
        }, 5000);
    } catch (error) {
        console.error("Error al enviar la solicitud: ", error);
        messageDiv.textContent = "Error al enviar la solicitud.";
        messageDiv.style.color = "red";
    }
});
