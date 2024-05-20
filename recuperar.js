//recuperar.js
import { getAuth, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

document.addEventListener('DOMContentLoaded', function() {
    const forgotPasswordButton = document.getElementById('forgotPassword');
    const modal = document.getElementById('passwordResetModal');
    const closeBtn = document.querySelector('.close');
    const passwordResetForm = document.getElementById('passwordResetForm');

    if (forgotPasswordButton) {
        forgotPasswordButton.addEventListener('click', function() {
            modal.style.display = 'block';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    if (passwordResetForm) {
        passwordResetForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const emailAddress = document.getElementById('resetEmail').value;
            if (emailAddress) {
                const auth = getAuth();
                sendPasswordResetEmail(auth, emailAddress)
                    .then(() => {
                        alert('Correo de recuperación enviado. Revisa tu correo para restablecer tu contraseña.');
                        modal.style.display = 'none';
                        document.getElementById('resetEmail').value = ''; // Limpiar el campo
                    })
                    .catch((error) => {
                        alert('Error al enviar el correo de recuperación: ' + error.message);
                        console.error('Error al enviar el correo de recuperación:', error);
                    });
            } else {
                alert('Por favor, ingresa tu correo electrónico.');
            }
        });
    }
});


