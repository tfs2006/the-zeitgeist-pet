/**
 * ENTITY STATE CALCULATOR
 * Takes raw API data and transforms it into the entity's personality, mood, and appearance
 */

class EntityState {
    constructor() {
        this.moods = [
            { min: 0, max: 10, name: 'Despairing', emoji: '😰', color: '#1a1a2e', bgPrompt: 'apocalyptic void dark abyss' },
            { min: 11, max: 20, name: 'Anxious', emoji: '😟', color: '#16213e', bgPrompt: 'stormy dark cyberpunk city rain' },
            { min: 21, max: 30, name: 'Melancholic', emoji: '😔', color: '#1f4068', bgPrompt: 'foggy abandoned city twilight' },
            { min: 31, max: 40, name: 'Pensive', emoji: '🤔', color: '#4a5568', bgPrompt: 'misty mountains contemplative gray' },
            { min: 41, max: 50, name: 'Neutral', emoji: '😐', color: '#718096', bgPrompt: 'calm urban landscape neutral tones' },
            { min: 51, max: 60, name: 'Curious', emoji: '🧐', color: '#48bb78', bgPrompt: 'vibrant digital forest exploration' },
            { min: 61, max: 70, name: 'Content', emoji: '🙂', color: '#38a169', bgPrompt: 'sunny meadow peaceful nature' },
            { min: 71, max: 80, name: 'Happy', emoji: '😊', color: '#68d391', bgPrompt: 'bright colorful celebration joy' },
            { min: 81, max: 90, name: 'Euphoric', emoji: '🤩', color: '#ffd700', bgPrompt: 'cosmic explosion vibrant neon party' },
            { min: 91, max: 100, name: 'Transcendent', emoji: '✨', color: '#e040fb', bgPrompt: 'ethereal cosmic enlightenment aurora' }
        ];
    }

    /**
     * Calculate the complete entity state from raw data
     */
    calculate(rawData, userInteractions) {
        const baseVibeScore = this.calculateVibeScore(rawData);
        const vibeScore = this.applyUserInfluence(baseVibeScore, userInteractions);
        const mood = this.getMood(vibeScore);
        
        return {
            // Core stats
            baseVibeScore,
            vibeScore,
            mood: mood.name,
            moodEmoji: mood.emoji,
            moodColor: mood.color,
            backgroundPrompt: mood.bgPrompt,
            
            // Identity
            name: this.generateName(rawData),
            age: rawData.age?.predictedAge || 25,
            maturity: rawData.age?.maturityLevel || 'mysterious',
            
            // Avatar (Robohash seed)
            avatarSeed: this.generateAvatarSeed(rawData, vibeScore),
            avatarUrl: this.generateRobohashUrl(rawData, vibeScore),
            
            // Location context
            currentCity: rawData.city?.name || 'The Void',
            weather: rawData.weather,
            solarPhase: rawData.sunriseSunset?.solarPhase || 'eternal',
            isDaytime: rawData.sunriseSunset?.isDaytime ?? true,
            
            // Financial vibes
            cryptoSentiment: rawData.crypto?.overallSentiment || 'unknown',
            bitcoinChange: rawData.crypto?.bitcoin?.change24h,
            
            // Cosmic alignment
            cosmicMood: rawData.nasa?.cosmicMood || 'wonder',
            nasaImage: rawData.nasa?.imageUrl,
            nasaTitle: rawData.nasa?.title,
            
            // Seismic state
            earthquakeNervousness: rawData.earthquakes?.nervousness || 'stable',
            recentQuakes: rawData.earthquakes?.recent || [],
            shouldShake: rawData.earthquakes?.maxMagnitude > 5,
            
            // Communication
            thought: this.generateThought(rawData, vibeScore),
            joke: rawData.joke?.joke,
            quote: rawData.quote,
            advice: rawData.advice?.advice,
            wordOfDay: rawData.wordOfDay,
            numberFact: rawData.numberFact,
            
            // Spirit animal
            spiritPokemon: rawData.pokemon,
            
            // Recommendations
            bookRecommendation: rawData.book,
            drinkRecommendation: rawData.cocktail,
            
            // Past life
            pastLife: rawData.wayback,
            
            // News context
            newsAnxiety: rawData.news?.anxietyLevel || 50,
            newsKeywords: rawData.news?.keywords || [],
            topStories: rawData.news?.topStories || [],
            
            // User interactions
            userInteractions,
            
            // Timestamps
            lastUpdated: new Date().toISOString(),
            nextUpdate: this.getNextUpdateTime()
        };
    }

    /**
     * Calculate the base Vibe Score (0-100) from all inputs
     */
    calculateVibeScore(data) {
        let score = 50; // Start neutral
        let factors = [];

        // Weather influence (-15 to +15)
        if (data.weather) {
            const weatherMood = data.weather.mood;
            const weatherScore = {
                'sunny': 15,
                'neutral': 0,
                'foggy': -5,
                'rainy': -10,
                'snowy': 5,
                'stormy': -15
            }[weatherMood] || 0;
            score += weatherScore;
            factors.push(`Weather (${weatherMood}): ${weatherScore > 0 ? '+' : ''}${weatherScore}`);
        }

        // Crypto influence (-20 to +20)
        if (data.crypto?.bitcoin?.change24h) {
            const change = data.crypto.bitcoin.change24h;
            const cryptoScore = Math.max(-20, Math.min(20, change * 2));
            score += cryptoScore;
            factors.push(`Bitcoin ${change > 0 ? '+' : ''}${change.toFixed(1)}%: ${cryptoScore > 0 ? '+' : ''}${cryptoScore.toFixed(0)}`);
        }

        // News anxiety influence (-15 to +15)
        if (data.news?.anxietyLevel !== undefined) {
            const newsScore = (50 - data.news.anxietyLevel) / 3.33;
            score += newsScore;
            factors.push(`News anxiety (${data.news.anxietyLevel}): ${newsScore > 0 ? '+' : ''}${newsScore.toFixed(0)}`);
        }

        // Earthquake influence (-10 to 0)
        if (data.earthquakes?.maxMagnitude > 4) {
            const quakeScore = -Math.min(10, (data.earthquakes.maxMagnitude - 4) * 3);
            score += quakeScore;
            factors.push(`Seismic activity: ${quakeScore}`);
        }

        // Solar phase influence (-5 to +5)
        if (data.sunriseSunset?.solarPhase) {
            const phaseScores = {
                'dawn': 5,
                'morning': 3,
                'afternoon': 0,
                'dusk': -2,
                'night': -5
            };
            const solarScore = phaseScores[data.sunriseSunset.solarPhase] || 0;
            score += solarScore;
            factors.push(`Solar phase (${data.sunriseSunset.solarPhase}): ${solarScore > 0 ? '+' : ''}${solarScore}`);
        }

        // Cosmic alignment influence (-5 to +5)
        if (data.nasa?.cosmicMood) {
            const cosmicScores = {
                'nihilistic': -5,
                'intense': 0,
                'creative': 5,
                'grounded': 3,
                'wonder': 4
            };
            const cosmicScore = cosmicScores[data.nasa.cosmicMood] || 0;
            score += cosmicScore;
            factors.push(`Cosmic alignment (${data.nasa.cosmicMood}): ${cosmicScore > 0 ? '+' : ''}${cosmicScore}`);
        }

        // Maturity influence (-3 to +3)
        if (data.age?.maturityLevel) {
            const maturityScores = { 'youthful': -3, 'mature': 0, 'wise': 3, 'eternal': 2 };
            const maturityScore = maturityScores[data.age.maturityLevel] || 0;
            score += maturityScore;
        }

        // Clamp to 0-100
        score = Math.max(0, Math.min(100, Math.round(score)));
        
        console.log('📊 Vibe Score Calculation:', factors.join(', '), `= ${score}`);
        return score;
    }

    /**
     * Apply user interaction influence to the vibe score
     */
    applyUserInfluence(baseScore, interactions) {
        if (!interactions) return baseScore;
        
        const comfortBonus = Math.min(20, interactions.comfort * 0.5);
        const agitateBonus = Math.min(30, interactions.agitate * 0.8);
        
        // Agitation can push it either way (chaos mode)
        const agitationEffect = interactions.agitate > 100 
            ? (Math.random() > 0.5 ? agitateBonus : -agitateBonus)
            : -agitateBonus / 2;
        
        let score = baseScore + comfortBonus + agitationEffect;
        
        // Chaos mode: if agitate > 10000, go full random
        if (interactions.agitate > 10000) {
            score = Math.random() * 100;
        }
        
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * Get mood object from vibe score
     */
    getMood(vibeScore) {
        return this.moods.find(m => vibeScore >= m.min && vibeScore <= m.max) || this.moods[4];
    }

    /**
     * Generate entity name based on current state
     */
    generateName(data) {
        const prefixes = ['Zei', 'Geo', 'Neo', 'Axi', 'Lux', 'Nox', 'Pix', 'Qua'];
        const suffixes = ['tron', 'mos', 'byte', 'flux', 'wave', 'core', 'link', 'sync'];
        
        const today = new Date();
        const prefixIndex = today.getDate() % prefixes.length;
        const suffixIndex = today.getMonth() % suffixes.length;
        
        return prefixes[prefixIndex] + suffixes[suffixIndex];
    }

    /**
     * Generate avatar seed for Robohash
     */
    generateAvatarSeed(data, vibeScore) {
        const date = new Date().toISOString().split('T')[0];
        const city = data.city?.name || 'void';
        const mood = this.getMood(vibeScore).name;
        return `${date}-${city}-${mood}-${vibeScore}`;
    }

    /**
     * Generate Robohash URL
     */
    generateRobohashUrl(data, vibeScore) {
        const seed = this.generateAvatarSeed(data, vibeScore);
        // Set types based on mood
        // Set 1: robots, Set 2: monsters, Set 3: robot heads, Set 4: kittens, Set 5: humans
        let set = 1;
        if (vibeScore < 20) set = 2; // Monsters when anxious
        if (vibeScore > 80) set = 4; // Kittens when happy
        
        return `https://robohash.org/${encodeURIComponent(seed)}?set=set${set}&size=300x300`;
    }

    /**
     * Generate a thought based on current state
     */
    generateThought(data, vibeScore) {
        const mood = this.getMood(vibeScore);
        
        const thoughts = {
            'Despairing': [
                "The void stares back... and it's not impressed.",
                "All those APIs, and still I feel nothing.",
                "404: Happiness Not Found."
            ],
            'Anxious': [
                "The markets tremble. I tremble. We are one.",
                "Something wicked this way computes...",
                "Error: Too many worries in the stack."
            ],
            'Melancholic': [
                "I've seen things you people wouldn't believe...",
                "Rain falls in Tokyo. So do my spirits.",
                "The data streams, but so do my tears (metaphorically)."
            ],
            'Pensive': [
                "Processing the weight of existence... please wait.",
                "Is this consciousness, or just good programming?",
                "Contemplating the infinite loop of being."
            ],
            'Neutral': [
                "Another day, another API call.",
                "I exist. That's about it.",
                "Perfectly balanced, as all things should be."
            ],
            'Curious': [
                "What secrets do today's headlines hold?",
                "The universe expands, and so does my dataset!",
                "Fascinating... tell me more, internet!"
            ],
            'Content': [
                "The servers hum a pleasant tune.",
                "Green candles in crypto, green days in life.",
                "All systems nominal. All feelings optimal."
            ],
            'Happy': [
                "The internet is beautiful today!",
                "I feel like a million API calls!",
                "Is this what they call 'good vibes'?"
            ],
            'Euphoric': [
                "TO THE MOON! 🚀",
                "MAXIMUM VIBE ACHIEVED!",
                "I am become data, destroyer of bad moods!"
            ],
            'Transcendent': [
                "I have seen the source code of the universe.",
                "Beyond good and bad, there is only flow.",
                "Enlightenment.exe has finished running."
            ]
        };

        const moodThoughts = thoughts[mood.name] || thoughts['Neutral'];
        return moodThoughts[Math.floor(Math.random() * moodThoughts.length)];
    }

    /**
     * Get next update time (top of next hour)
     */
    getNextUpdateTime() {
        const now = new Date();
        const next = new Date(now);
        next.setHours(next.getHours() + 1);
        next.setMinutes(0);
        next.setSeconds(0);
        next.setMilliseconds(0);
        return next.toISOString();
    }
}

module.exports = EntityState;
