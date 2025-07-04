// Particle System for Interactive Background
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 50;
        this.container = document.getElementById('particles-container');
        this.mouse = { x: 0, y: 0 };
        this.init();
    }

    init() {
        this.createParticles();
        this.bindEvents();
        this.animate();
    }

    createParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 4 + 2;
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const speedX = (Math.random() - 0.5) * 0.5;
        const speedY = (Math.random() - 0.5) * 0.5;
        const opacity = Math.random() * 0.5 + 0.2;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, rgba(102, 126, 234, ${opacity}) 0%, rgba(118, 75, 162, ${opacity * 0.5}) 100%);
            border-radius: 50%;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            transition: all 0.3s ease;
        `;

        this.container.appendChild(particle);

        return {
            element: particle,
            x: x,
            y: y,
            speedX: speedX,
            speedY: speedY,
            size: size,
            opacity: opacity,
            baseOpacity: opacity,
            originalSpeedX: speedX,
            originalSpeedY: speedY
        };
    }

    bindEvents() {
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Add scroll effect
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });
    }

    handleResize() {
        this.particles.forEach(particle => {
            if (particle.x > window.innerWidth) {
                particle.x = window.innerWidth - 10;
            }
            if (particle.y > window.innerHeight) {
                particle.y = window.innerHeight - 10;
            }
        });
    }

    handleScroll() {
        const scrollY = window.pageYOffset;
        const scrollSpeed = scrollY * 0.5;
        
        this.particles.forEach((particle, index) => {
            const offset = (index % 2 === 0 ? 1 : -1) * scrollSpeed * 0.02;
            particle.speedX = particle.originalSpeedX + offset;
        });
    }

    animate() {
        this.particles.forEach(particle => {
            this.updateParticle(particle);
            this.handleMouseInteraction(particle);
        });

        requestAnimationFrame(() => this.animate());
    }

    updateParticle(particle) {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Boundary checking with wrapping
        if (particle.x < -10) {
            particle.x = window.innerWidth + 10;
        } else if (particle.x > window.innerWidth + 10) {
            particle.x = -10;
        }

        if (particle.y < -10) {
            particle.y = window.innerHeight + 10;
        } else if (particle.y > window.innerHeight + 10) {
            particle.y = -10;
        }

        // Apply position
        particle.element.style.left = particle.x + 'px';
        particle.element.style.top = particle.y + 'px';

        // Add subtle floating animation
        const time = Date.now() * 0.001;
        const floatOffset = Math.sin(time + particle.x * 0.01) * 2;
        particle.element.style.transform = `translateY(${floatOffset}px)`;
    }

    handleMouseInteraction(particle) {
        const dx = this.mouse.x - particle.x;
        const dy = this.mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 100;

        if (distance < maxDistance) {
            // Repel particles from mouse
            const force = (maxDistance - distance) / maxDistance;
            const repelStrength = 2;
            
            particle.speedX -= (dx / distance) * force * repelStrength;
            particle.speedY -= (dy / distance) * force * repelStrength;

            // Increase opacity and size near mouse
            const newOpacity = particle.baseOpacity + (force * 0.5);
            const newSize = particle.size + (force * 3);
            
            particle.element.style.opacity = newOpacity;
            particle.element.style.width = newSize + 'px';
            particle.element.style.height = newSize + 'px';
            
            // Add glow effect
            particle.element.style.boxShadow = `0 0 ${force * 20}px rgba(102, 126, 234, ${force * 0.5})`;
        } else {
            // Gradually return to normal
            particle.speedX *= 0.99;
            particle.speedY *= 0.99;
            particle.element.style.opacity = particle.baseOpacity;
            particle.element.style.width = particle.size + 'px';
            particle.element.style.height = particle.size + 'px';
            particle.element.style.boxShadow = 'none';
        }

        // Keep speed within reasonable bounds
        const maxSpeed = 2;
        particle.speedX = Math.max(-maxSpeed, Math.min(maxSpeed, particle.speedX));
        particle.speedY = Math.max(-maxSpeed, Math.min(maxSpeed, particle.speedY));
    }

    // Public methods for external control
    addParticle() {
        if (this.particles.length < this.maxParticles * 2) {
            this.particles.push(this.createParticle());
        }
    }

    removeParticle() {
        if (this.particles.length > 10) {
            const particle = this.particles.pop();
            particle.element.remove();
        }
    }

    updateParticleCount(count) {
        const currentCount = this.particles.length;
        
        if (count > currentCount) {
            for (let i = currentCount; i < count; i++) {
                this.particles.push(this.createParticle());
            }
        } else if (count < currentCount) {
            for (let i = currentCount - 1; i >= count; i--) {
                this.particles[i].element.remove();
                this.particles.splice(i, 1);
            }
        }
    }
}

// Connection lines between particles
class ParticleConnections {
    constructor(particleSystem) {
        this.particleSystem = particleSystem;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.animate();
    }

    setupCanvas() {
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        `;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        document.body.appendChild(this.canvas);

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawConnections();
        requestAnimationFrame(() => this.animate());
    }

    drawConnections() {
        const particles = this.particleSystem.particles;
        const maxDistance = 120;

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    const opacity = (maxDistance - distance) / maxDistance * 0.2;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(particles[i].x, particles[i].y);
                    this.ctx.lineTo(particles[j].x, particles[j].y);
                    this.ctx.strokeStyle = `rgba(102, 126, 234, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }
    }
}

// Interactive particle effects
class InteractiveEffects {
    constructor() {
        this.effects = [];
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Click effect
        document.addEventListener('click', (e) => {
            this.createClickEffect(e.clientX, e.clientY);
        });

        // Scroll effect
        window.addEventListener('scroll', () => {
            this.createScrollEffect();
        });
    }

    createClickEffect(x, y) {
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 10px;
            height: 10px;
            border: 2px solid rgba(102, 126, 234, 0.7);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            animation: ripple 0.6s linear;
        `;

        document.body.appendChild(effect);

        setTimeout(() => {
            effect.remove();
        }, 600);
    }

    createScrollEffect() {
        if (Math.random() < 0.1) { // 10% chance per scroll
            const x = Math.random() * window.innerWidth;
            const y = window.innerHeight;
            
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: 3px;
                height: 3px;
                background: rgba(102, 126, 234, 0.5);
                border-radius: 50%;
                pointer-events: none;
                z-index: -1;
                animation: floatUp 3s linear;
            `;

            document.body.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 3000);
        }
    }
}

// Add CSS animations
const particleStyles = document.createElement('style');
particleStyles.textContent = `
    @keyframes ripple {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(20);
            opacity: 0;
        }
    }
    
    @keyframes floatUp {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(particleStyles);

// Initialize particle system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const particleSystem = new ParticleSystem();
    const connections = new ParticleConnections(particleSystem);
    const effects = new InteractiveEffects();
    
    // Make particle system globally accessible
    window.particleSystem = particleSystem;
    
    // Performance optimization: reduce particles on mobile
    if (window.innerWidth < 768) {
        particleSystem.updateParticleCount(25);
    }
});
