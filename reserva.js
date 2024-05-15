// reserva.js
import { db } from './app.js';
import {
    collection, addDoc, serverTimestamp, getDoc, doc, getDocs, query, where
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

const formularioReserva = document.getElementById('formularioReserva');
const messageDiv = document.querySelector('.message');
const reservasTableBody = document.querySelector('#reservasTable tbody');

document.addEventListener('DOMContentLoaded', function() {
    const idSocio = sessionStorage.getItem('socioId');
    if (idSocio) {
        document.getElementById('idSocio').value = idSocio;
        cargarReservas();
    } else {
        console.log("ID del socio no encontrado en sessionStorage");
    }
});

async function cargarReservas() {
    const idSocio = sessionStorage.getItem('socioId');
    if (idSocio) {
        reservasTableBody.innerHTML = ''; // Limpiar la tabla antes de cargar las reservas
        const reservasRef = collection(db, "Coleccion_Reservacion");
        const q = query(reservasRef, where("Id_Socio", "==", idSocio));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((reserva) => {
            const data = reserva.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.Fecha_Reservacion.toDate().toLocaleString()}</td>
                <td>${data.Fecha_Hora_Solicitud.toDate().toLocaleString()}</td>
                <td>${data.Estatus}</td>
                <td>${reserva.id}</td>
                <td>${data.Espacio}</td>
                <td>${data.Comentario}</td>
            `;
            reservasTableBody.appendChild(row);
        });
    } else {
        console.log("ID del socio no disponible para cargar las reservas");
    }
}

formularioReserva.addEventListener('submit', async function(event) {
    event.preventDefault();
    const idSocio = sessionStorage.getItem('socioId');
    const espacio = document.getElementById('espacioReserva').value;
    const fechaReservacion = new Date(document.getElementById('fechaReserva').value);

    if (!idSocio) {
        console.error("No se pudo recuperar el ID del socio");
        messageDiv.textContent = "Error al enviar la reserva: No se pudo recuperar el ID del socio";
        messageDiv.style.color = "red";
        return;
    }

    try {
        await addDoc(collection(db, "Coleccion_Reservacion"), {
            Id_Socio: idSocio,
            Espacio: espacio,
            Fecha_Reservacion: fechaReservacion,
            Fecha_Hora_Solicitud: serverTimestamp(),
            Comentario: "",
            Estatus: "Pendiente",
        });
        messageDiv.textContent = "Tu reserva fue enviada exitosamente.";
        cargarReservas(); // Recargar la lista de reservas para ver la nueva añadida

        setTimeout(function() {
            messageDiv.textContent = "";
        }, 5000);
    } catch (error) {
        console.error("Error al enviar la reserva: ", error);
        messageDiv.textContent = "Error al enviar la reserva.";
        messageDiv.style.color = "red";
    }
});
