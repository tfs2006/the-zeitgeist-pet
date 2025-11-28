/**
 * THE CHAOS ENGINE
 * The central brain that fetches data from all 20 API sources
 * and normalizes them into a unified "Vibe Score"
 */

const fetch = require('node-fetch');

// Helper function to fetch with timeout
async function fetchWithTimeout(url, options = {}, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

class ChaosEngine {
    constructor() {
        // List of world capitals for weather/time data
        this.worldCapitals = [
            { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
            { name: 'London', lat: 51.5074, lon: -0.1278 },
            { name: 'New York', lat: 40.7128, lon: -74.0060 },
            { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
            { name: 'Paris', lat: 48.8566, lon: 2.3522 },
            { name: 'Berlin', lat: 52.5200, lon: 13.4050 },
            { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
            { name: 'Cairo', lat: 30.0444, lon: 31.2357 },
            { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 },
            { name: 'Moscow', lat: 55.7558, lon: 37.6173 }
        ];
        
        // Today's random city (seeded by date)
        this.todaysCity = this.getRandomCity();
    }

    /**
     * Get a deterministic "random" city based on today's date
     */
    getRandomCity() {
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        return this.worldCapitals[seed % this.worldCapitals.length];
    }

    /**
     * Fetch all data from all API sources
     */
    async fetchAllData() {
        const results = await Promise.allSettled([
            this.fetchWeather(),
            this.fetchCrypto(),
            this.fetchNews(),
            this.fetchNasaAPOD(),
            this.fetchSunriseSunset(),
            this.fetchEarthquakes(),
            this.fetchJoke(),
            this.fetchQuote(),
            this.fetchAdvice(),
            this.fetchWordDefinition(),
            this.fetchNumberFact(),
            this.fetchPokemon(),
            this.fetchBook(),
            this.fetchCocktail(),
            this.fetchWaybackMachine(),
            this.fetchAgify()
        ]);

        // Process results
        const data = {
            weather: this.extractResult(results[0]),
            crypto: this.extractResult(results[1]),
            news: this.extractResult(results[2]),
            nasa: this.extractResult(results[3]),
            sunriseSunset: this.extractResult(results[4]),
            earthquakes: this.extractResult(results[5]),
            joke: this.extractResult(results[6]),
            quote: this.extractResult(results[7]),
            advice: this.extractResult(results[8]),
            wordOfDay: this.extractResult(results[9]),
            numberFact: this.extractResult(results[10]),
            pokemon: this.extractResult(results[11]),
            book: this.extractResult(results[12]),
            cocktail: this.extractResult(results[13]),
            wayback: this.extractResult(results[14]),
            age: this.extractResult(results[15]),
            city: this.todaysCity,
            fetchedAt: new Date().toISOString()
        };

        return data;
    }

    extractResult(result) {
        return result.status === 'fulfilled' ? result.value : null;
    }

    // ============== 🌍 THE SENSES (World Input) ==============

    /**
     * Open-Meteo: Free weather API
     */
    async fetchWeather() {
        try {
            const { lat, lon, name } = this.todaysCity;
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
            const response = await fetch(url);
            const data = await response.json();
            
            return {
                city: name,
                temperature: data.current_weather?.temperature,
                weatherCode: data.current_weather?.weathercode,
                windSpeed: data.current_weather?.windspeed,
                isDay: data.current_weather?.is_day === 1,
                mood: this.weatherToMood(data.current_weather?.weathercode)
            };
        } catch (error) {
            console.error('Weather API error:', error.message);
            return null;
        }
    }

    weatherToMood(code) {
        if (!code) return 'neutral';
        if (code <= 3) return 'sunny';
        if (code <= 49) return 'foggy';
        if (code <= 69) return 'rainy';
        if (code <= 79) return 'snowy';
        if (code <= 99) return 'stormy';
        return 'neutral';
    }

    /**
     * CoinGecko: Crypto prices
     */
    async fetchCrypto() {
        try {
            const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,dogecoin&vs_currencies=usd&include_24hr_change=true';
            const response = await fetch(url);
            const data = await response.json();
            
            return {
                bitcoin: {
                    price: data.bitcoin?.usd,
                    change24h: data.bitcoin?.usd_24h_change
                },
                ethereum: {
                    price: data.ethereum?.usd,
                    change24h: data.ethereum?.usd_24h_change
                },
                dogecoin: {
                    price: data.dogecoin?.usd,
                    change24h: data.dogecoin?.usd_24h_change
                },
                overallSentiment: this.cryptoSentiment(data)
            };
        } catch (error) {
            console.error('Crypto API error:', error.message);
            return null;
        }
    }

    cryptoSentiment(data) {
        const btcChange = data.bitcoin?.usd_24h_change || 0;
        const ethChange = data.ethereum?.usd_24h_change || 0;
        const avg = (btcChange + ethChange) / 2;
        
        if (avg > 5) return 'euphoric';
        if (avg > 2) return 'bullish';
        if (avg > -2) return 'neutral';
        if (avg > -5) return 'bearish';
        return 'panicked';
    }

    /**
     * NewsData.io: Top headlines (using free tier)
     * Note: Requires API key for full functionality
     */
    async fetchNews() {
        try {
            // Using a public headlines endpoint
            const url = 'https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty';
            const response = await fetch(url);
            const storyIds = await response.json();
            
            // Get top 5 stories
            const stories = await Promise.all(
                storyIds.slice(0, 5).map(async (id) => {
                    const storyRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
                    return storyRes.json();
                })
            );

            const titles = stories.map(s => s?.title || '').join(' ').toLowerCase();
            
            return {
                source: 'Hacker News',
                topStories: stories.map(s => ({ title: s?.title, score: s?.score })),
                anxietyLevel: this.calculateAnxiety(titles),
                keywords: this.extractKeywords(titles)
            };
        } catch (error) {
            console.error('News API error:', error.message);
            return null;
        }
    }

    calculateAnxiety(text) {
        const anxiousWords = ['war', 'crash', 'crisis', 'death', 'fear', 'collapse', 'panic', 'disaster', 'attack', 'threat'];
        const calmWords = ['peace', 'growth', 'success', 'breakthrough', 'innovation', 'hope', 'recovery'];
        
        let anxiety = 50;
        anxiousWords.forEach(word => {
            if (text.includes(word)) anxiety += 10;
        });
        calmWords.forEach(word => {
            if (text.includes(word)) anxiety -= 10;
        });
        
        return Math.max(0, Math.min(100, anxiety));
    }

    extractKeywords(text) {
        const important = ['ai', 'crypto', 'bitcoin', 'tech', 'war', 'peace', 'climate', 'space', 'health'];
        return important.filter(word => text.includes(word));
    }

    /**
     * NASA APOD: Astronomy Picture of the Day
     */
    async fetchNasaAPOD() {
        try {
            // Using NASA's demo key
            const url = 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY';
            const response = await fetch(url);
            const data = await response.json();
            
            const title = (data.title || '').toLowerCase();
            let cosmicMood = 'wonder';
            
            if (title.includes('black hole') || title.includes('void')) cosmicMood = 'nihilistic';
            if (title.includes('supernova') || title.includes('explosion')) cosmicMood = 'intense';
            if (title.includes('nebula') || title.includes('birth')) cosmicMood = 'creative';
            if (title.includes('earth') || title.includes('moon')) cosmicMood = 'grounded';
            
            return {
                title: data.title,
                explanation: data.explanation?.substring(0, 200) + '...',
                imageUrl: data.url,
                cosmicMood,
                date: data.date
            };
        } catch (error) {
            console.error('NASA APOD error:', error.message);
            return null;
        }
    }

    /**
     * Sunrise-Sunset API
     */
    async fetchSunriseSunset() {
        try {
            const { lat, lon, name } = this.todaysCity;
            const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`;
            const response = await fetch(url);
            const data = await response.json();
            
            const now = new Date();
            const sunrise = new Date(data.results?.sunrise);
            const sunset = new Date(data.results?.sunset);
            
            return {
                city: name,
                sunrise: data.results?.sunrise,
                sunset: data.results?.sunset,
                dayLength: data.results?.day_length,
                isDaytime: now > sunrise && now < sunset,
                solarPhase: this.getSolarPhase(now, sunrise, sunset)
            };
        } catch (error) {
            console.error('Sunrise-Sunset error:', error.message);
            return null;
        }
    }

    getSolarPhase(now, sunrise, sunset) {
        const hour = now.getUTCHours();
        if (hour >= 5 && hour < 8) return 'dawn';
        if (hour >= 8 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 20) return 'dusk';
        return 'night';
    }

    /**
     * USGS Earthquake API
     */
    async fetchEarthquakes() {
        try {
            const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson';
            const response = await fetch(url);
            const data = await response.json();
            
            const quakes = data.features || [];
            const maxMagnitude = quakes.length > 0 
                ? Math.max(...quakes.map(q => q.properties?.mag || 0))
                : 0;
            
            return {
                count: quakes.length,
                maxMagnitude,
                recent: quakes.slice(0, 3).map(q => ({
                    place: q.properties?.place,
                    magnitude: q.properties?.mag,
                    time: q.properties?.time
                })),
                nervousness: maxMagnitude > 6 ? 'very nervous' : maxMagnitude > 4 ? 'slightly nervous' : 'stable'
            };
        } catch (error) {
            console.error('Earthquake API error:', error.message);
            return null;
        }
    }

    // ============== 🗣️ THE VOICE (Communication) ==============

    /**
     * JokeAPI
     */
    async fetchJoke() {
        try {
            const url = 'https://v2.jokeapi.dev/joke/Programming,Pun?safe-mode';
            const response = await fetch(url);
            const data = await response.json();
            
            return {
                type: data.type,
                joke: data.type === 'single' 
                    ? data.joke 
                    : `${data.setup} ... ${data.delivery}`,
                category: data.category
            };
        } catch (error) {
            console.error('Joke API error:', error.message);
            return null;
        }
    }

    /**
     * Quotes API - Using multiple fallback sources
     */
    async fetchQuote() {
        // Curated fallback quotes (always works)
        const fallbacks = [
            { content: "The only true wisdom is in knowing you know nothing.", author: "Socrates" },
            { content: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
            { content: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
            { content: "The unexamined life is not worth living.", author: "Socrates" },
            { content: "Happiness is not something ready made. It comes from your own actions.", author: "Dalai Lama" },
            { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { content: "In three words I can sum up everything I've learned about life: it goes on.", author: "Robert Frost" },
            { content: "The mind is everything. What you think you become.", author: "Buddha" },
            { content: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
            { content: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
            { content: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
            { content: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
            { content: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
            { content: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
            { content: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" }
        ];
        
        try {
            // Try DummyJSON quotes API (reliable)
            const response = await fetchWithTimeout('https://dummyjson.com/quotes/random', {}, 3000);
            const data = await response.json();
            
            if (data.quote && data.author) {
                return {
                    content: data.quote,
                    author: data.author,
                    tags: ['wisdom']
                };
            }
            throw new Error('Invalid response');
        } catch (error) {
            console.log('Quote API unavailable, using curated fallback');
            // Use date-seeded selection for variety
            const today = new Date();
            const index = (today.getDate() + today.getHours()) % fallbacks.length;
            return fallbacks[index];
        }
    }

    /**
     * Advice Slip API
     */
    async fetchAdvice() {
        try {
            const url = 'https://api.adviceslip.com/advice';
            const response = await fetch(url);
            const text = await response.text();
            const data = JSON.parse(text);
            
            return {
                advice: data.slip?.advice,
                id: data.slip?.id
            };
        } catch (error) {
            console.error('Advice API error:', error.message);
            return { advice: "Trust the process." };
        }
    }

    /**
     * Free Dictionary API - Word of the Day
     */
    async fetchWordDefinition() {
        try {
            // Mood-based words
            const moodWords = [
                'serendipity', 'melancholy', 'ephemeral', 'luminous', 'ethereal',
                'resilient', 'enigmatic', 'nostalgic', 'euphoria', 'solitude',
                'wanderlust', 'sublime', 'tranquil', 'tempest', 'zenith'
            ];
            
            const today = new Date();
            const wordIndex = (today.getDate() + today.getMonth()) % moodWords.length;
            const word = moodWords[wordIndex];
            
            const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
            const response = await fetch(url);
            const data = await response.json();
            
            return {
                word,
                definition: data[0]?.meanings[0]?.definitions[0]?.definition,
                partOfSpeech: data[0]?.meanings[0]?.partOfSpeech,
                phonetic: data[0]?.phonetic
            };
        } catch (error) {
            console.error('Dictionary API error:', error.message);
            return { word: 'mysterious', definition: 'full of mystery' };
        }
    }

    /**
     * Numbers API - With comprehensive fallback facts
     */
    async fetchNumberFact() {
        const vibeScore = Math.floor(Math.random() * 100);
        
        // Curated number facts for common vibe scores
        const numberFacts = {
            0: "0 is the only number that cannot be represented in Roman numerals.",
            1: "1 is the only number that is neither prime nor composite.",
            7: "7 is considered a lucky number in many cultures around the world.",
            10: "10 is the base of our decimal system, inspired by our 10 fingers.",
            12: "12 is a highly composite number, divisible by 1, 2, 3, 4, 6, and 12.",
            13: "13 is considered unlucky in Western cultures but lucky in Italy.",
            21: "21 is the sum of the first six natural numbers (1+2+3+4+5+6).",
            23: "23 is the smallest prime number that consists of consecutive digits.",
            42: "42 is the Answer to the Ultimate Question of Life, the Universe, and Everything.",
            50: "50 is the smallest number that can be written as the sum of two squares in two ways.",
            64: "64 is the number of squares on a chess board.",
            73: "73 is considered the best number by Sheldon Cooper in The Big Bang Theory.",
            99: "99 is the largest two-digit number in the decimal system.",
            100: "100 is a perfect square and the basis of percentages."
        };
        
        // Generate a fact for any number
        const generateFact = (n) => {
            if (numberFacts[n]) return numberFacts[n];
            if (n % 10 === 0) return `${n} is a round number, divisible by 10.`;
            if (n % 7 === 0) return `${n} is divisible by the lucky number 7.`;
            if (this.isPrime(n)) return `${n} is a prime number, divisible only by 1 and itself.`;
            if (n % 2 === 0) return `${n} is an even number.`;
            return `${n} is an odd number with its own unique properties.`;
        };
        
        try {
            const response = await fetchWithTimeout(`http://numbersapi.com/${vibeScore}?json`, {}, 2000);
            const data = await response.json();
            
            return {
                number: vibeScore,
                fact: data.text || generateFact(vibeScore),
                type: data.type || 'trivia'
            };
        } catch (error) {
            console.log('Numbers API unavailable, using local fact');
            return {
                number: vibeScore,
                fact: generateFact(vibeScore),
                type: 'trivia'
            };
        }
    }
    
    isPrime(n) {
        if (n < 2) return false;
        for (let i = 2; i <= Math.sqrt(n); i++) {
            if (n % i === 0) return false;
        }
        return true;
    }

    // ============== 🎨 THE CULTURE (Fluff & Fun) ==============

    /**
     * PokeAPI - Spirit Animal
     */
    async fetchPokemon() {
        try {
            const pokemonId = Math.floor(Math.random() * 898) + 1;
            const url = `https://pokeapi.co/api/v2/pokemon/${pokemonId}`;
            const response = await fetch(url);
            const data = await response.json();
            
            return {
                name: data.name,
                id: data.id,
                sprite: data.sprites?.front_default,
                types: data.types?.map(t => t.type.name),
                color: data.types?.[0]?.type?.name
            };
        } catch (error) {
            console.error('Pokemon API error:', error.message);
            return null;
        }
    }

    /**
     * Open Library API
     */
    async fetchBook() {
        try {
            const subjects = ['philosophy', 'science_fiction', 'poetry', 'psychology', 'adventure'];
            const subject = subjects[new Date().getDay() % subjects.length];
            
            const url = `https://openlibrary.org/subjects/${subject}.json?limit=10`;
            const response = await fetch(url);
            const data = await response.json();
            
            const works = data.works || [];
            const randomBook = works[Math.floor(Math.random() * works.length)];
            
            return {
                title: randomBook?.title,
                author: randomBook?.authors?.[0]?.name,
                subject,
                coverId: randomBook?.cover_id,
                coverUrl: randomBook?.cover_id 
                    ? `https://covers.openlibrary.org/b/id/${randomBook.cover_id}-M.jpg`
                    : null
            };
        } catch (error) {
            console.error('Open Library error:', error.message);
            return { title: "The Hitchhiker's Guide to the Galaxy", author: "Douglas Adams" };
        }
    }

    /**
     * TheCocktailDB
     */
    async fetchCocktail() {
        try {
            const url = 'https://www.thecocktaildb.com/api/json/v1/1/random.php';
            const response = await fetch(url);
            const data = await response.json();
            
            const drink = data.drinks?.[0];
            
            return {
                name: drink?.strDrink,
                category: drink?.strCategory,
                glass: drink?.strGlass,
                instructions: drink?.strInstructions?.substring(0, 150) + '...',
                image: drink?.strDrinkThumb,
                isAlcoholic: drink?.strAlcoholic === 'Alcoholic'
            };
        } catch (error) {
            console.error('Cocktail API error:', error.message);
            return { name: "Water", instructions: "Pour. Drink. Hydrate." };
        }
    }

    /**
     * Wayback Machine - Website from 10 years ago
     */
    async fetchWaybackMachine() {
        try {
            const tenYearsAgo = new Date();
            tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
            const timestamp = tenYearsAgo.toISOString().split('T')[0].replace(/-/g, '');
            
            const sites = ['google.com', 'twitter.com', 'reddit.com', 'youtube.com', 'amazon.com'];
            const site = sites[new Date().getDate() % sites.length];
            
            const url = `https://archive.org/wayback/available?url=${site}&timestamp=${timestamp}`;
            const response = await fetch(url);
            const data = await response.json();
            
            return {
                originalSite: site,
                archiveUrl: data.archived_snapshots?.closest?.url,
                archiveDate: data.archived_snapshots?.closest?.timestamp,
                available: data.archived_snapshots?.closest?.available
            };
        } catch (error) {
            console.error('Wayback Machine error:', error.message);
            return null;
        }
    }

    /**
     * Agify - Age prediction
     */
    async fetchAgify() {
        try {
            const names = ['Zeitgeist', 'Data', 'Pixel', 'Binary', 'Cloud', 'Cyber', 'Neo'];
            const name = names[new Date().getDate() % names.length];
            
            const url = `https://api.agify.io?name=${name}`;
            const response = await fetch(url);
            const data = await response.json();
            
            return {
                name: data.name,
                predictedAge: data.age,
                maturityLevel: data.age > 40 ? 'wise' : data.age > 25 ? 'mature' : 'youthful'
            };
        } catch (error) {
            console.error('Agify error:', error.message);
            return { predictedAge: 25, maturityLevel: 'eternal' };
        }
    }
}

module.exports = ChaosEngine;
