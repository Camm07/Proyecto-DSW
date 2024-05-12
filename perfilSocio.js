import { db } from './app.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', async function() {
    const idSocio = sessionStorage.getItem('socioId');
    if (idSocio) {
        const socioRef = doc(db, "Socios", idSocio);
        const socioDoc = await getDoc(socioRef);
        if (socioDoc.exists()) {
            const socioData = socioDoc.data();
            const infoDiv = document.getElementById('infoSocio');
            infoDiv.innerHTML = `
                <p>Nombre: ${socioData.nombre} ${socioData.apellidos}</p>
                <p>Email: ${socioData.correo}</p>
                <p>TEL: ${socioData.telefono}</p>
                <p>CURP: ${socioData.curp}</p>
            `;
        } else {
            console.log("No se encontró el socio");
        }
    } else {
        console.log("ID del socio no encontrado en sessionStorage");
    }
});
