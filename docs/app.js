/**
 * THE ZEITGEIST PET - Frontend Application
 * Static version for GitHub Pages - no server required!
 * Fetches directly from APIs in the browser
 */

class ZeitgeistPet {
    constructor() {
        this.state = null;
        this.rawData = null;
        this.updateInterval = null;
        this.countdownInterval = null;
        this.pollinationsBackground = null;
        this.particleSystem = null;
        
        // Browser-based engines
        this.chaosEngine = null;
        this.entityState = null;
        
        this.init();
    }

    async init() {
        console.log('🌐 Initializing The Zeitgeist Pet...');
        
        // Initialize browser-based Chaos Engine
        if (window.ChaosEngine) {
            this.chaosEngine = new ChaosEngine();
        }
        
        // Initialize Entity State calculator
        if (window.EntityState) {
            this.entityState = new EntityState();
        }
        
        // Initialize Pollinations background generator
        if (window.PollinationsBackground) {
            this.pollinationsBackground = new PollinationsBackground();
        }
        
        // Initialize API Particle System
        if (window.APIParticleSystem) {
            this.particleSystem = new APIParticleSystem();
        }
        
        // Initial data fetch
        await this.fetchEntityState();
        
        // Set up auto-refresh every 5 minutes
        this.updateInterval = setInterval(async () => {
            await this.fetchEntityState();
        }, 300000);
        
        // Start countdown timer
        this.startCountdown();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load saved interaction counts
        this.loadInteractions();
        
        // Add keyboard shortcuts
        this.initKeyboardShortcuts();
    }

    async fetchEntityState() {
        try {
            document.body.classList.add('loading');
            
            if (!this.chaosEngine || !this.entityState) {
                throw new Error('Engines not initialized');
            }
            
            // Fetch raw data from all APIs
            this.rawData = await this.chaosEngine.fetchAllData();
            
            // Calculate entity state from raw data
            this.state = this.entityState.calculateState(this.rawData);
            
            // Update the UI
            this.updateUI();
            
            // Update particle system with new state
            if (this.particleSystem && this.rawData) {
                this.particleSystem.updateParticleStates({
                    ...this.rawData,
                    vibeScore: this.state.vibeScore
                });
            }
            
        } catch (error) {
            console.error('Error fetching entity state:', error);
            this.showError('The entity is experiencing technical difficulties...');
        } finally {
            document.body.classList.remove('loading');
        }
    }

    updateUI() {
        if (!this.state) return;
        
        const s = this.state;
        
        // Update vibe score with null checks
        const vibeFill = document.getElementById('vibe-fill');
        const vibeScore = document.getElementById('vibe-score');
        const moodText = document.getElementById('mood-text');
        
        if (vibeFill) vibeFill.style.width = `${s.vibeScore}%`;
        if (vibeScore) vibeScore.textContent = s.vibeScore;
        if (moodText) moodText.textContent = `${s.moodEmoji || '😐'} ${s.mood || 'Unknown'}`;
        
        // Update CSS variables for mood color
        document.documentElement.style.setProperty('--mood-color', s.moodColor || '#718096');
        document.documentElement.style.setProperty('--glow-color', `${s.moodColor || '#718096'}66`);
        
        // Update entity avatar
        const entityImage = document.getElementById('entity-image');
        const entityName = document.getElementById('entity-name');
        
        if (entityImage && s.avatarUrl) entityImage.src = s.avatarUrl;
        if (entityName) entityName.textContent = s.name || 'Unknown Entity';
        
        // Update thought bubble
        const thoughtEl = document.getElementById('entity-thought');
        if (thoughtEl) thoughtEl.textContent = `"${s.thought || 'Processing...'}"`;
        
        // Update spirit Pokemon
        const pokemonEl = document.getElementById('spirit-pokemon');
        if (pokemonEl && s.spiritPokemon?.sprite) {
            pokemonEl.innerHTML = `
                <img src="${s.spiritPokemon.sprite}" alt="${s.spiritPokemon.name}" title="Spirit Animal: ${s.spiritPokemon.name}" />
            `;
        }
        
        // Update world state panel with null checks
        const cityEl = document.getElementById('data-city');
        const weatherEl = document.getElementById('data-weather');
        const solarEl = document.getElementById('data-solar');
        const seismicEl = document.getElementById('data-seismic');
        
        if (cityEl) cityEl.textContent = s.currentCity || '--';
        if (weatherEl) {
            weatherEl.textContent = s.weather 
                ? `${s.weather.temperature}°C, ${s.weather.mood}` 
                : '--';
        }
        if (solarEl) solarEl.textContent = s.solarPhase || '--';
        if (seismicEl) seismicEl.textContent = s.earthquakeNervousness || '--';
        
        // Update crypto panel
        const btcElement = document.getElementById('data-btc');
        const sentimentEl = document.getElementById('data-sentiment');
        
        if (btcElement && s.bitcoinChange !== undefined && s.bitcoinChange !== null) {
            const change = s.bitcoinChange.toFixed(2);
            btcElement.textContent = `${change > 0 ? '+' : ''}${change}%`;
            btcElement.className = `data-value crypto-change ${parseFloat(change) >= 0 ? 'positive' : 'negative'}`;
        }
        if (sentimentEl) sentimentEl.textContent = s.cryptoSentiment || '--';
        
        // Update cosmic panel
        const nasaImage = document.getElementById('nasa-image');
        const cosmicEl = document.getElementById('data-cosmic');
        
        if (nasaImage && s.nasaImage) nasaImage.src = s.nasaImage;
        if (cosmicEl) cosmicEl.textContent = `${s.cosmicMood || 'unknown'} - ${s.nasaTitle || 'Unknown'}`;
        
        // Update word of day
        const wordDisplay = document.getElementById('word-display');
        const wordDef = document.getElementById('word-definition');
        
        if (s.wordOfDay) {
            if (wordDisplay) wordDisplay.textContent = s.wordOfDay.word || '--';
            if (wordDef) wordDef.textContent = s.wordOfDay.definition || '--';
        }
        
        // Update voice section
        const quoteText = document.getElementById('quote-text');
        const quoteAuthor = document.getElementById('quote-author');
        
        if (s.quote) {
            if (quoteText) quoteText.textContent = `"${s.quote.content || 'No wisdom today'}"`;
            if (quoteAuthor) quoteAuthor.textContent = `- ${s.quote.author || 'Unknown'}`;
        }
        
        const adviceText = document.getElementById('advice-text');
        if (adviceText && s.advice) adviceText.textContent = s.advice;
        
        const jokeText = document.getElementById('joke-text');
        if (jokeText && s.joke) jokeText.textContent = s.joke;
        
        const numberText = document.getElementById('number-text');
        if (numberText && s.numberFact) {
            numberText.textContent = `${s.numberFact.number}: ${s.numberFact.fact}`;
        }
        
        // Update recommendations
        const bookTitle = document.getElementById('rec-book-title');
        const bookAuthor = document.getElementById('rec-book-author');
        
        if (s.bookRecommendation) {
            if (bookTitle) bookTitle.textContent = s.bookRecommendation.title || 'Unknown';
            if (bookAuthor) bookAuthor.textContent = `by ${s.bookRecommendation.author || 'Unknown'}`;
        }
        
        const drinkTitle = document.getElementById('rec-drink-title');
        const drinkImage = document.getElementById('rec-drink-image');
        
        if (s.drinkRecommendation) {
            if (drinkTitle) drinkTitle.textContent = s.drinkRecommendation.name || 'Mystery Drink';
            if (drinkImage && s.drinkRecommendation.image) drinkImage.src = s.drinkRecommendation.image;
        }
        
        const pastLink = document.getElementById('rec-past-link');
        const pastTitle = document.getElementById('rec-past-title');
        
        if (s.pastLife?.archiveUrl) {
            if (pastLink) pastLink.href = s.pastLife.archiveUrl;
            if (pastTitle) pastTitle.textContent = `${s.pastLife.originalSite} from 10 years ago`;
        }
        
        // Apply shake effect if earthquakes
        const shakeContainer = document.getElementById('shake-container');
        if (shakeContainer && s.shouldShake) {
            shakeContainer.classList.add('shaking');
            setTimeout(() => {
                shakeContainer.classList.remove('shaking');
            }, 3000);
        }
        
        // Apply chaos mode if highly agitated
        if (s.userInteractions?.agitate > 1000) {
            document.body.classList.add('chaos-mode');
        } else {
            document.body.classList.remove('chaos-mode');
        }
        
        // Apply rave mode if extremely agitated
        if (s.userInteractions?.agitate > 10000) {
            document.body.classList.add('rave-mode');
        } else {
            document.body.classList.remove('rave-mode');
        }
        
        // Update interaction counts
        const comfortCount = document.getElementById('comfort-count');
        const agitateCount = document.getElementById('agitate-count');
        
        if (s.userInteractions) {
            if (comfortCount) comfortCount.textContent = s.userInteractions.comfort || 0;
            if (agitateCount) agitateCount.textContent = s.userInteractions.agitate || 0;
        }
        
        // Apply AI-generated background via Pollinations
        if (this.pollinationsBackground) {
            this.pollinationsBackground.applyBackground(s);
        }
    }

    setupEventListeners() {
        // Comfort button
        const comfortBtn = document.getElementById('btn-comfort');
        if (comfortBtn) {
            comfortBtn.addEventListener('click', () => this.interact('comfort'));
        }
        
        // Agitate button
        const agitateBtn = document.getElementById('btn-agitate');
        if (agitateBtn) {
            agitateBtn.addEventListener('click', () => this.interact('agitate'));
        }
        
        // Brain Scan button
        const brainScanBtn = document.getElementById('btn-brain-scan');
        if (brainScanBtn) {
            brainScanBtn.addEventListener('click', () => this.showBrainScan());
        }
        
        // Mood Card button
        const moodCardBtn = document.getElementById('btn-mood-card');
        if (moodCardBtn) {
            moodCardBtn.addEventListener('click', () => this.showMoodCard());
        }
        
        // QR Code button
        const qrBtn = document.getElementById('btn-qr');
        if (qrBtn) {
            qrBtn.addEventListener('click', () => this.showQRCode());
        }
        
        // Modal close buttons
        const closeBrainScan = document.getElementById('close-brain-scan');
        if (closeBrainScan) {
            closeBrainScan.addEventListener('click', () => {
                document.getElementById('modal-brain-scan')?.classList.remove('active');
            });
        }
        
        const closeMoodCard = document.getElementById('close-mood-card');
        if (closeMoodCard) {
            closeMoodCard.addEventListener('click', () => {
                document.getElementById('modal-mood-card')?.classList.remove('active');
            });
        }
        
        const closeQr = document.getElementById('close-qr');
        if (closeQr) {
            closeQr.addEventListener('click', () => {
                document.getElementById('modal-qr')?.classList.remove('active');
            });
        }
        
        // Share button
        const shareBtn = document.getElementById('btn-share');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareMoodCard());
        }
        
        // Close modal on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    interact(action) {
        if (!this.chaosEngine) return;
        
        const interactions = this.chaosEngine.addInteraction(action);
        
        // Update counts
        const comfortCount = document.getElementById('comfort-count');
        const agitateCount = document.getElementById('agitate-count');
        
        if (comfortCount) comfortCount.textContent = interactions.comfort;
        if (agitateCount) agitateCount.textContent = interactions.agitate;
        
        // Visual feedback
        const btn = document.getElementById(`btn-${action}`);
        if (btn) {
            btn.style.transform = 'scale(1.2)';
            setTimeout(() => btn.style.transform = '', 200);
        }
        
        // Refresh entity state to show updated mood
        this.fetchEntityState();
    }

    loadInteractions() {
        if (!this.chaosEngine) return;
        
        const interactions = this.chaosEngine.getInteractions();
        
        const comfortCount = document.getElementById('comfort-count');
        const agitateCount = document.getElementById('agitate-count');
        
        if (comfortCount) comfortCount.textContent = interactions.comfort;
        if (agitateCount) agitateCount.textContent = interactions.agitate;
    }

    showBrainScan() {
        const brainScanData = document.getElementById('brain-scan-data');
        if (brainScanData && this.rawData) {
            brainScanData.textContent = JSON.stringify({
                rawInputs: this.rawData,
                calculatedState: this.state
            }, null, 2);
        }
        
        document.getElementById('modal-brain-scan')?.classList.add('active');
    }

    showMoodCard() {
        if (!this.state) return;
        
        const s = this.state;
        const today = new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        const cardDate = document.getElementById('card-date');
        const cardEmoji = document.getElementById('card-emoji');
        const cardScore = document.getElementById('card-score');
        const cardMood = document.getElementById('card-mood');
        const cardThought = document.getElementById('card-thought');
        
        if (cardDate) cardDate.textContent = today;
        if (cardEmoji) cardEmoji.textContent = s.moodEmoji || '😐';
        if (cardScore) cardScore.textContent = s.vibeScore || '--';
        if (cardMood) cardMood.textContent = s.mood || 'Unknown';
        if (cardThought) cardThought.textContent = `"${s.thought || 'No thoughts...'}"`;
        
        document.getElementById('modal-mood-card')?.classList.add('active');
    }

    showQRCode() {
        const currentUrl = encodeURIComponent(window.location.href);
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${currentUrl}`;
        
        const qrCode = document.getElementById('qr-code');
        if (qrCode) qrCode.src = qrUrl;
        
        document.getElementById('modal-qr')?.classList.add('active');
    }

    shareMoodCard() {
        if (!this.state) return;
        
        const s = this.state;
        const text = `The Zeitgeist Pet is feeling ${s.mood} today (${s.vibeScore}/100)! ${s.moodEmoji}\n\n"${s.thought}"\n\nCheck it out:`;
        
        if (navigator.share) {
            navigator.share({
                title: 'The Zeitgeist Pet - Daily Mood',
                text: text,
                url: window.location.href
            }).catch(console.error);
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(`${text} ${window.location.href}`).then(() => {
                alert('Mood card copied to clipboard!');
            }).catch(console.error);
        }
    }

    startCountdown() {
        const updateCountdown = () => {
            const now = new Date();
            const nextRefresh = new Date(now.getTime() + 300000 - (now.getTime() % 300000));
            
            const diff = nextRefresh - now;
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            
            const countdown = document.getElementById('countdown');
            if (countdown) {
                countdown.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        };
        
        updateCountdown();
        this.countdownInterval = setInterval(updateCountdown, 1000);
    }

    showError(message) {
        const thoughtEl = document.getElementById('entity-thought');
        if (thoughtEl) thoughtEl.textContent = `"${message}"`;
    }

    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts if typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.key.toLowerCase()) {
                case 'c':
                    this.interact('comfort');
                    break;
                case 'a':
                    this.interact('agitate');
                    break;
                case 'b':
                    this.showBrainScan();
                    break;
                case 'm':
                    this.showMoodCard();
                    break;
                case 'q':
                    this.showQRCode();
                    break;
                case 'escape':
                    document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
                    break;
            }
        });
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.zeitgeistPet = new ZeitgeistPet();
});
