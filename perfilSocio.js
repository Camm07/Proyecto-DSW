// perfilSocio.js
import { db } from './app.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

document.addEventListener('DOMContentLoaded', function() {
    console.log("Session Storage Key Check:", sessionStorage.getItem('socioDocId')); // Diagnóstico

    const socioDocId = sessionStorage.getItem('socioDocId');
    if (socioDocId) {
        console.log("Attempting to fetch document with ID:", socioDocId); // Diagnóstico
        const socioDocRef = doc(db, "Socios", socioDocId);
        getDoc(socioDocRef).then((docSnap) => {
            if (docSnap.exists()) {
                const socioData = docSnap.data();
                console.log("Socio Data Loaded:", socioData); // Diagnóstico
                document.getElementById('codigo').value = socioDocId;
                document.getElementById('usuario').value = `${socioData.nombre} ${socioData.apellidos}`;
                document.getElementById('email').value = socioData.correo;
                document.getElementById('tel').value = socioData.telefono;
            } else {
                console.error("No socio found with provided ID");
            }
        });
    } else {
        console.error("No Document ID Found in sessionStorage");
    }
});

