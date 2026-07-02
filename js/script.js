// Simple navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');

    // Smooth scroll for navigation links
    function smoothScroll(e) {
        const targetId = this.getAttribute('href');
        
        // Only prevent default for hash-only links (same page navigation)
        if (targetId.startsWith('#')) {
            e.preventDefault();
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
            
            // Update active nav link
            navLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');
        }
        // For cross-page links (like index.html#section), allow default navigation
    }

    // Add click event to all navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', smoothScroll);
    });

    // Update active nav link on scroll
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active class from all nav links
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to current section's nav link
                const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }

    // Handle scroll events
    window.addEventListener('scroll', updateActiveNavLink);

    // Handle hash navigation on page load (for cross-page navigation)
    function handleHashNavigation() {
        const hash = window.location.hash;
        if (hash) {
            const targetSection = document.querySelector(hash);
            if (targetSection) {
                // Small delay to ensure page is fully loaded
                setTimeout(() => {
                    targetSection.scrollIntoView({
                        behavior: 'smooth'
                    });
                    
                    // Update active nav link
                    navLinks.forEach(link => link.classList.remove('active'));
                    const activeLink = document.querySelector(`.nav-link[href="${hash}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }, 100);
            }
        }
    }

    // Handle hash navigation on page load
    handleHashNavigation();
    
    // Initial call to set active nav link
    updateActiveNavLink();

}); 
