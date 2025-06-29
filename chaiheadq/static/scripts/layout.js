// Add smooth scrolling
document.documentElement.style.scrollBehavior = 'smooth';

// Add loading animation
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease-in-out';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Add click ripple effect to buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        // Skip ripple for certain buttons
        if (this.classList.contains('btn-search') || this.classList.contains('fab-create')) {
            return;
        }
        
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.5)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.pointerEvents = 'none';
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Enhanced Create Say button interactions
const createSayButtons = document.querySelectorAll('.btn-create-say, .fab-create');

createSayButtons.forEach(button => {
    // Add magnetic effect for desktop
    if (window.innerWidth > 768) {
        button.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            this.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    }
    
    // Add click animation
    button.addEventListener('click', function(e) {
        // Create expanding ring effect
        const ring = document.createElement('div');
        const rect = this.getBoundingClientRect();
        
        ring.style.position = 'absolute';
        ring.style.left = (e.clientX - rect.left) + 'px';
        ring.style.top = (e.clientY - rect.top) + 'px';
        ring.style.width = '0px';
        ring.style.height = '0px';
        ring.style.borderRadius = '50%';
        ring.style.border = '2px solid rgba(255, 255, 255, 0.8)';
        ring.style.transform = 'translate(-50%, -50%)';
        ring.style.animation = 'expandRing 0.6s ease-out forwards';
        ring.style.pointerEvents = 'none';
        ring.style.zIndex = '10';
        
        this.appendChild(ring);
        
        setTimeout(() => {
            ring.remove();
        }, 600);
        
        // Add button press effect
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    });
});

// Floating button scroll behavior
let lastScrollTop = 0;
const fabButton = document.querySelector('.fab-create');

if (fabButton) {
    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down - hide button
            fabButton.style.transform = 'translateY(100px) scale(0.8)';
            fabButton.style.opacity = '0.7';
        } else {
            // Scrolling up - show button
            fabButton.style.transform = 'translateY(0) scale(1)';
            fabButton.style.opacity = '1';
        }
        
        lastScrollTop = scrollTop;
    });
}

// Add parallax effect to page header
const pageHeader = document.querySelector('.page-header');
if (pageHeader) {
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        pageHeader.style.transform = `translateY(${rate}px)`;
    });
}

// Add dynamic gradient animation to create buttons
function animateGradient() {
    const createButtons = document.querySelectorAll('.btn-create-say, .fab-create');
    createButtons.forEach(button => {
        const hue = (Date.now() / 50) % 360;
        const gradient = `linear-gradient(135deg, 
            hsl(${hue}, 70%, 60%) 0%, 
            hsl(${(hue + 60) % 360}, 70%, 60%) 50%, 
            hsl(${(hue + 120) % 360}, 70%, 60%) 100%)`;
        
        if (!button.matches(':hover')) {
            button.style.backgroundImage = gradient;
        }
    });
}

// Start gradient animation
setInterval(animateGradient, 100);

// Search button enhancement
const searchButton = document.querySelector('.btn-search');
if (searchButton) {
    searchButton.addEventListener('click', function(e) {
        // Add search pulse effect
        this.style.animation = 'searchPulse 0.6s ease';
        setTimeout(() => {
            this.style.animation = '';
        }, 600);
    });
}

// Profile button enhancement
const profileButton = document.querySelector('.btn-profile');
if (profileButton) {
    profileButton.addEventListener('mouseenter', function() {
        const img = this.querySelector('img, div');
        if (img) {
            img.style.transform = 'scale(1.1) rotate(5deg)';
        }
    });
    
    profileButton.addEventListener('mouseleave', function() {
        const img = this.querySelector('img, div');
        if (img) {
            img.style.transform = '';
        }
    });
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes expandRing {
        to {
            width: 100px;
            height: 100px;
            opacity: 0;
        }
    }
    
    @keyframes searchPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); box-shadow: 0 0 20px rgba(102, 126, 234, 0.6); }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.btn-create-say, .page-title').forEach(el => {
    observer.observe(el);
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + N to create new say
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        const createButton = document.querySelector('.btn-create-say, .fab-create');
        if (createButton) {
            createButton.click();
        }
    }
    
    // Ctrl/Cmd + / to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        const searchButton = document.querySelector('.btn-search');
        if (searchButton) {
            searchButton.click();
        }
    }
});

// Touch gesture support for mobile
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', function(e) {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > swipeThreshold) {
        const fabButton = document.querySelector('.fab-create');
        if (fabButton) {
            if (diff > 0) {
                // Swipe up - show create button prominently
                fabButton.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    fabButton.style.transform = '';
                }, 300);
            }
        }
    }
}

console.log('🎉 Say App Layout Scripts Loaded Successfully!');