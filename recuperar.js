import { getAuth, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

document.addEventListener('DOMContentLoaded', function() {
    const forgotPasswordButton = document.getElementById('forgotPassword');
    const modal = document.getElementById('passwordResetModal');
    const closeBtn = document.querySelector('.close');
    const passwordResetForm = document.getElementById('passwordResetForm');
    const errorMessage = document.getElementById('error-message');

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
                        // Reemplazo del alert por showMessageModal
                        showMessageModal('Correo de recuperación enviado. Revisa tu correo para restablecer tu contraseña.');
                        modal.style.display = 'none';
                        document.getElementById('resetEmail').value = ''; // Limpiar el campo
                        errorMessage.style.display = 'none'; // Ocultar el mensaje de error
                    })
                    .catch((error) => {
                        errorMessage.textContent = 'Error al enviar el correo de recuperación: ' + error.message;
                        errorMessage.style.display = 'block';
                        console.error('Error al enviar el correo de recuperación:', error);
                    });
            } else {
                errorMessage.textContent = 'Por favor, ingresa tu correo electrónico.';
                errorMessage.style.display = 'block';
            }
        });
    }
});

function showMessageModal(message) {
    const modalBody = document.getElementById('messageModalBody');
    modalBody.textContent = message;
    const modalElement = document.getElementById('messageModal');
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
}

