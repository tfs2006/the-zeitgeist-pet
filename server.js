/**
 * THE ZEITGEIST PET - Main Server
 * A "living" digital entity that evolves based on the real-time state of the internet
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const NodeCache = require('node-cache');

// Import the Chaos Engine
const ChaosEngine = require('./engine/chaosEngine');
const EntityState = require('./engine/entityState');

const app = express();
const PORT = process.env.PORT || 3000;

// Cache for storing entity state (TTL: 1 hour)
const stateCache = new NodeCache({ stdTTL: 3600 });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize the Chaos Engine
const chaosEngine = new ChaosEngine();
const entityState = new EntityState();

// User interaction counters (in-memory, resets hourly)
let userInteractions = {
    comfort: 0,
    agitate: 0,
    lastReset: Date.now()
};

// Reset interactions every hour
setInterval(() => {
    userInteractions = { comfort: 0, agitate: 0, lastReset: Date.now() };
}, 3600000);

// ============== API ROUTES ==============

/**
 * GET /api/entity - Get the current state of the Zeitgeist Pet
 */
app.get('/api/entity', async (req, res) => {
    try {
        // Check cache first
        let state = stateCache.get('entityState');
        
        if (!state) {
            // Fetch fresh data from all APIs
            console.log('🧠 Fetching fresh data from the Chaos Engine...');
            const rawData = await chaosEngine.fetchAllData();
            state = entityState.calculate(rawData, userInteractions);
            stateCache.set('entityState', state);
        } else {
            // Update with current user interactions
            state.userInteractions = userInteractions;
            state.vibeScore = entityState.applyUserInfluence(state.baseVibeScore, userInteractions);
        }
        
        res.json(state);
    } catch (error) {
        console.error('Error fetching entity state:', error);
        res.status(500).json({ error: 'The entity is having an existential crisis...' });
    }
});

/**
 * GET /api/brain-scan - Show raw JSON data (for tech users)
 */
app.get('/api/brain-scan', async (req, res) => {
    try {
        const rawData = await chaosEngine.fetchAllData();
        res.json({
            timestamp: new Date().toISOString(),
            rawInputs: rawData,
            userInteractions,
            message: "You are looking directly into the entity's neural pathways..."
        });
    } catch (error) {
        res.status(500).json({ error: 'Brain scan failed - entity is dreaming' });
    }
});

/**
 * POST /api/interact - User interaction (Comfort or Agitate)
 */
app.post('/api/interact', (req, res) => {
    const { action } = req.body;
    
    if (action === 'comfort') {
        userInteractions.comfort++;
        res.json({ 
            message: 'You gently comfort the entity...', 
            totalComfort: userInteractions.comfort,
            totalAgitate: userInteractions.agitate
        });
    } else if (action === 'agitate') {
        userInteractions.agitate++;
        res.json({ 
            message: 'You poke the entity aggressively!', 
            totalComfort: userInteractions.comfort,
            totalAgitate: userInteractions.agitate
        });
    } else {
        res.status(400).json({ error: 'Invalid action' });
    }
});

/**
 * GET /api/interactions - Get current interaction counts
 */
app.get('/api/interactions', (req, res) => {
    res.json(userInteractions);
});

/**
 * GET /api/history/:date - Get historical entity state
 */
app.get('/api/history/:date', (req, res) => {
    // In a real implementation, this would fetch from a database
    const { date } = req.params;
    res.json({
        date,
        message: 'Historical archive coming soon...',
        note: 'The Graveyard remembers all past forms'
    });
});

/**
 * GET /api/mood-card - Generate shareable mood card data
 */
app.get('/api/mood-card', async (req, res) => {
    try {
        let state = stateCache.get('entityState');
        if (!state) {
            const rawData = await chaosEngine.fetchAllData();
            state = entityState.calculate(rawData, userInteractions);
        }
        
        res.json({
            date: new Date().toISOString().split('T')[0],
            vibeScore: state.vibeScore,
            mood: state.mood,
            moodEmoji: state.moodEmoji,
            thought: state.thought,
            wordOfDay: state.wordOfDay,
            backgroundPrompt: state.backgroundPrompt,
            shareText: `The Zeitgeist Pet is feeling ${state.mood} today (${state.vibeScore}/100). ${state.thought}`
        });
    } catch (error) {
        res.status(500).json({ error: 'Could not generate mood card' });
    }
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve graveyard page
app.get('/graveyard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'graveyard.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║   🌐 THE ZEITGEIST PET IS AWAKENING...                   ║
    ║                                                           ║
    ║   Server running at: http://localhost:${PORT}              ║
    ║   Brain Scan at: http://localhost:${PORT}/api/brain-scan   ║
    ║   Graveyard at: http://localhost:${PORT}/graveyard         ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
