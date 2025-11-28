/**
 * CHAOS ENGINE - Browser Version
 * Fetches data from 20 APIs directly in the browser
 * For GitHub Pages static hosting
 */

class ChaosEngine {
    constructor() {
        this.cache = new Map();
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes
        
        // Interaction counts stored in localStorage
        this.interactions = this.loadInteractions();
    }

    loadInteractions() {
        try {
            const saved = localStorage.getItem('zeitgeist_interactions');
            return saved ? JSON.parse(saved) : { comfort: 0, agitate: 0 };
        } catch {
            return { comfort: 0, agitate: 0 };
        }
    }

    saveInteractions() {
        try {
            localStorage.setItem('zeitgeist_interactions', JSON.stringify(this.interactions));
        } catch (e) {
            console.warn('Could not save interactions:', e);
        }
    }

    async fetchWithTimeout(url, timeout = 5000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            throw error;
        }
    }

    getCached(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
            return cached.data;
        }
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, { data, timestamp: Date.now() });
    }

    // Get a random city for weather
    getRandomCity() {
        const cities = [
            { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
            { name: 'New York', lat: 40.7128, lon: -74.0060 },
            { name: 'London', lat: 51.5074, lon: -0.1278 },
            { name: 'Paris', lat: 48.8566, lon: 2.3522 },
            { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
            { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
            { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
            { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
            { name: 'Cairo', lat: 30.0444, lon: 31.2357 },
            { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 }
        ];
        return cities[Math.floor(Math.random() * cities.length)];
    }

    async fetchAllData() {
        const cached = this.getCached('allData');
        if (cached) return cached;

        console.log('🧠 Fetching fresh data from the Chaos Engine...');
        
        const city = this.getRandomCity();
        
        const results = await Promise.allSettled([
            this.fetchWeather(city),
            this.fetchCrypto(),
            this.fetchHackerNews(),
            this.fetchNASA(),
            this.fetchSunriseSunset(city),
            this.fetchEarthquakes(),
            this.fetchJoke(),
            this.fetchQuote(),
            this.fetchAdvice(),
            this.fetchDictionary(),
            this.fetchNumbers(),
            this.fetchPokemon(),
            this.fetchBook(),
            this.fetchCocktail(),
            this.fetchWayback(),
            this.fetchAgify()
        ]);

        const data = {
            city,
            weather: results[0].status === 'fulfilled' ? results[0].value : null,
            crypto: results[1].status === 'fulfilled' ? results[1].value : null,
            hackerNews: results[2].status === 'fulfilled' ? results[2].value : null,
            nasa: results[3].status === 'fulfilled' ? results[3].value : null,
            sun: results[4].status === 'fulfilled' ? results[4].value : null,
            earthquakes: results[5].status === 'fulfilled' ? results[5].value : null,
            joke: results[6].status === 'fulfilled' ? results[6].value : null,
            quote: results[7].status === 'fulfilled' ? results[7].value : null,
            advice: results[8].status === 'fulfilled' ? results[8].value : null,
            dictionary: results[9].status === 'fulfilled' ? results[9].value : null,
            numbers: results[10].status === 'fulfilled' ? results[10].value : null,
            pokemon: results[11].status === 'fulfilled' ? results[11].value : null,
            book: results[12].status === 'fulfilled' ? results[12].value : null,
            cocktail: results[13].status === 'fulfilled' ? results[13].value : null,
            wayback: results[14].status === 'fulfilled' ? results[14].value : null,
            agify: results[15].status === 'fulfilled' ? results[15].value : null,
            interactions: this.interactions
        };

        this.setCache('allData', data);
        return data;
    }

    async fetchWeather(city) {
        try {
            const res = await this.fetchWithTimeout(
                `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`
            );
            const data = await res.json();
            return {
                temperature: data.current_weather?.temperature,
                windspeed: data.current_weather?.windspeed,
                weathercode: data.current_weather?.weathercode
            };
        } catch (e) {
            console.warn('Weather fetch failed:', e);
            return { temperature: 20, windspeed: 10, weathercode: 0 };
        }
    }

    async fetchCrypto() {
        try {
            const res = await this.fetchWithTimeout(
                'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true'
            );
            const data = await res.json();
            return {
                bitcoin_price: data.bitcoin?.usd,
                bitcoin_change_24h: data.bitcoin?.usd_24h_change,
                ethereum_price: data.ethereum?.usd,
                ethereum_change_24h: data.ethereum?.usd_24h_change
            };
        } catch (e) {
            console.warn('Crypto fetch failed:', e);
            return { bitcoin_price: 50000, bitcoin_change_24h: 0 };
        }
    }

    async fetchHackerNews() {
        try {
            const res = await this.fetchWithTimeout('https://hacker-news.firebaseio.com/v0/topstories.json');
            const ids = await res.json();
            const topIds = ids.slice(0, 5);
            
            const stories = await Promise.all(
                topIds.map(async (id) => {
                    const storyRes = await this.fetchWithTimeout(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
                    return storyRes.json();
                })
            );
            
            return {
                top_stories: stories.map(s => ({ title: s?.title, score: s?.score, url: s?.url })),
                average_score: stories.reduce((sum, s) => sum + (s?.score || 0), 0) / stories.length
            };
        } catch (e) {
            console.warn('HN fetch failed:', e);
            return { top_stories: [], average_score: 100 };
        }
    }

    async fetchNASA() {
        try {
            // Using NASA APOD without API key (demo mode)
            const res = await this.fetchWithTimeout('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
            const data = await res.json();
            return {
                title: data.title,
                explanation: data.explanation?.substring(0, 200),
                url: data.url,
                media_type: data.media_type
            };
        } catch (e) {
            console.warn('NASA fetch failed:', e);
            return {
                title: 'Cosmic Mystery',
                explanation: 'The universe contemplates itself...',
                url: 'https://apod.nasa.gov/apod/image/2311/Horsehead_Hubble_960.jpg',
                media_type: 'image'
            };
        }
    }

    async fetchSunriseSunset(city) {
        try {
            const res = await this.fetchWithTimeout(
                `https://api.sunrise-sunset.org/json?lat=${city.lat}&lng=${city.lon}&formatted=0`
            );
            const data = await res.json();
            return {
                sunrise: data.results?.sunrise,
                sunset: data.results?.sunset,
                day_length: data.results?.day_length
            };
        } catch (e) {
            console.warn('Sun fetch failed:', e);
            return { sunrise: '06:00', sunset: '18:00', day_length: 43200 };
        }
    }

    async fetchEarthquakes() {
        try {
            const res = await this.fetchWithTimeout(
                'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson'
            );
            const data = await res.json();
            const quakes = data.features || [];
            return {
                recent_count: quakes.length,
                strongest: quakes[0]?.properties?.mag,
                locations: quakes.slice(0, 3).map(q => ({
                    place: q.properties?.place,
                    magnitude: q.properties?.mag
                }))
            };
        } catch (e) {
            console.warn('Earthquake fetch failed:', e);
            return { recent_count: 0, strongest: 0, locations: [] };
        }
    }

    async fetchJoke() {
        try {
            const res = await this.fetchWithTimeout('https://v2.jokeapi.dev/joke/Any?safe-mode');
            const data = await res.json();
            if (data.type === 'single') {
                return { joke: data.joke, category: data.category };
            } else {
                return { joke: `${data.setup} ... ${data.delivery}`, category: data.category };
            }
        } catch (e) {
            console.warn('Joke fetch failed:', e);
            return { joke: 'Why did the API fail? Because it had too many requests!', category: 'Programming' };
        }
    }

    async fetchQuote() {
        const fallbackQuotes = [
            { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { content: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
            { content: "Stay hungry, stay foolish.", author: "Steve Jobs" },
            { content: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
            { content: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
            { content: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
            { content: "The purpose of our lives is to be happy.", author: "Dalai Lama" },
            { content: "Get busy living or get busy dying.", author: "Stephen King" },
            { content: "You only live once, but if you do it right, once is enough.", author: "Mae West" },
            { content: "The mind is everything. What you think you become.", author: "Buddha" }
        ];
        
        try {
            const res = await this.fetchWithTimeout('https://dummyjson.com/quotes/random', 3000);
            const data = await res.json();
            return { content: data.quote, author: data.author };
        } catch (e) {
            console.warn('Quote fetch failed, using fallback');
            return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        }
    }

    async fetchAdvice() {
        try {
            const res = await this.fetchWithTimeout('https://api.adviceslip.com/advice');
            const data = await res.json();
            return { advice: data.slip?.advice, id: data.slip?.id };
        } catch (e) {
            console.warn('Advice fetch failed:', e);
            return { advice: 'Embrace the chaos of existence.', id: 0 };
        }
    }

    async fetchDictionary() {
        const words = ['serendipity', 'ephemeral', 'luminous', 'ethereal', 'mellifluous', 
                       'petrichor', 'vellichor', 'sonder', 'kenopsia', 'chrysalism'];
        const word = words[Math.floor(Math.random() * words.length)];
        
        try {
            const res = await this.fetchWithTimeout(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            const data = await res.json();
            return {
                word: data[0]?.word,
                definition: data[0]?.meanings[0]?.definitions[0]?.definition,
                partOfSpeech: data[0]?.meanings[0]?.partOfSpeech
            };
        } catch (e) {
            console.warn('Dictionary fetch failed:', e);
            return { word, definition: 'A beautiful word awaiting discovery', partOfSpeech: 'noun' };
        }
    }

    async fetchNumbers() {
        const fallbackFacts = [
            { number: 42, fact: "42 is the Answer to the Ultimate Question of Life, the Universe, and Everything." },
            { number: 7, fact: "7 is considered a lucky number in many cultures around the world." },
            { number: 13, fact: "13 is the number of Archimedean solids." },
            { number: 100, fact: "100 is the sum of the first nine prime numbers." },
            { number: 365, fact: "365 is the number of days in a common year." },
            { number: 88, fact: "88 is the number of keys on a standard piano." },
            { number: 64, fact: "64 is the number of squares on a chess board." },
            { number: 206, fact: "206 is the number of bones in the adult human body." }
        ];
        
        const num = Math.floor(Math.random() * 100) + 1;
        
        try {
            const res = await this.fetchWithTimeout(`http://numbersapi.com/${num}/trivia`, 2000);
            const text = await res.text();
            return { number: num, fact: text };
        } catch (e) {
            console.warn('Numbers API unavailable, using local fact');
            return fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
        }
    }

    async fetchPokemon() {
        const randomId = Math.floor(Math.random() * 151) + 1;
        try {
            const res = await this.fetchWithTimeout(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
            const data = await res.json();
            return {
                name: data.name,
                id: data.id,
                sprite: data.sprites?.front_default,
                types: data.types?.map(t => t.type.name)
            };
        } catch (e) {
            console.warn('Pokemon fetch failed:', e);
            return { name: 'MissingNo', id: 0, sprite: '', types: ['glitch'] };
        }
    }

    async fetchBook() {
        const subjects = ['science_fiction', 'philosophy', 'poetry', 'adventure', 'mystery'];
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        
        try {
            const res = await this.fetchWithTimeout(
                `https://openlibrary.org/subjects/${subject}.json?limit=5`
            );
            const data = await res.json();
            const book = data.works?.[Math.floor(Math.random() * data.works.length)];
            return {
                title: book?.title,
                author: book?.authors?.[0]?.name,
                subject: subject
            };
        } catch (e) {
            console.warn('Book fetch failed:', e);
            return { title: 'The Infinite Library', author: 'Jorge Luis Borges', subject: 'philosophy' };
        }
    }

    async fetchCocktail() {
        try {
            const res = await this.fetchWithTimeout('https://www.thecocktaildb.com/api/json/v1/1/random.php');
            const data = await res.json();
            const drink = data.drinks?.[0];
            return {
                name: drink?.strDrink,
                category: drink?.strCategory,
                glass: drink?.strGlass,
                image: drink?.strDrinkThumb
            };
        } catch (e) {
            console.warn('Cocktail fetch failed:', e);
            return { name: 'Digital Martini', category: 'Cocktail', glass: 'Martini Glass', image: '' };
        }
    }

    async fetchWayback() {
        const sites = ['google.com', 'yahoo.com', 'amazon.com', 'ebay.com', 'cnn.com'];
        const site = sites[Math.floor(Math.random() * sites.length)];
        const tenYearsAgo = new Date();
        tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
        const timestamp = tenYearsAgo.toISOString().split('T')[0].replace(/-/g, '');
        
        return {
            originalSite: site,
            archiveUrl: `https://web.archive.org/web/${timestamp}/${site}`,
            timestamp: timestamp
        };
    }

    async fetchAgify() {
        const names = ['alex', 'jordan', 'taylor', 'morgan', 'casey', 'riley', 'quinn', 'avery'];
        const name = names[Math.floor(Math.random() * names.length)];
        
        try {
            const res = await this.fetchWithTimeout(`https://api.agify.io?name=${name}`);
            const data = await res.json();
            return { name: data.name, age: data.age, count: data.count };
        } catch (e) {
            console.warn('Agify fetch failed:', e);
            return { name, age: 30, count: 1000 };
        }
    }

    getRobohash(seed) {
        return `https://robohash.org/${seed}?set=set4&size=200x200`;
    }

    getPollinationsImage(prompt) {
        const encodedPrompt = encodeURIComponent(prompt);
        return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&nologo=true`;
    }

    getQRCode(data) {
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
    }

    // Interaction methods
    addInteraction(type) {
        if (type === 'comfort' || type === 'agitate') {
            this.interactions[type]++;
            this.saveInteractions();
            // Clear cache to reflect new state
            this.cache.delete('allData');
        }
        return this.interactions;
    }

    getInteractions() {
        return this.interactions;
    }
}

// Export for use
window.ChaosEngine = ChaosEngine;
