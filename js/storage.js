/* =========================================================================
   storage.js — Persistencia local (localStorage)
   Guarda progreso, puntuaciones, insignias, estadísticas y configuración.
   ========================================================================= */

const STORAGE_KEY = "gvsj_save_v1";

function defaultState() {
  return {
    version: 1,
    createdAt: Date.now(),
    settings: { audio: true, reduceMotion: false },
    stats: {
      totalScore: 0,
      bestQuickChallenge: 0,
      bestStreak: 0,
      totalAnswered: 0,
      totalCorrect: 0,
      correctByLetter: { G: 0, J: 0 },
      exceptionsCorrect: 0,
      ruleStats: {},          // ruleId -> { correct, wrong }
      categoryStats: {}       // context -> { correct, wrong }
    },
    levels: {},                // levelId -> { completed, bestAccuracy, stars }
    badges: [],                 // array of badge ids earned
    finalBossCompleted: false,
    meaningPerfectRun: false,
    gueGuiPerfectRun: false,
    usedWords: [],
    usedTextIds: []
  };
}

const Storage = {
  _cache: null,

  load() {
    if (this._cache) return this._cache;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this._cache = defaultState();
        return this._cache;
      }
      const parsed = JSON.parse(raw);
      // merge with defaults to survive future additions
      this._cache = Object.assign(defaultState(), parsed);
      this._cache.stats = Object.assign(defaultState().stats, parsed.stats || {});
      this._cache.stats.correctByLetter = Object.assign({ G: 0, J: 0 }, (parsed.stats || {}).correctByLetter || {});
      this._cache.usedWords = parsed.usedWords || [];
      this._cache.usedTextIds = parsed.usedTextIds || [];
      return this._cache;
    } catch (e) {
      console.warn("No se pudo leer el progreso guardado, se inicia uno nuevo.", e);
      this._cache = defaultState();
      return this._cache;
    }
  },

  save() {
    if (!this._cache) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._cache));
    } catch (e) {
      console.warn("No se pudo guardar el progreso.", e);
    }
  },

  reset() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* noop */ }
    this._cache = defaultState();
    this.save();
    return this._cache;
  },

  recordAnswer({ correct, letter, isException, ruleId, context }) {
    const s = this.load();
    s.stats.totalAnswered++;
    if (correct) {
      s.stats.totalCorrect++;
      if (letter && s.stats.correctByLetter[letter] !== undefined) s.stats.correctByLetter[letter]++;
      if (isException) s.stats.exceptionsCorrect++;
    }
    if (ruleId) {
      if (!s.stats.ruleStats[ruleId]) s.stats.ruleStats[ruleId] = { correct: 0, wrong: 0 };
      s.stats.ruleStats[ruleId][correct ? "correct" : "wrong"]++;
    }
    if (context) {
      if (!s.stats.categoryStats[context]) s.stats.categoryStats[context] = { correct: 0, wrong: 0 };
      s.stats.categoryStats[context][correct ? "correct" : "wrong"]++;
    }
    this.save();
  },

  getUsedWords() {
    return this.load().usedWords || [];
  },

  getUsedTexts() {
    return this.load().usedTextIds || [];
  },

  markWordAsUsed(word) {
    const s = this.load();
    if (!s.usedWords) s.usedWords = [];
    if (!s.usedWords.includes(word)) {
      s.usedWords.push(word);
      const totalAvailable = (typeof WORDS !== "undefined") ? WORDS.length : 300;
      if (s.usedWords.length >= Math.max(10, totalAvailable - 5)) {
        s.usedWords = [];
      }
      this.save();
    }
  },

  markTextAsUsed(id) {
    if (!id) return;
    const s = this.load();
    if (!s.usedTextIds) s.usedTextIds = [];
    if (!s.usedTextIds.includes(id)) {
      s.usedTextIds.push(id);
      // Para textos, como hay menos, reseteamos cuando queden pocos.
      const totalTexts = (typeof TEXT_CHALLENGES !== "undefined") ? TEXT_CHALLENGES.length : 20;
      if (s.usedTextIds.length >= Math.max(1, totalTexts - 2)) {
        s.usedTextIds = [];
      }
      this.save();
    }
  },

  recordLevelResult(levelId, accuracy, stars) {
    const s = this.load();
    const prev = s.levels[levelId] || { completed: false, bestAccuracy: 0, stars: 0 };
    s.levels[levelId] = {
      completed: true,
      bestAccuracy: Math.max(prev.bestAccuracy, accuracy),
      stars: Math.max(prev.stars, stars)
    };
    this.save();
  },

  addScore(points) {
    const s = this.load();
    s.stats.totalScore += points;
    this.save();
  },

  updateBestStreak(streak) {
    const s = this.load();
    if (streak > s.stats.bestStreak) { s.stats.bestStreak = streak; this.save(); }
  },

  updateBestQuick(score) {
    const s = this.load();
    if (score > s.stats.bestQuickChallenge) { s.stats.bestQuickChallenge = score; this.save(); }
  },

  awardBadge(id) {
    const s = this.load();
    if (!s.badges.includes(id)) { s.badges.push(id); this.save(); return true; }
    return false;
  },

  weakestRules(limit = 3) {
    const s = this.load();
    const arr = Object.entries(s.stats.ruleStats)
      .map(([ruleId, v]) => ({ ruleId, total: v.correct + v.wrong, wrong: v.wrong, ratio: v.wrong / Math.max(1, v.correct + v.wrong) }))
      .filter(r => r.total >= 2 && r.wrong > 0)
      .sort((a, b) => b.ratio - a.ratio || b.wrong - a.wrong);
    return arr.slice(0, limit);
  }
};
