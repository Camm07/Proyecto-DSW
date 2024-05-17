// app.js

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

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

export { db, auth };

async function handleLogin(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Primero verifica si el usuario es un administrador
        const userRef = doc(db, "Usuario", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().tipo === "administrador") {
            window.location.href = 'inicioAdmin.html';
        } else {
            // Si no es administrador, verifica si es un socio usando el UID
            const socioRef = query(collection(db, "Socios"), where("uid", "==", user.uid));
            const socioSnap = await getDocs(socioRef);
            if (!socioSnap.empty) {
                const socioDoc = socioSnap.docs[0];
                sessionStorage.setItem('socioDocId', socioDoc.id);  // Almacena el ID del documento para uso posterior
                window.location.href = 'inicioSocio.html';
            } else {
                throw new Error("Datos del socio no encontrados en Firestore.");
            }
        }
    } catch (error) {
        console.error('Error durante el inicio de sesión:', error);
        alert("Error de autenticación: " + error.message);
    }
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

