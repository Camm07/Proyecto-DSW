// app.js

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

const firebaseConfig = {
    apiKey: "AIzaSyArixMEtwWSmPkyL0hQeM9oJlOx8M-EYQw",
    authDomain: "proyecto-club-c2df1.firebaseapp.com",
    projectId: "proyecto-club-c2df1",
    storageBucket: "proyecto-club-c2df1.appspot.com",
    messagingSenderId: "23892425861",
    appId: "1:23892425861:web:90365701ddf91f255a3dec",
    measurementId: "G-P6JKL0L88M"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };

async function handleLogin(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Verifica si el usuario es un administrador
        const userRef = doc(db, "Usuario", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().tipo === "administrador") {
            sessionStorage.setItem('userName', userSnap.data().correo); // Almacena el nombre del administrador
            window.location.href = 'inicioAdmin.html';
        } else {
            // Si no es administrador, verifica si es un socio
            const socioRef = query(collection(db, "Socios"), where("uid", "==", user.uid));
            const socioSnap = await getDocs(socioRef);
            if (!socioSnap.empty) {
                const socioDoc = socioSnap.docs[0];
                const socioData = socioDoc.data();
                if (socioData.status === "Activo") {
                    sessionStorage.setItem('userName', socioData.nombre);
                    document.getElementById('profileImage', socioData.id);
                    sessionStorage.setItem('socioDocId', socioDoc.id);  // Almacena el ID del documento para uso posterior
                    window.location.href = 'inicioSocio.html';
                } else {
                    showMessageModal("Tu cuenta está inactiva. Por favor, contacta al administrador para más información.");
                    auth.signOut(); // Opcional: Desconecta al usuario
                }
            } else {
                showMessageModal("Datos del socio no encontrados en Firestore.");
            }
        }
    } catch (error) {
        console.error('Error durante el inicio de sesión:', error);
        showMessageModal("Error de autenticación: " + error.message);
    }
}

function showMessageModal(message) {
    const modalBody = document.getElementById('messageModalBody');
    modalBody.textContent = message;

    // Usando la API de Bootstrap 5 para mostrar el modal
    const modalElement = document.getElementById('messageModal');
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
}


document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('formularioLogin');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            await handleLogin(email, password);
        });
    } else {
        console.log("El formulario de login no está presente en esta página.");
    }
});
