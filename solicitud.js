// solicitud.js
import { db } from './app.js';
import { collection, addDoc, serverTimestamp, getDocs, query, where, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';


const formulario = document.getElementById('formularioSolicitud');
const messageDiv = document.querySelector('.message');
const solicitudesTableBody = document.querySelector('#solicitudesTable tbody');

document.addEventListener('DOMContentLoaded', function() {
    const idDocumentoSocio = sessionStorage.getItem('socioDocId');
    if (idDocumentoSocio) {
        document.getElementById('idSocio').value = idDocumentoSocio;
        loadSolicitudes(idDocumentoSocio);
    } else {
        console.error("ID del documento del socio no encontrado en sessionStorage");
    }
});

async function loadSolicitudes(idDocumentoSocio) {
    solicitudesTableBody.innerHTML = '';
    const q = query(collection(db, "Coleccion_Solicitud"), where("Id_Socio", "==", idDocumentoSocio));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${data.Fecha_Hora_Atendida.toDate().toLocaleString()}</td>
            <td>${data.Estatus}</td>
            <td>${doc.id}</td>
            <td>${data.Descripcion}</td>
            <td>${data.Comentario}</td>
        `;
        solicitudesTableBody.appendChild(row);
    });
}

formulario.addEventListener('submit', async function(event) {
    event.preventDefault();
    const descripcion = document.getElementById('descripcionSolicitud').value;
    const idDocumentoSocio = sessionStorage.getItem('socioDocId');

    if (!idDocumentoSocio) {
        console.error("No se pudo recuperar el ID del documento del socio");
        messageDiv.textContent = "Error al enviar la solicitud: No se pudo recuperar el ID del documento del socio";
        messageDiv.style.color = "red";
        return;
    }

// Obtener los datos del socio desde Firestore
const socioRef = doc(db, "Socios", idDocumentoSocio);
const socioDoc = await getDoc(socioRef);
if (!socioDoc.exists()) {
    throw new Error("Socio no encontrado");
}
const socioData = socioDoc.data();
const correoSocio = socioData.correo;
const nombreSocio = socioData.nombre;
const telefono = socioData.telefono;

    try {
        await addDoc(collection(db, "Coleccion_Solicitud"), {
            Id_Socio: idDocumentoSocio,
            Descripcion: descripcion,
            Estatus: "Pendiente",
            Comentario: "",
            Fecha_Hora_Atendida: serverTimestamp(),
        });

        const response = await fetch('http://localhost:3000/correo-soli', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: nombreSocio,
                email: correoSocio,
                comentario: descripcion,
                telefono: telefono
            })
        });

        if (!response.ok) {
            console.error('Error al enviar el correo de notificación:', response.statusText);
        } else {
            console.log('Correo de notificación enviado con éxito');
        }
        messageDiv.textContent = "Tu solicitud fue enviada exitosamente.";
        loadSolicitudes(idDocumentoSocio);  // Recargar la lista de solicitudes
        
        setTimeout(() => {
            messageDiv.textContent = "";
        }, 5000);
    } catch (error) {
        console.error("Error al enviar la solicitud: ", error);
        messageDiv.textContent = "Error al enviar la solicitud.";
        messageDiv.style.color = "red";
    }
});
