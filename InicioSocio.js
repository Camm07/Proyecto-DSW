function toggleMenu() {
    var menu = document.getElementById('side-menu');
    var overlay = document.querySelector('.overlay');
    if (menu.style.right === '0px') {
        menu.style.right = '-300px'; // Esconde el menú
        overlay.style.display = 'none'; // Esconde el overlay
    } else {
        menu.style.right = '0px'; // Muestra el menú
        overlay.style.display = 'block'; // Muestra el overlay
    }
}

function cerrarSesion() {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
        window.location.href = 'index.html';
    }
}

window.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.menu a').forEach(link => {
        link.addEventListener('click', toggleMenu); // Añade cerrar menú al hacer clic en un enlace
    });
});
