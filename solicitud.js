import { db } from './app.js';
import { collection, addDoc, serverTimestamp, getDoc, doc, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

const formulario = document.getElementById('formularioSolicitud');
const messageDiv = document.querySelector('.message');
const solicitudesTable = document.querySelector('#solicitudesTable tbody');

document.addEventListener('DOMContentLoaded', async function() {
    const idSocio = sessionStorage.getItem('socioId'); // Asegúrate de que el ID del socio se establezca correctamente en el inicio de sesión
    if (idSocio) {
        document.getElementById('idSocio').value = idSocio;
        loadSolicitudes();
    } else {
        console.log("ID del socio no encontrado en sessionStorage");
    }
});

async function loadSolicitudes() {
    const solicitudesRef = collection(db, "Coleccion_Solicitud");
    const querySnapshot = await getDocs(solicitudesRef);
    querySnapshot.forEach(async (solicitud) => {
        const data = solicitud.data();
        if (data.Id_Socio) {
            const socioRef = doc(db, "Socios", data.Id_Socio);
            const socioDoc = await getDoc(socioRef);
            if (socioDoc.exists()) {
                const socioData = socioDoc.data();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${data.Fecha_Hora_Atendida.toDate().toLocaleString()}</td>
                    <td>${data.Estatus}</td>
                    <td>${solicitud.id}</td>
                    <td>${data.Descripcion}</td>
                    <td>${socioData.nombre} ${socioData.apellidos}</td>
                `;
                solicitudesTable.appendChild(row);
            } else {
                console.log("No se encontró el socio con ID:", data.Id_Socio);
            }
        } else {
            console.log("ID del socio no está definido en la solicitud:", solicitud.id);
        }
    });
}

formulario.addEventListener('submit', async function(event) {
    event.preventDefault();
    const idSocio = sessionStorage.getItem('socioId'); // Recupera el ID del socio almacenado
    const descripcion = document.getElementById('descripcionSolicitud').value;

    try {
        await addDoc(collection(db, "Coleccion_Solicitud"), {
            Id_Socio: idSocio,
            Descripcion: descripcion,
            Estatus: "Pendiente",
            Fecha_Hora_Atendida: serverTimestamp(),
        });
        messageDiv.textContent = "Tu solicitud fue enviada exitosamente.";
        loadSolicitudes(); // Recargar la lista de solicitudes.
    } catch (error) {
        console.error("Error al enviar la solicitud: ", error);
        messageDiv.textContent = "Error al enviar la solicitud.";
        messageDiv.style.color = "red";
    }
});


