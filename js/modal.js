document.addEventListener('DOMContentLoaded', function() {
    var images = document.querySelectorAll('.vanguard-images img');
    var modal = document.getElementById('newsModal');
    var span = document.getElementsByClassName("close")[0];
    var title = document.getElementById('modalTitle');
    var description = document.getElementById('modalDescription');

    images.forEach(image => {
        image.addEventListener('click', function() {
            modal.style.display = "block";
            title.textContent = this.getAttribute('data-title');
            description.textContent = this.getAttribute('data-desc');
        });
    });

    span.addEventListener('click', function() {
        modal.style.display = "none";
    });

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });

    const buttons = document.querySelectorAll('.plan-button');

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const info = this.nextElementSibling; // Selecciona el div.plan-info siguiente al botón
            if (info.style.display === "none" || info.style.display === "") {
                info.style.display = "block";
            } else {
                info.style.display = "none";
            }
        });
    });
});
