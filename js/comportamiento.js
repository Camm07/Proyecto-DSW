document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('custom-container');
    const triggerSection = document.getElementById('trigger-section');

    window.addEventListener('scroll', function() {
        let triggerRect = triggerSection.getBoundingClientRect();

        if (triggerRect.top < window.innerHeight && triggerRect.bottom >= 0) {
            // La sección gatillo está completamente visible
            container.classList.add('show-container');
        } else {
            // La sección gatillo no está visible
            container.classList.remove('show-container');
        }
    });
});
