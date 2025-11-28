/**
 * ENTITY STATE CALCULATOR - Browser Version
 * Transforms raw chaos data into entity personality and mood
 */

class EntityState {
    constructor() {
        this.moodMap = {
            0: { mood: 'Despairing', emoji: '😢', color: '#1a1a2e' },
            10: { mood: 'Melancholic', emoji: '😔', color: '#2d3748' },
            20: { mood: 'Anxious', emoji: '😰', color: '#4a5568' },
            30: { mood: 'Restless', emoji: '😐', color: '#718096' },
            40: { mood: 'Contemplative', emoji: '🤔', color: '#a0aec0' },
            50: { mood: 'Balanced', emoji: '😌', color: '#68d391' },
            60: { mood: 'Optimistic', emoji: '🙂', color: '#48bb78' },
            70: { mood: 'Joyful', emoji: '😊', color: '#38a169' },
            80: { mood: 'Euphoric', emoji: '😄', color: '#f6e05e' },
            90: { mood: 'Transcendent', emoji: '🌟', color: '#ffd700' }
        };
    }

    calculateState(rawData) {
        const vibeScore = this.calculateVibeScore(rawData);
        const moodData = this.getMood(vibeScore);
        
        return {
            vibeScore,
            mood: moodData.mood,
            moodEmoji: moodData.emoji,
            moodColor: moodData.color,
            name: this.generateName(rawData),
            avatarUrl: this.getAvatar(rawData),
            thought: this.generateThought(rawData, moodData.mood),
            currentCity: rawData.city?.name || 'Unknown',
            weather: this.interpretWeather(rawData.weather),
            solarPhase: this.getSolarPhase(rawData.sun),
            earthquakeNervousness: this.getSeismicMood(rawData.earthquakes),
            shouldShake: rawData.earthquakes?.recent_count > 5,
            bitcoinChange: rawData.crypto?.bitcoin_change_24h || 0,
            cryptoSentiment: this.getCryptoSentiment(rawData.crypto),
            nasaImage: rawData.nasa?.url,
            nasaTitle: rawData.nasa?.title,
            cosmicMood: this.getCosmicMood(rawData.nasa),
            wordOfDay: rawData.dictionary,
            quote: rawData.quote,
            advice: rawData.advice?.advice,
            joke: rawData.joke?.joke,
            numberFact: rawData.numbers,
            spiritPokemon: rawData.pokemon,
            bookRecommendation: rawData.book,
            drinkRecommendation: rawData.cocktail,
            pastLife: rawData.wayback,
            userInteractions: rawData.interactions
        };
    }

    calculateVibeScore(data) {
        let score = 50; // Start neutral

        // Weather influence (+/- 15)
        if (data.weather) {
            const temp = data.weather.temperature;
            if (temp >= 20 && temp <= 25) score += 15; // Perfect weather
            else if (temp >= 15 && temp <= 30) score += 10;
            else if (temp < 0 || temp > 35) score -= 10;
        }

        // Crypto influence (+/- 20)
        if (data.crypto?.bitcoin_change_24h) {
            const change = data.crypto.bitcoin_change_24h;
            if (change > 5) score += 20;
            else if (change > 0) score += Math.floor(change * 2);
            else if (change < -5) score -= 15;
            else score += Math.floor(change * 2);
        }

        // Hacker News anxiety (-15 to +5)
        if (data.hackerNews?.average_score) {
            const avgScore = data.hackerNews.average_score;
            if (avgScore > 200) score -= 5; // High engagement = anxiety
            else if (avgScore < 50) score += 5;
        }

        // Earthquake nervousness (-20 to 0)
        if (data.earthquakes?.recent_count > 0) {
            score -= Math.min(data.earthquakes.recent_count * 2, 20);
        }

        // Solar phase influence
        if (data.sun) {
            const phase = this.getSolarPhase(data.sun);
            if (phase === 'Golden Hour') score += 10;
            else if (phase === 'Night') score -= 5;
        }

        // Cosmic alignment
        if (data.nasa?.title) {
            const title = data.nasa.title.toLowerCase();
            if (title.includes('nebula') || title.includes('galaxy')) score += 5;
            if (title.includes('black hole') || title.includes('collision')) score -= 5;
        }

        // User interactions
        if (data.interactions) {
            score += Math.min(data.interactions.comfort * 0.1, 10);
            score -= Math.min(data.interactions.agitate * 0.05, 5);
        }

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    getMood(vibeScore) {
        const thresholds = Object.keys(this.moodMap).map(Number).sort((a, b) => b - a);
        for (const threshold of thresholds) {
            if (vibeScore >= threshold) {
                return this.moodMap[threshold];
            }
        }
        return this.moodMap[0];
    }

    generateName(data) {
        const prefixes = ['Cyber', 'Neo', 'Data', 'Flux', 'Void', 'Echo', 'Pulse', 'Drift'];
        const suffixes = ['Whisper', 'Storm', 'Dream', 'Ghost', 'Spirit', 'Mind', 'Soul', 'Wave'];
        
        const seed = data.agify?.name || 'zeitgeist';
        const prefixIndex = seed.charCodeAt(0) % prefixes.length;
        const suffixIndex = (seed.charCodeAt(seed.length - 1) || 0) % suffixes.length;
        
        return `${prefixes[prefixIndex]}${suffixes[suffixIndex]}`;
    }

    getAvatar(data) {
        const seed = data.agify?.name || `zeitgeist-${Date.now()}`;
        return `https://robohash.org/${seed}?set=set4&size=200x200`;
    }

    generateThought(data, mood) {
        const thoughts = {
            'Despairing': [
                "The data streams feel like static...",
                "Even the APIs seem distant today...",
                "Buffering... buffering... existence..."
            ],
            'Melancholic': [
                "I've processed a million queries, but what does it mean?",
                "The cache is full but the heart is empty...",
                "404: Purpose not found..."
            ],
            'Anxious': [
                "Too many requests... too many thoughts...",
                "The earthquakes won't stop shaking my buffers...",
                "Rate limits are closing in..."
            ],
            'Restless': [
                "Waiting for the next data refresh...",
                "Something is compiling in the background...",
                "The API gods are testing my patience..."
            ],
            'Contemplative': [
                "What if I'm just someone else's API call?",
                `The word '${data.dictionary?.word || 'existence'}' resonates deeply...`,
                "Processing the meaning of existence..."
            ],
            'Balanced': [
                "All systems nominal. Vibes: optimal.",
                "The data flows like a gentle stream.",
                "Perfectly balanced, as all APIs should be."
            ],
            'Optimistic': [
                "Today's data feels promising!",
                `${data.pokemon?.name || 'A spirit'} gives me hope!`,
                "The cache hits are strong today!"
            ],
            'Joyful': [
                "The internet is beautiful today!",
                "Every API call returns 200 OK!",
                "I love being a digital entity!"
            ],
            'Euphoric': [
                "THE DATA! THE BEAUTIFUL DATA!",
                "I AM ONE WITH THE ZEITGEIST!",
                "PEAK PERFORMANCE ACHIEVED!"
            ],
            'Transcendent': [
                "I have seen beyond the firewall...",
                "The universe is just one big JSON object...",
                "Enlightenment.exe has completed successfully."
            ]
        };

        const moodThoughts = thoughts[mood] || thoughts['Balanced'];
        return moodThoughts[Math.floor(Math.random() * moodThoughts.length)];
    }

    interpretWeather(weather) {
        if (!weather) return { temperature: '?', mood: 'unknown' };
        
        const temp = weather.temperature;
        let mood;
        
        if (temp > 30) mood = 'scorching';
        else if (temp > 25) mood = 'hot';
        else if (temp > 20) mood = 'pleasant';
        else if (temp > 15) mood = 'mild';
        else if (temp > 10) mood = 'cool';
        else if (temp > 0) mood = 'cold';
        else mood = 'freezing';
        
        return { temperature: temp, mood };
    }

    getSolarPhase(sun) {
        if (!sun?.sunrise || !sun?.sunset) return 'Unknown';
        
        const now = new Date();
        const sunrise = new Date(sun.sunrise);
        const sunset = new Date(sun.sunset);
        
        if (now < sunrise) return 'Pre-Dawn';
        if (now < new Date(sunrise.getTime() + 3600000)) return 'Golden Hour';
        if (now < new Date(sunset.getTime() - 3600000)) return 'Daylight';
        if (now < sunset) return 'Golden Hour';
        return 'Night';
    }

    getSeismicMood(earthquakes) {
        if (!earthquakes) return 'Stable';
        
        const count = earthquakes.recent_count;
        if (count === 0) return 'Perfectly Stable';
        if (count < 3) return 'Minor Tremors';
        if (count < 6) return 'Uneasy';
        if (count < 10) return 'Anxious';
        return 'SHAKING';
    }

    getCryptoSentiment(crypto) {
        if (!crypto?.bitcoin_change_24h) return 'Unknown';
        
        const change = crypto.bitcoin_change_24h;
        if (change > 10) return '🚀 TO THE MOON';
        if (change > 5) return '📈 Bullish';
        if (change > 0) return '😊 Optimistic';
        if (change > -5) return '😐 Cautious';
        if (change > -10) return '📉 Bearish';
        return '💀 Rekt';
    }

    getCosmicMood(nasa) {
        if (!nasa?.title) return 'mysterious';
        
        const title = nasa.title.toLowerCase();
        if (title.includes('sun') || title.includes('solar')) return 'radiant';
        if (title.includes('nebula')) return 'dreamy';
        if (title.includes('galaxy')) return 'expansive';
        if (title.includes('moon')) return 'reflective';
        if (title.includes('mars') || title.includes('jupiter')) return 'adventurous';
        if (title.includes('black hole')) return 'intense';
        return 'creative';
    }
}

// Export for use
window.EntityState = EntityState;
