/**
 * ZEITGEIST PET CONFIGURATION
 * Customize the behavior of your digital entity
 */

module.exports = {
    // Server settings
    server: {
        port: process.env.PORT || 3000,
        host: '0.0.0.0'
    },

    // Cache settings (in seconds)
    cache: {
        entityStateTTL: 3600,      // 1 hour
        apiDataTTL: 1800,          // 30 minutes
        interactionResetInterval: 3600000  // 1 hour in ms
    },

    // API Keys (use environment variables in production)
    apiKeys: {
        // Most APIs used are free/keyless
        // Add your own keys here for premium tiers
        newsApi: process.env.NEWS_API_KEY || null,
        nasaApi: process.env.NASA_API_KEY || 'DEMO_KEY'
    },

    // Vibe Score Weights
    // Adjust how much each data source affects the mood
    vibeWeights: {
        weather: 15,       // -15 to +15
        crypto: 20,        // -20 to +20
        news: 15,          // -15 to +15
        earthquakes: 10,   // -10 to 0
        solar: 5,          // -5 to +5
        cosmic: 5,         // -5 to +5
        maturity: 3        // -3 to +3
    },

    // User interaction effects
    interactions: {
        comfortBoostPerClick: 0.5,
        agitateEffectPerClick: 0.8,
        maxComfortBonus: 20,
        maxAgitateEffect: 30,
        chaosThreshold: 1000,      // Agitates to trigger chaos mode
        raveThreshold: 10000       // Agitates to trigger rave mode
    },

    // World capitals for random location selection
    worldCapitals: [
        { name: 'Tokyo', lat: 35.6762, lon: 139.6503, timezone: 'Asia/Tokyo' },
        { name: 'London', lat: 51.5074, lon: -0.1278, timezone: 'Europe/London' },
        { name: 'New York', lat: 40.7128, lon: -74.0060, timezone: 'America/New_York' },
        { name: 'Sydney', lat: -33.8688, lon: 151.2093, timezone: 'Australia/Sydney' },
        { name: 'Paris', lat: 48.8566, lon: 2.3522, timezone: 'Europe/Paris' },
        { name: 'Berlin', lat: 52.5200, lon: 13.4050, timezone: 'Europe/Berlin' },
        { name: 'Mumbai', lat: 19.0760, lon: 72.8777, timezone: 'Asia/Kolkata' },
        { name: 'Cairo', lat: 30.0444, lon: 31.2357, timezone: 'Africa/Cairo' },
        { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, timezone: 'America/Sao_Paulo' },
        { name: 'Moscow', lat: 55.7558, lon: 37.6173, timezone: 'Europe/Moscow' },
        { name: 'Singapore', lat: 1.3521, lon: 103.8198, timezone: 'Asia/Singapore' },
        { name: 'Dubai', lat: 25.2048, lon: 55.2708, timezone: 'Asia/Dubai' }
    ],

    // Mood thresholds and colors
    moods: [
        { min: 0, max: 10, name: 'Despairing', emoji: '😰', color: '#1a1a2e' },
        { min: 11, max: 20, name: 'Anxious', emoji: '😟', color: '#16213e' },
        { min: 21, max: 30, name: 'Melancholic', emoji: '😔', color: '#1f4068' },
        { min: 31, max: 40, name: 'Pensive', emoji: '🤔', color: '#4a5568' },
        { min: 41, max: 50, name: 'Neutral', emoji: '😐', color: '#718096' },
        { min: 51, max: 60, name: 'Curious', emoji: '🧐', color: '#48bb78' },
        { min: 61, max: 70, name: 'Content', emoji: '🙂', color: '#38a169' },
        { min: 71, max: 80, name: 'Happy', emoji: '😊', color: '#68d391' },
        { min: 81, max: 90, name: 'Euphoric', emoji: '🤩', color: '#ffd700' },
        { min: 91, max: 100, name: 'Transcendent', emoji: '✨', color: '#e040fb' }
    ],

    // Pollinations.ai settings
    pollinations: {
        enabled: true,
        defaultWidth: 1920,
        defaultHeight: 1080,
        artStyle: 'digital art 4k wallpaper cinematic lighting atmospheric'
    },

    // Feature flags
    features: {
        enablePollinations: true,
        enableParticles: true,
        enableShakeEffect: true,
        enableChaosMode: true,
        enableRaveMode: true,
        enableBrainScan: true,
        enableMoodCards: true,
        enableQRCodes: true
    }
};
