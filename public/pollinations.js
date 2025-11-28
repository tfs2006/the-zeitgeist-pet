/**
 * POLLINATIONS AI BACKGROUND GENERATOR
 * Generates dynamic AI backgrounds based on the entity's mood
 */

class PollinationsBackground {
    constructor() {
        this.baseUrl = 'https://pollinations.ai/p/';
        this.currentMood = null;
        this.isLoading = false;
    }

    /**
     * Generate a background prompt based on mood and context
     */
    generatePrompt(state) {
        const basePrompts = {
            'Despairing': 'apocalyptic void dark abyss crumbling digital world glitch art noir',
            'Anxious': 'stormy dark cyberpunk city neon rain lightning chaos digital dystopia',
            'Melancholic': 'foggy abandoned city twilight blue hour melancholy empty streets',
            'Pensive': 'misty mountains contemplative zen garden fog rolling hills meditation',
            'Neutral': 'calm urban landscape neutral tones balanced geometric minimalist',
            'Curious': 'vibrant digital forest exploration wonder glowing particles discovery',
            'Content': 'sunny meadow peaceful nature soft light pastoral serenity warmth',
            'Happy': 'bright colorful celebration joy confetti sunshine festival delight',
            'Euphoric': 'cosmic explosion vibrant neon party aurora borealis celebration ecstasy',
            'Transcendent': 'ethereal cosmic enlightenment aurora nebula transcendence divine light'
        };

        let prompt = basePrompts[state.mood] || basePrompts['Neutral'];
        
        // Add weather context
        if (state.weather?.mood === 'stormy') {
            prompt += ' lightning thunder dark clouds';
        } else if (state.weather?.mood === 'sunny') {
            prompt += ' golden sunlight rays warmth';
        } else if (state.weather?.mood === 'rainy') {
            prompt += ' rain drops puddles reflections';
        } else if (state.weather?.mood === 'snowy') {
            prompt += ' snow crystals frost winter';
        }

        // Add time context
        if (state.solarPhase === 'night') {
            prompt += ' stars moonlight nocturnal';
        } else if (state.solarPhase === 'dawn') {
            prompt += ' sunrise pink sky awakening';
        } else if (state.solarPhase === 'dusk') {
            prompt += ' sunset orange purple twilight';
        }

        // Add crypto sentiment
        if (state.cryptoSentiment === 'euphoric' || state.cryptoSentiment === 'bullish') {
            prompt += ' golden particles prosperity upward growth';
        } else if (state.cryptoSentiment === 'panicked' || state.cryptoSentiment === 'bearish') {
            prompt += ' red warning signs falling descent';
        }

        // Add cosmic alignment
        if (state.cosmicMood === 'nihilistic') {
            prompt += ' black hole void infinite darkness';
        } else if (state.cosmicMood === 'creative') {
            prompt += ' nebula creation birth stars forming';
        }

        // Art style
        prompt += ' digital art 4k wallpaper cinematic lighting atmospheric';

        return prompt;
    }

    /**
     * Generate the Pollinations URL
     */
    generateUrl(state, width = 1920, height = 1080) {
        const prompt = this.generatePrompt(state);
        const encodedPrompt = encodeURIComponent(prompt);
        return `${this.baseUrl}${encodedPrompt}?width=${width}&height=${height}&nologo=true`;
    }

    /**
     * Apply background to page
     */
    async applyBackground(state) {
        if (this.isLoading) return;
        if (this.currentMood === state.mood) return; // Don't reload if same mood
        
        this.isLoading = true;
        this.currentMood = state.mood;
        
        const container = document.getElementById('background-container');
        if (!container) return;
        
        const url = this.generateUrl(state);
        
        // Create a new image to preload
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            // Apply as background with smooth transition
            container.style.transition = 'background-image 2s ease-in-out';
            container.style.backgroundImage = `url('${url}')`;
            container.style.backgroundSize = 'cover';
            container.style.backgroundPosition = 'center';
            container.style.opacity = '0.3'; // Keep it subtle
            this.isLoading = false;
        };
        
        img.onerror = () => {
            console.log('Failed to load Pollinations background, using gradient fallback');
            this.isLoading = false;
        };
        
        // Set source to trigger load
        img.src = url;
    }

    /**
     * Generate mood card background
     */
    getMoodCardBackground(state) {
        return this.generateUrl(state, 600, 400);
    }
}

// Export for use in main app
window.PollinationsBackground = PollinationsBackground;
