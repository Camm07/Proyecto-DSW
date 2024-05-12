import { db } from './app.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', async function() {
    const idSocio = sessionStorage.getItem('socioId');
    if (idSocio) {
        const socioRef = doc(db, "Socios", idSocio);
        const socioDoc = await getDoc(socioRef);
        if (socioDoc.exists()) {
            const socioData = socioDoc.data();

            // Actualizando los valores de los inputs con los datos del socio
            document.getElementById('codigo').value = idSocio;  // Usando el ID del documento como código del socio
            document.getElementById('usuario').value = `${socioData.nombre} ${socioData.apellidos}` || 'No disponible';
            document.getElementById('email').value = socioData.correo || 'No disponible';
            document.getElementById('tel').value = socioData.telefono || 'No disponible';

            // Si necesitas mostrar más información, simplemente añade más campos y actualízalos aquí
        } else {
            console.log("No se encontró el socio");
        }
    } else {
        console.log("ID del socio no encontrado en sessionStorage");
    }
});
