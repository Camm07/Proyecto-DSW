document.addEventListener('DOMContentLoaded', function() {
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('main-content');
    
    
    

    window.addEventListener('load', function() {
        // Comenzar a desvanecer el preloader
        preloader.style.opacity = 0;

        // Esperar a que termine la transición de opacidad y mostrar el contenido principal
        setTimeout(function() {
            preloader.style.display = 'none';
            mainContent.style.display = 'block';
        }, 3000); // Duración del desvanecimiento en milisegundos
    });

   // Función para abrir el menú lateral
    function openNav() {
        document.getElementById("mySidenav").style.width = "250px";
    }

    // Función para cerrar el menú lateral
    function closeNav() {
        document.getElementById("mySidenav").style.width = "0";
    }

    // Vinculación del botón de abrir menú con la función openNav
    document.getElementById('openMenuBtn').addEventListener('click', openNav);

    // Vinculación del botón de cerrar menú con la función closeNav
    document.querySelector('.sidenav .closebtn').addEventListener('click', closeNav);



});

