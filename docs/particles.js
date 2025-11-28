/**
 * API PARTICLE SYSTEM
 * Each particle represents a single API data stream with its own personality
 * The particles float around and display their data when hovered
 */

class APIParticleSystem {
    constructor() {
        this.particles = [];
        this.container = null;
        this.state = null;
        this.animationFrame = null;
        this.isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Define the 20 API data streams with their visual personalities
        this.apiDefinitions = [
            // 🌍 THE SENSES (World Input)
            { id: 'weather', name: 'Weather', icon: '🌤️', category: 'senses', color: '#4FC3F7', shape: 'cloud' },
            { id: 'crypto-btc', name: 'Bitcoin', icon: '₿', category: 'senses', color: '#F7931A', shape: 'coin' },
            { id: 'crypto-eth', name: 'Ethereum', icon: 'Ξ', category: 'senses', color: '#627EEA', shape: 'diamond' },
            { id: 'crypto-doge', name: 'Dogecoin', icon: '🐕', category: 'senses', color: '#C2A633', shape: 'circle' },
            { id: 'news', name: 'News', icon: '📰', category: 'senses', color: '#FF5722', shape: 'square' },
            { id: 'nasa', name: 'Cosmos', icon: '🌌', category: 'senses', color: '#9C27B0', shape: 'star' },
            { id: 'solar', name: 'Solar', icon: '☀️', category: 'senses', color: '#FFC107', shape: 'sun' },
            { id: 'earthquake', name: 'Seismic', icon: '🌍', category: 'senses', color: '#795548', shape: 'wave' },
            
            // 🗣️ THE VOICE (Communication)
            { id: 'joke', name: 'Humor', icon: '😄', category: 'voice', color: '#E91E63', shape: 'bubble' },
            { id: 'quote', name: 'Wisdom', icon: '💭', category: 'voice', color: '#673AB7', shape: 'scroll' },
            { id: 'advice', name: 'Advice', icon: '🎯', category: 'voice', color: '#00BCD4', shape: 'target' },
            { id: 'word', name: 'Lexicon', icon: '📖', category: 'voice', color: '#3F51B5', shape: 'book' },
            { id: 'number', name: 'Numbers', icon: '🔢', category: 'voice', color: '#009688', shape: 'hex' },
            
            // 🎨 THE CULTURE (Fluff & Fun)
            { id: 'pokemon', name: 'Spirit', icon: '⚡', category: 'culture', color: '#FFEB3B', shape: 'pokeball' },
            { id: 'book', name: 'Library', icon: '📚', category: 'culture', color: '#8BC34A', shape: 'book' },
            { id: 'cocktail', name: 'Mixology', icon: '🍹', category: 'culture', color: '#FF9800', shape: 'glass' },
            { id: 'wayback', name: 'Memory', icon: '⏳', category: 'culture', color: '#607D8B', shape: 'hourglass' },
            { id: 'age', name: 'Identity', icon: '🎭', category: 'culture', color: '#9E9E9E', shape: 'mask' },
            
            // 🧠 THE BRAIN (Intelligence)
            { id: 'robohash', name: 'Avatar', icon: '🤖', category: 'brain', color: '#00E676', shape: 'robot' },
            { id: 'vibe', name: 'Vibe', icon: '✨', category: 'brain', color: '#E040FB', shape: 'sparkle' }
        ];
        
        this.init();
    }

    init() {
        // Skip particles entirely if reduced motion is preferred
        if (this.isReducedMotion) {
            console.log('Reduced motion preferred - skipping particle system');
            return;
        }
        
        // Create container
        this.container = document.createElement('div');
        this.container.id = 'api-particles';
        this.container.innerHTML = `
            <div class="particle-layer"></div>
            <div class="particle-tooltip" id="particle-tooltip"></div>
        `;
        document.body.appendChild(this.container);
        
        // Add styles
        this.addStyles();
        
        // Create particles (fewer on mobile)
        this.createParticles();
        
        // Start animation
        this.animate();
        
        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
        
        // If device type changed, recreate particles with appropriate count
        if (wasMobile !== this.isMobile) {
            this.recreateParticles();
        }
        
        // Keep particles in bounds after resize
        this.particles.forEach(p => {
            p.x = Math.min(p.x, window.innerWidth - 60);
            p.y = Math.min(p.y, window.innerHeight - 60);
        });
    }
    
    recreateParticles() {
        const layer = this.container.querySelector('.particle-layer');
        layer.innerHTML = '';
        this.particles = [];
        this.createParticles();
        if (this.state) {
            this.updateParticleStates(this.state);
        }
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #api-particles {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
                overflow: hidden;
            }
            
            #api-particles .particle-layer {
                width: 100%;
                height: 100%;
                position: relative;
            }
            
            .api-particle {
                position: absolute;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                cursor: pointer;
                pointer-events: auto;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                font-size: 20px;
                text-shadow: 0 0 10px currentColor;
                backdrop-filter: blur(5px);
                border: 2px solid rgba(255,255,255,0.2);
                -webkit-tap-highlight-color: transparent;
                touch-action: manipulation;
            }
            
            .api-particle:hover {
                transform: scale(1.5) !important;
                z-index: 100;
            }
            
            .api-particle.positive {
                animation: particlePulsePositive 2s ease-in-out infinite;
            }
            
            .api-particle.negative {
                animation: particlePulseNegative 2s ease-in-out infinite;
            }
            
            .api-particle.neutral {
                animation: particlePulseNeutral 3s ease-in-out infinite;
            }
            
            .api-particle.excited {
                animation: particleExcited 0.5s ease-in-out infinite;
            }
            
            .api-particle.calm {
                animation: particleCalm 4s ease-in-out infinite;
            }
            
            @keyframes particlePulsePositive {
                0%, 100% { box-shadow: 0 0 10px currentColor, 0 0 20px currentColor; }
                50% { box-shadow: 0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor; }
            }
            
            @keyframes particlePulseNegative {
                0%, 100% { box-shadow: 0 0 5px currentColor; opacity: 0.6; }
                50% { box-shadow: 0 0 15px currentColor; opacity: 0.9; }
            }
            
            @keyframes particlePulseNeutral {
                0%, 100% { box-shadow: 0 0 8px currentColor; }
                50% { box-shadow: 0 0 15px currentColor; }
            }
            
            @keyframes particleExcited {
                0%, 100% { transform: scale(1) rotate(0deg); }
                25% { transform: scale(1.1) rotate(5deg); }
                75% { transform: scale(1.1) rotate(-5deg); }
            }
            
            @keyframes particleCalm {
                0%, 100% { transform: scale(1); opacity: 0.7; }
                50% { transform: scale(1.05); opacity: 0.9; }
            }
            
            .particle-tooltip {
                position: fixed;
                background: rgba(10, 10, 20, 0.95);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 12px;
                padding: 15px 20px;
                color: white;
                font-family: 'Space Mono', monospace;
                font-size: 12px;
                max-width: 300px;
                pointer-events: none;
                opacity: 0;
                transform: translateY(10px);
                transition: opacity 0.3s, transform 0.3s;
                z-index: 1000;
                backdrop-filter: blur(10px);
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            }
            
            .particle-tooltip.visible {
                opacity: 1;
                transform: translateY(0);
            }
            
            .particle-tooltip .tooltip-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
                padding-bottom: 10px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            
            .particle-tooltip .tooltip-icon {
                font-size: 24px;
            }
            
            .particle-tooltip .tooltip-name {
                font-weight: bold;
                font-size: 14px;
            }
            
            .particle-tooltip .tooltip-category {
                font-size: 10px;
                opacity: 0.6;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .particle-tooltip .tooltip-data {
                line-height: 1.6;
            }
            
            .particle-tooltip .tooltip-mood {
                margin-top: 10px;
                padding: 5px 10px;
                border-radius: 20px;
                display: inline-block;
                font-size: 11px;
            }
            
            .particle-trail {
                position: absolute;
                border-radius: 50%;
                pointer-events: none;
                opacity: 0.3;
                transition: opacity 0.5s;
            }
            
            /* Mobile-specific particle styles */
            @media (max-width: 768px) {
                .api-particle {
                    font-size: 16px;
                }
                
                .particle-tooltip {
                    max-width: 250px;
                    padding: 12px 15px;
                    font-size: 11px;
                    left: 50% !important;
                    transform: translateX(-50%) translateY(10px);
                    bottom: 80px;
                    top: auto !important;
                }
                
                .particle-tooltip.visible {
                    transform: translateX(-50%) translateY(0);
                }
                
                .particle-tooltip .tooltip-icon {
                    font-size: 20px;
                }
                
                .particle-tooltip .tooltip-name {
                    font-size: 13px;
                }
            }
            
            @media (max-width: 480px) {
                .api-particle {
                    font-size: 14px;
                }
                
                .particle-tooltip {
                    max-width: 90vw;
                    padding: 10px 12px;
                    font-size: 10px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    createParticles() {
        const layer = this.container.querySelector('.particle-layer');
        
        // On mobile, show fewer particles for better performance
        const particlesToCreate = this.isMobile 
            ? this.apiDefinitions.filter((_, i) => i % 2 === 0) // Show 10 on mobile
            : this.apiDefinitions; // Show all 20 on desktop
        
        particlesToCreate.forEach((api, index) => {
            const particle = document.createElement('div');
            particle.className = 'api-particle neutral';
            particle.id = `particle-${api.id}`;
            particle.dataset.apiId = api.id;
            particle.innerHTML = api.icon;
            particle.style.color = api.color;
            particle.style.backgroundColor = `${api.color}22`;
            
            // Smaller particles on mobile
            const baseSize = this.isMobile ? 35 : 50;
            particle.style.width = `${baseSize}px`;
            particle.style.height = `${baseSize}px`;
            
            // Random starting position
            const startX = Math.random() * (window.innerWidth - 60);
            const startY = Math.random() * (window.innerHeight - 60);
            particle.style.left = `${startX}px`;
            particle.style.top = `${startY}px`;
            
            // Store movement data - slower on mobile
            const speedFactor = this.isMobile ? 0.5 : 1;
            particle.dataset.vx = (Math.random() - 0.5) * 2 * speedFactor;
            particle.dataset.vy = (Math.random() - 0.5) * 2 * speedFactor;
            particle.dataset.baseSpeed = (0.5 + Math.random() * 0.5) * speedFactor;
            
            // Event listeners - touch support for mobile
            if (this.isMobile) {
                particle.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.showTooltip(e, api);
                }, { passive: false });
                particle.addEventListener('touchend', () => {
                    setTimeout(() => this.hideTooltip(), 2000); // Hide after 2s on mobile
                });
            } else {
                particle.addEventListener('mouseenter', (e) => this.showTooltip(e, api));
                particle.addEventListener('mouseleave', () => this.hideTooltip());
            }
            particle.addEventListener('click', () => this.focusParticle(api));
            
            layer.appendChild(particle);
            this.particles.push({ element: particle, api, x: startX, y: startY });
        });
    }

    updateParticleStates(state) {
        this.state = state;
        if (!state) return;
        
        this.particles.forEach(p => {
            const mood = this.getParticleMood(p.api.id, state);
            const element = p.element;
            
            // Remove all mood classes
            element.classList.remove('positive', 'negative', 'neutral', 'excited', 'calm');
            
            // Add appropriate mood class
            element.classList.add(mood.class);
            
            // Update speed based on mood
            const speedMultiplier = mood.energy;
            p.element.dataset.speedMultiplier = speedMultiplier;
            
            // Update size based on importance
            const size = 40 + (mood.importance * 20);
            element.style.width = `${size}px`;
            element.style.height = `${size}px`;
            element.style.fontSize = `${16 + mood.importance * 8}px`;
        });
    }

    getParticleMood(apiId, state) {
        let mood = { class: 'neutral', energy: 1, importance: 0.5, data: 'No data' };
        
        switch(apiId) {
            case 'weather':
                if (state.weather) {
                    const w = state.weather;
                    mood.data = `${w.city}: ${w.temperature}°C, ${w.mood}`;
                    if (w.mood === 'sunny') mood = { ...mood, class: 'positive', energy: 1.2, importance: 0.7 };
                    else if (w.mood === 'stormy') mood = { ...mood, class: 'excited', energy: 2, importance: 0.9 };
                    else if (w.mood === 'rainy') mood = { ...mood, class: 'negative', energy: 0.7, importance: 0.6 };
                    else mood = { ...mood, class: 'calm', energy: 0.8, importance: 0.5 };
                }
                break;
                
            case 'crypto-btc':
                if (state.crypto?.bitcoin) {
                    const change = state.crypto.bitcoin.change24h || 0;
                    mood.data = `$${state.crypto.bitcoin.price?.toLocaleString()} (${change > 0 ? '+' : ''}${change.toFixed(2)}%)`;
                    if (change > 5) mood = { ...mood, class: 'excited', energy: 2.5, importance: 1 };
                    else if (change > 0) mood = { ...mood, class: 'positive', energy: 1.5, importance: 0.8 };
                    else if (change < -5) mood = { ...mood, class: 'excited', energy: 2, importance: 0.9 };
                    else if (change < 0) mood = { ...mood, class: 'negative', energy: 0.8, importance: 0.7 };
                }
                break;
                
            case 'crypto-eth':
                if (state.crypto?.ethereum) {
                    const change = state.crypto.ethereum.change24h || 0;
                    mood.data = `$${state.crypto.ethereum.price?.toLocaleString()} (${change > 0 ? '+' : ''}${change.toFixed(2)}%)`;
                    if (change > 3) mood = { ...mood, class: 'positive', energy: 1.4, importance: 0.7 };
                    else if (change < -3) mood = { ...mood, class: 'negative', energy: 0.7, importance: 0.6 };
                    else mood = { ...mood, class: 'calm', energy: 1, importance: 0.5 };
                }
                break;
                
            case 'crypto-doge':
                if (state.crypto?.dogecoin) {
                    const change = state.crypto.dogecoin.change24h || 0;
                    mood.data = `$${state.crypto.dogecoin.price?.toFixed(4)} (${change > 0 ? '+' : ''}${change.toFixed(2)}%)`;
                    // Doge is always a bit chaotic
                    mood = { ...mood, class: Math.random() > 0.5 ? 'excited' : 'positive', energy: 1.3, importance: 0.4 };
                }
                break;
                
            case 'news':
                if (state.news) {
                    mood.data = `Anxiety: ${state.news.anxietyLevel}/100`;
                    const anxiety = state.news.anxietyLevel;
                    if (anxiety > 70) mood = { ...mood, class: 'excited', energy: 2, importance: 0.9 };
                    else if (anxiety > 50) mood = { ...mood, class: 'negative', energy: 1.2, importance: 0.7 };
                    else mood = { ...mood, class: 'calm', energy: 0.8, importance: 0.5 };
                }
                break;
                
            case 'nasa':
                if (state.nasa) {
                    mood.data = state.nasa.title || 'Cosmic wonder';
                    if (state.nasa.cosmicMood === 'nihilistic') mood = { ...mood, class: 'negative', energy: 0.5, importance: 0.8 };
                    else if (state.nasa.cosmicMood === 'intense') mood = { ...mood, class: 'excited', energy: 1.8, importance: 0.9 };
                    else mood = { ...mood, class: 'calm', energy: 0.6, importance: 0.7 };
                }
                break;
                
            case 'solar':
                if (state.sunriseSunset) {
                    mood.data = `Phase: ${state.sunriseSunset.solarPhase}`;
                    const phase = state.sunriseSunset.solarPhase;
                    if (phase === 'dawn' || phase === 'morning') mood = { ...mood, class: 'positive', energy: 1.3, importance: 0.6 };
                    else if (phase === 'night') mood = { ...mood, class: 'calm', energy: 0.5, importance: 0.4 };
                    else mood = { ...mood, class: 'neutral', energy: 1, importance: 0.5 };
                }
                break;
                
            case 'earthquake':
                if (state.earthquakes) {
                    mood.data = `${state.earthquakes.count} quakes, max ${state.earthquakes.maxMagnitude}M`;
                    if (state.earthquakes.maxMagnitude > 6) mood = { ...mood, class: 'excited', energy: 3, importance: 1 };
                    else if (state.earthquakes.maxMagnitude > 4) mood = { ...mood, class: 'negative', energy: 1.5, importance: 0.7 };
                    else mood = { ...mood, class: 'calm', energy: 0.7, importance: 0.3 };
                }
                break;
                
            case 'joke':
                if (state.joke) {
                    mood.data = state.joke.joke?.substring(0, 50) + '...';
                    mood = { ...mood, class: 'positive', energy: 1.4, importance: 0.5 };
                }
                break;
                
            case 'quote':
                if (state.quote) {
                    mood.data = `"${state.quote.content?.substring(0, 40)}..." - ${state.quote.author}`;
                    mood = { ...mood, class: 'calm', energy: 0.6, importance: 0.6 };
                }
                break;
                
            case 'advice':
                if (state.advice) {
                    mood.data = state.advice.advice?.substring(0, 50) + '...';
                    mood = { ...mood, class: 'neutral', energy: 1, importance: 0.5 };
                }
                break;
                
            case 'word':
                if (state.wordOfDay) {
                    mood.data = `${state.wordOfDay.word}: ${state.wordOfDay.definition?.substring(0, 40)}...`;
                    mood = { ...mood, class: 'calm', energy: 0.7, importance: 0.5 };
                }
                break;
                
            case 'number':
                if (state.numberFact) {
                    mood.data = `${state.numberFact.number}: ${state.numberFact.fact?.substring(0, 40)}...`;
                    mood = { ...mood, class: 'neutral', energy: 1, importance: 0.4 };
                }
                break;
                
            case 'pokemon':
                if (state.pokemon) {
                    mood.data = `${state.pokemon.name} (${state.pokemon.types?.join(', ')})`;
                    mood = { ...mood, class: 'positive', energy: 1.5, importance: 0.6 };
                }
                break;
                
            case 'book':
                if (state.book) {
                    mood.data = `${state.book.title} by ${state.book.author}`;
                    mood = { ...mood, class: 'calm', energy: 0.5, importance: 0.4 };
                }
                break;
                
            case 'cocktail':
                if (state.cocktail) {
                    mood.data = state.cocktail.name;
                    mood = { ...mood, class: 'positive', energy: 1.2, importance: 0.4 };
                }
                break;
                
            case 'wayback':
                if (state.wayback) {
                    mood.data = `${state.wayback.originalSite} memories`;
                    mood = { ...mood, class: 'calm', energy: 0.4, importance: 0.3 };
                }
                break;
                
            case 'age':
                if (state.age) {
                    mood.data = `Age: ${state.age.predictedAge}, ${state.age.maturityLevel}`;
                    mood = { ...mood, class: 'neutral', energy: 0.8, importance: 0.4 };
                }
                break;
                
            case 'robohash':
                mood.data = 'Generating identity...';
                mood = { ...mood, class: 'positive', energy: 1.2, importance: 0.6 };
                break;
                
            case 'vibe':
                if (state.vibeScore !== undefined) {
                    mood.data = `Vibe Score: ${state.vibeScore}/100`;
                    if (state.vibeScore > 70) mood = { ...mood, class: 'excited', energy: 2, importance: 1 };
                    else if (state.vibeScore > 50) mood = { ...mood, class: 'positive', energy: 1.3, importance: 0.8 };
                    else if (state.vibeScore > 30) mood = { ...mood, class: 'neutral', energy: 1, importance: 0.6 };
                    else mood = { ...mood, class: 'negative', energy: 0.6, importance: 0.7 };
                }
                break;
        }
        
        return mood;
    }

    animate() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.particles.forEach(p => {
            const el = p.element;
            const speedMultiplier = parseFloat(el.dataset.speedMultiplier) || 1;
            const baseSpeed = parseFloat(el.dataset.baseSpeed);
            let vx = parseFloat(el.dataset.vx);
            let vy = parseFloat(el.dataset.vy);
            
            // Update position
            p.x += vx * baseSpeed * speedMultiplier;
            p.y += vy * baseSpeed * speedMultiplier;
            
            // Bounce off walls
            if (p.x <= 0 || p.x >= width - 60) {
                vx *= -1;
                el.dataset.vx = vx;
            }
            if (p.y <= 0 || p.y >= height - 60) {
                vy *= -1;
                el.dataset.vy = vy;
            }
            
            // Keep in bounds
            p.x = Math.max(0, Math.min(width - 60, p.x));
            p.y = Math.max(0, Math.min(height - 60, p.y));
            
            // Apply position
            el.style.left = `${p.x}px`;
            el.style.top = `${p.y}px`;
        });
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    showTooltip(event, api) {
        const tooltip = document.getElementById('particle-tooltip');
        const mood = this.state ? this.getParticleMood(api.id, this.state) : { data: 'Loading...', class: 'neutral' };
        
        const categoryLabels = {
            'senses': '🌍 World Input',
            'voice': '🗣️ Communication',
            'culture': '🎨 Culture',
            'brain': '🧠 Intelligence'
        };
        
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <span class="tooltip-icon">${api.icon}</span>
                <div>
                    <div class="tooltip-name" style="color: ${api.color}">${api.name}</div>
                    <div class="tooltip-category">${categoryLabels[api.category]}</div>
                </div>
            </div>
            <div class="tooltip-data">${mood.data}</div>
            <span class="tooltip-mood" style="background: ${api.color}33; color: ${api.color}">
                ${mood.class.toUpperCase()}
            </span>
        `;
        
        // Position tooltip
        const rect = event.target.getBoundingClientRect();
        let left = rect.right + 10;
        let top = rect.top;
        
        // Keep tooltip in viewport
        if (left + 300 > window.innerWidth) {
            left = rect.left - 310;
        }
        if (top + 150 > window.innerHeight) {
            top = window.innerHeight - 160;
        }
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.classList.add('visible');
    }

    hideTooltip() {
        const tooltip = document.getElementById('particle-tooltip');
        tooltip.classList.remove('visible');
    }

    focusParticle(api) {
        // Bring particle to center briefly
        const particle = this.particles.find(p => p.api.id === api.id);
        if (particle) {
            particle.x = window.innerWidth / 2 - 30;
            particle.y = window.innerHeight / 2 - 30;
            
            // Flash effect
            particle.element.style.transform = 'scale(2)';
            setTimeout(() => {
                particle.element.style.transform = '';
            }, 500);
        }
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.container) {
            this.container.remove();
        }
    }
}

// Export for use
window.APIParticleSystem = APIParticleSystem;
