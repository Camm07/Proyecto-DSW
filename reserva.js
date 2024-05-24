// reserva.js
import { db } from './app.js';
import {
    collection, addDoc, serverTimestamp, getDoc, doc, getDocs, query, where
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

const formularioReserva = document.getElementById('formularioReserva');
const messageDiv = document.querySelector('.message');
const reservasTableBody = document.querySelector('#reservasTable tbody');

document.addEventListener('DOMContentLoaded', function() {
    const idSocio = sessionStorage.getItem('socioDocId');

    if (idSocio) {
        document.getElementById('idSocio').value = idSocio;      
        cargarReservas(idSocio);
    } else {
        console.log("ID del socio no encontrado en sessionStorage");
    }
});

async function cargarReservas(idSocio) {
    reservasTableBody.innerHTML = ''; // Limpiar la tabla antes de cargar las reservas
    const q = query(collection(db, "Coleccion_Reservacion"), where("Id_Socio", "==", idSocio));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((reserva) => {
        const data = reserva.data();
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${data.Fecha_Reservacion}</td>
            <td>${data.Fecha_Hora_Solicitud.toDate().toLocaleString()}</td>
            <td>${data.Estatus}</td>
            <td>${reserva.id}</td>
            <td>${data.Espacio}</td>
            <td>${data.Comentario}</td>
        `;
        reservasTableBody.appendChild(row);
    });
}

const fechaActual = new Date();
fechaActual.setDate(fechaActual.getDate()); 
const fechaMinima = fechaActual.toISOString().split('T')[0];
document.getElementById('fechaReserva').setAttribute('min', fechaMinima); // Establecer la fecha mínima

formularioReserva.addEventListener('submit', async function(event) {
    event.preventDefault();
    const idSocio = sessionStorage.getItem('socioDocId');
    const espacio = document.getElementById('espacioReserva').value;
    const fechaIn = document.getElementById('fechaReserva').value;

    if (!idSocio) {
        console.error("No se pudo recuperar el ID del socio");
        messageDiv.textContent = "Error al enviar la reserva: No se pudo recuperar el ID, el correo o el nombre del socio";
        messageDiv.style.color = "red";
        return;
    }
    // Obtener los datos del socio desde Firestore
    const socioRef = doc(db, "Socios", idSocio);
    const socioDoc = await getDoc(socioRef);
    if (!socioDoc.exists()) {
        throw new Error("Socio no encontrado");
    }
    const socioData = socioDoc.data();
    const correoSocio = socioData.correo;
    const nombreSocio = socioData.nombre;
    const contraseña = socioData.contraseña;
    try{
        await addDoc(collection(db, "Coleccion_Reservacion"), {
            Id_Socio: idSocio,
            Espacio: espacio,
            Fecha_Reservacion: fechaIn,
            Fecha_Hora_Solicitud: serverTimestamp(),
            Comentario: "",
            Estatus: "Pendiente",
        });
        messageDiv.textContent = "Tu reserva fue enviada exitosamente.";
        cargarReservas(idSocio); // Recargar la lista de reservas para ver la nueva añadida

        setTimeout(function() {
            messageDiv.textContent = "";
        }, 5000);
    
    } catch (error) {
        console.error("Error al enviar la reserva: ", error);
        messageDiv.textContent = "Error al enviar la reserva.";
        messageDiv.style.color = "red";
    }
});


