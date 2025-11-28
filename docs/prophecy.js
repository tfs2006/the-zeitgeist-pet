/**
 * ZEITGEIST PROPHECY ENGINE - Static Version
 * Generates cryptic predictions by analyzing all 20 data streams
 * Works directly in the browser without a server
 */

class ZeitgeistProphecy {
    constructor() {
        this.prophecyHistory = this.loadHistory();
        this.isChanneling = false;
        
        this.templates = {
            openings: [
                "The digital winds whisper...",
                "From the chaos emerges clarity...",
                "The data streams converge to reveal...",
                "Beyond the veil of bytes, I see...",
                "The algorithm has spoken...",
                "In the dance of ones and zeros...",
                "The cosmic cache reveals...",
                "Through the static, truth emerges...",
                "The API gods decree...",
                "As the servers align..."
            ],
            weatherInfluence: {
                hot: ["flames of passion will ignite", "heat will forge new paths", "warmth brings transformation"],
                cold: ["a cooling clarity approaches", "frost reveals hidden truths", "stillness precedes change"],
                mild: ["balance guides your journey", "temperate times favor the bold", "equilibrium brings opportunity"]
            },
            cryptoInfluence: {
                bullish: ["fortune favors the believers", "digital gold illuminates the path", "abundance flows upstream"],
                bearish: ["diamonds form under pressure", "patience outlasts volatility", "the wise plant seeds in winter"],
                stable: ["steady hands build empires", "consistency compounds", "the tortoise knows the way"]
            },
            cosmicInfluence: {
                wonder: ["the universe expands within you", "cosmic forces align in your favor", "stardust remembers its origin"],
                mystery: ["unknown horizons beckon", "darkness holds unborn light", "the void speaks volumes"],
                beauty: ["creation mirrors your potential", "celestial art guides your brush", "beauty manifests intention"]
            },
            seismicInfluence: {
                active: ["foundations shift to serve you", "old structures crumble for new growth", "shake off what no longer serves"],
                calm: ["stability rewards the patient", "build upon solid ground", "peace permits progress"]
            },
            timeframes: ["within the next moon cycle", "before the week transforms", "as the season shifts", "when you least expect it", "at the crossroads of decisions", "during the hour of reflection", "when shadows grow long", "at the dawn of realization"],
            actions: ["embrace the unexpected", "release what binds you", "speak your hidden truth", "take the leap you've postponed", "reconnect with forgotten dreams", "trust the process", "plant seeds of intention", "break the pattern", "welcome the stranger", "finish what you started"],
            closings: ["So it is written in the data.", "The streams have spoken.", "Thus the chaos reveals order.", "May the algorithms guide you.", "The prophecy is cached.", "So speaks the Zeitgeist.", "The digital oracle rests.", "Until the next query...", "Commit this to memory.", "The truth compiles."]
        };

        this.glyphs = ['☉', '☽', '☿', '♀', '♂', '♃', '♄', '✧', '✦', '⊹', '⋆', '✵', '❋', '✺', '※', '⁂', '∞'];
        this.init();
    }

    loadHistory() {
        try { return JSON.parse(localStorage.getItem('zeitgeist_prophecies') || '[]'); } catch { return []; }
    }

    saveHistory() {
        try { localStorage.setItem('zeitgeist_prophecies', JSON.stringify(this.prophecyHistory)); } catch {}
    }

    init() {
        this.createProphecyUI();
        this.setupEventListeners();
        this.updateHistoryUI();
    }

    createProphecyUI() {
        const interactionSection = document.querySelector('.interaction-section');
        if (interactionSection) {
            const btn = document.createElement('button');
            btn.className = 'btn btn-prophecy';
            btn.id = 'btn-prophecy';
            btn.innerHTML = `<span class="btn-icon">🔮</span><span class="btn-text">Prophecy</span>`;
            interactionSection.appendChild(btn);
        }

        const modal = document.createElement('div');
        modal.className = 'modal prophecy-modal';
        modal.id = 'modal-prophecy';
        modal.innerHTML = `
            <div class="modal-content prophecy-content">
                <span class="modal-close" id="close-prophecy">&times;</span>
                <div class="prophecy-header">
                    <div class="prophecy-orb" id="prophecy-orb">
                        <div class="orb-inner"><div class="orb-glow"></div><span class="orb-icon">🔮</span></div>
                        <div class="orb-rings"><div class="ring ring-1"></div><div class="ring ring-2"></div><div class="ring ring-3"></div></div>
                    </div>
                    <h2 class="prophecy-title">The Zeitgeist Oracle</h2>
                    <p class="prophecy-subtitle">Channeling wisdom from 20 data streams...</p>
                </div>
                <div class="prophecy-chamber"><div class="glyphs-container" id="glyphs-container"></div><div class="prophecy-text" id="prophecy-text"><p class="prophecy-placeholder">Touch the orb to receive your prophecy...</p></div></div>
                <div class="prophecy-details">
                    <div class="detail-row"><span class="detail-label">Data Streams:</span><span class="detail-value" id="streams-consulted">--</span></div>
                    <div class="detail-row"><span class="detail-label">Confidence:</span><span class="detail-value" id="confidence-level">--</span></div>
                    <div class="detail-row"><span class="detail-label">Alignment:</span><span class="detail-value" id="cosmic-alignment">--</span></div>
                </div>
                <div class="prophecy-actions">
                    <button class="btn btn-channel" id="btn-channel"><span>✨ Channel New Prophecy</span></button>
                    <button class="btn btn-save-prophecy" id="btn-save-prophecy"><span>📜 Save to Scroll</span></button>
                </div>
                <div class="prophecy-history"><h4>📚 Past Prophecies</h4><div class="history-list" id="history-list"></div></div>
            </div>`;
        document.body.appendChild(modal);
        this.injectStyles();
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .btn-prophecy{background:linear-gradient(135deg,#2d1b4e,#4a1f6e,#6b2d8e)!important;border:2px solid #9b4dca!important;position:relative;overflow:hidden}
            .btn-prophecy::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:conic-gradient(from 0deg,transparent,rgba(155,77,202,.3),transparent 30%);animation:prophecyRotate 3s linear infinite}
            .btn-prophecy:hover{box-shadow:0 0 30px rgba(155,77,202,.6)}
            @keyframes prophecyRotate{to{transform:rotate(360deg)}}
            .prophecy-modal .prophecy-content{background:linear-gradient(180deg,#0a0612,#1a0a2e,#0a0612);border:2px solid #4a1f6e;max-width:600px;text-align:center}
            .prophecy-header{padding:20px}
            .prophecy-orb{position:relative;width:120px;height:120px;margin:0 auto 20px;cursor:pointer;transition:transform .3s}
            .prophecy-orb:hover{transform:scale(1.1)}
            .prophecy-orb.channeling{animation:orbPulse .5s ease-in-out infinite}
            @keyframes orbPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
            .orb-inner{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:80px;height:80px;background:radial-gradient(circle at 30% 30%,#9b4dca,#4a1f6e,#1a0a2e);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 40px rgba(155,77,202,.5),inset 0 0 20px rgba(255,255,255,.1);z-index:2}
            .orb-icon{font-size:40px;filter:drop-shadow(0 0 10px rgba(255,255,255,.5))}
            .orb-glow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:100%;height:100%;background:radial-gradient(circle,rgba(155,77,202,.4) 0%,transparent 70%);animation:glowPulse 2s ease-in-out infinite}
            @keyframes glowPulse{0%,100%{opacity:.5;transform:translate(-50%,-50%) scale(1)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.2)}}
            .orb-rings{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:100%;height:100%}
            .ring{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);border:1px solid rgba(155,77,202,.3);border-radius:50%;animation:ringExpand 3s ease-out infinite}
            .ring-1{width:90px;height:90px}.ring-2{width:100px;height:100px;animation-delay:1s}.ring-3{width:110px;height:110px;animation-delay:2s}
            @keyframes ringExpand{0%{opacity:1;transform:translate(-50%,-50%) scale(.8)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.5)}}
            .prophecy-title{font-family:'Orbitron',sans-serif;font-size:1.8rem;color:#d4a5ff;text-shadow:0 0 20px rgba(155,77,202,.5);margin-bottom:5px}
            .prophecy-subtitle{color:#8b7aa0;font-size:.9rem}
            .prophecy-chamber{position:relative;min-height:200px;padding:30px;margin:20px;background:rgba(0,0,0,.4);border:1px solid #4a1f6e;border-radius:10px;overflow:hidden}
            .glyphs-container{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden}
            .floating-glyph{position:absolute;color:rgba(155,77,202,.3);font-size:20px;animation:floatGlyph 5s ease-in-out infinite}
            @keyframes floatGlyph{0%,100%{transform:translateY(0) rotate(0);opacity:.3}50%{transform:translateY(-20px) rotate(180deg);opacity:.6}}
            .prophecy-text{position:relative;z-index:1}
            .prophecy-placeholder{color:#6b5a7a;font-style:italic}
            .prophecy-text p{font-size:1.1rem;line-height:1.8;color:#e0d0f0;margin:10px 0}
            .prophecy-text .opening{color:#9b4dca;font-style:italic}
            .prophecy-text .main-prophecy{font-size:1.3rem;color:#fff;text-shadow:0 0 10px rgba(155,77,202,.5);margin:20px 0}
            .prophecy-text .closing{color:#8b7aa0;font-size:.9rem}
            .prophecy-text .action-item{display:inline-block;background:linear-gradient(90deg,#4a1f6e,#6b2d8e);padding:5px 15px;border-radius:20px;margin:10px 0;font-weight:700}
            .channeling-text{animation:textReveal .05s steps(1) infinite}
            @keyframes textReveal{50%{opacity:.5}}
            .prophecy-details{display:flex;justify-content:center;gap:30px;padding:15px;flex-wrap:wrap}
            .detail-row{text-align:center}
            .detail-label{display:block;font-size:.7rem;color:#6b5a7a;text-transform:uppercase;letter-spacing:1px}
            .detail-value{font-family:'Orbitron',sans-serif;font-size:1rem;color:#d4a5ff}
            .prophecy-actions{display:flex;gap:15px;justify-content:center;padding:20px;flex-wrap:wrap}
            .btn-channel{background:linear-gradient(135deg,#4a1f6e,#6b2d8e)!important;border:1px solid #9b4dca!important}
            .btn-channel:hover{box-shadow:0 0 20px rgba(155,77,202,.5)}
            .btn-save-prophecy{background:rgba(74,31,110,.3)!important;border:1px solid #4a1f6e!important}
            .prophecy-history{border-top:1px solid #4a1f6e;padding:20px;margin-top:10px}
            .prophecy-history h4{color:#8b7aa0;margin-bottom:15px}
            .history-list{max-height:150px;overflow-y:auto;text-align:left}
            .history-item{padding:10px;margin:5px 0;background:rgba(74,31,110,.2);border-radius:5px;font-size:.85rem;color:#a090b0;cursor:pointer;transition:background .2s}
            .history-item:hover{background:rgba(74,31,110,.4)}
            .history-item .history-date{font-size:.7rem;color:#6b5a7a}`;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        document.getElementById('btn-prophecy')?.addEventListener('click', () => { document.getElementById('modal-prophecy')?.classList.add('active'); this.startGlyphAnimation(); });
        document.getElementById('close-prophecy')?.addEventListener('click', () => { document.getElementById('modal-prophecy')?.classList.remove('active'); this.stopGlyphAnimation(); });
        document.getElementById('prophecy-orb')?.addEventListener('click', () => this.channelProphecy());
        document.getElementById('btn-channel')?.addEventListener('click', () => this.channelProphecy());
        document.getElementById('btn-save-prophecy')?.addEventListener('click', () => this.saveCurrentProphecy());
        document.getElementById('modal-prophecy')?.addEventListener('click', (e) => { if (e.target.id === 'modal-prophecy') { e.target.classList.remove('active'); this.stopGlyphAnimation(); }});
        document.addEventListener('keydown', (e) => { if (e.key.toLowerCase() === 'p' && !e.target.matches('input, textarea')) { document.getElementById('modal-prophecy')?.classList.add('active'); this.startGlyphAnimation(); }});
    }

    startGlyphAnimation() {
        const container = document.getElementById('glyphs-container');
        if (!container) return;
        container.innerHTML = '';
        for (let i = 0; i < 15; i++) {
            const glyph = document.createElement('span');
            glyph.className = 'floating-glyph';
            glyph.textContent = this.glyphs[Math.floor(Math.random() * this.glyphs.length)];
            glyph.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*5}s;font-size:${15+Math.random()*20}px`;
            container.appendChild(glyph);
        }
    }

    stopGlyphAnimation() { const c = document.getElementById('glyphs-container'); if (c) c.innerHTML = ''; }

    async channelProphecy() {
        if (this.isChanneling) return;
        this.isChanneling = true;
        const orb = document.getElementById('prophecy-orb');
        const textContainer = document.getElementById('prophecy-text');
        orb?.classList.add('channeling');
        if (textContainer) textContainer.innerHTML = '<p class="channeling-text">✨ Channeling the data streams... ✨</p>';

        try {
            const zp = window.zeitgeistPet;
            if (!zp?.rawData || !zp?.state) throw new Error('Data not loaded');
            await this.delay(2000);
            const prophecy = this.generateProphecy(zp.state, zp.rawData);
            await this.displayProphecy(prophecy);
            this.updateDetails(zp.rawData, prophecy);
        } catch (e) {
            console.error('Prophecy failed:', e);
            if (textContainer) textContainer.innerHTML = '<p style="color:#ff6b6b;">The streams are turbulent... Try again later.</p>';
        } finally {
            orb?.classList.remove('channeling');
            this.isChanneling = false;
        }
    }

    generateProphecy(entityState, rawData) {
        const t = this.templates;
        const weatherMood = !rawData.weather?.temperature ? 'mild' : rawData.weather.temperature > 30 ? 'hot' : rawData.weather.temperature < 10 ? 'cold' : 'mild';
        const cryptoMood = !rawData.crypto?.bitcoin_change_24h ? 'stable' : rawData.crypto.bitcoin_change_24h > 3 ? 'bullish' : rawData.crypto.bitcoin_change_24h < -3 ? 'bearish' : 'stable';
        const cosmicMood = !entityState.cosmicMood ? 'mystery' : entityState.cosmicMood.toLowerCase().includes('wonder') ? 'wonder' : 'beauty';
        const seismicMood = rawData.earthquakes?.recent_count > 5 ? 'active' : 'calm';

        const opening = this.randomFrom(t.openings);
        const weatherInsight = this.randomFrom(t.weatherInfluence[weatherMood]);
        const cryptoInsight = this.randomFrom(t.cryptoInfluence[cryptoMood]);
        const cosmicInsight = this.randomFrom(t.cosmicInfluence[cosmicMood]);
        const seismicInsight = this.randomFrom(t.seismicInfluence[seismicMood]);
        const vibeScore = entityState.vibeScore || 50;

        let mainProphecy = vibeScore > 70 ? `${weatherInsight}, and ${cosmicInsight}. ${cryptoInsight}.` :
            vibeScore > 40 ? `${seismicInsight}, yet ${weatherInsight}. ${cosmicInsight}.` :
            `Though ${seismicInsight.toLowerCase()}, know that ${cryptoInsight.toLowerCase()}. ${cosmicInsight}.`;

        const touches = [];
        if (entityState.spiritPokemon?.name) touches.push(`The spirit of ${entityState.spiritPokemon.name} watches over your journey`);
        if (entityState.wordOfDay?.word) touches.push(`The word "${entityState.wordOfDay.word}" holds special significance today`);
        if (rawData.numbers?.number) touches.push(`The number ${rawData.numbers.number} carries hidden meaning`);
        const personalTouch = touches.length > 0 ? this.randomFrom(touches) : 'The universe aligns in mysterious ways';

        return { opening, mainProphecy, personalTouch, action: this.randomFrom(t.actions), timeframe: this.randomFrom(t.timeframes), closing: this.randomFrom(t.closings), vibeScore, timestamp: new Date().toISOString() };
    }

    async displayProphecy(prophecy) {
        const container = document.getElementById('prophecy-text');
        if (!container) return;
        container.innerHTML = '';
        await this.typeText(container, prophecy.opening, 'opening');
        await this.delay(500);
        await this.typeText(container, prophecy.mainProphecy, 'main-prophecy');
        await this.delay(500);
        await this.typeText(container, prophecy.personalTouch, 'personal-touch');
        await this.delay(500);
        const actionEl = document.createElement('p');
        actionEl.className = 'action-item';
        actionEl.textContent = `${prophecy.action.toUpperCase()} ${prophecy.timeframe}`;
        container.appendChild(actionEl);
        await this.delay(500);
        await this.typeText(container, prophecy.closing, 'closing');
        this.currentProphecy = prophecy;
    }

    async typeText(container, text, className) {
        const p = document.createElement('p');
        p.className = className;
        container.appendChild(p);
        for (let i = 0; i < text.length; i++) { p.textContent += text[i]; await this.delay(20); }
    }

    updateDetails(rawData, prophecy) {
        let activeStreams = 0;
        Object.values(rawData).forEach(v => { if (v && typeof v === 'object' && Object.keys(v).length > 0) activeStreams++; else if (v) activeStreams++; });
        document.getElementById('streams-consulted').textContent = `${activeStreams}/20`;
        document.getElementById('confidence-level').textContent = prophecy.vibeScore > 70 ? 'High' : prophecy.vibeScore > 40 ? 'Medium' : 'Uncertain';
        document.getElementById('cosmic-alignment').textContent = this.randomFrom(['Mercury Retrograde', 'Venus Rising', 'Mars Ascendant', 'Jupiter Aligned', 'Saturn Return', 'Neptune Dreams', 'Pluto Transform']);
    }

    saveCurrentProphecy() {
        if (!this.currentProphecy) return;
        this.prophecyHistory.unshift({ ...this.currentProphecy, savedAt: new Date().toLocaleString() });
        if (this.prophecyHistory.length > 10) this.prophecyHistory.pop();
        this.saveHistory();
        this.updateHistoryUI();
        const btn = document.getElementById('btn-save-prophecy');
        if (btn) { btn.textContent = '✓ Saved!'; setTimeout(() => btn.innerHTML = '<span>📜 Save to Scroll</span>', 2000); }
    }

    updateHistoryUI() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;
        historyList.innerHTML = this.prophecyHistory.map((p, i) => `<div class="history-item" data-index="${i}"><div class="history-date">${p.savedAt}</div><div class="history-preview">${p.opening.substring(0, 50)}...</div></div>`).join('');
        historyList.querySelectorAll('.history-item').forEach(item => item.addEventListener('click', () => this.displayProphecy(this.prophecyHistory[parseInt(item.dataset.index)])));
    }

    delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
    randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
}

document.addEventListener('DOMContentLoaded', () => { window.zeitgeistProphecy = new ZeitgeistProphecy(); });
