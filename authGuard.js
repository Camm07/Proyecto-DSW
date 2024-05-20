// authGuard.js
import { auth } from './app.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

onAuthStateChanged(auth, user => {
    if (!user) {
        // Si no hay usuario logueado, redirige a la página de login
        window.location.href = 'index.html'; // Asegúrate de ajustar la ruta al archivo de login si es necesario.
    }
});

