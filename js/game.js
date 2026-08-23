/* =========================================================================
   game.js — Motor del juego
   Genera desafíos, evalúa respuestas, controla puntuación, vidas, racha,
   dificultad adaptativa e insignias. No maneja el DOM directamente.
   ========================================================================= */

const CHALLENGE_TYPES = {
  CHOOSE_LETTER: "choose_letter",     // Desafío 1: _ente -> G/J
  FIX_WORD: "fix_word",               // Desafío 2: escribe la forma correcta
  DETECT_ERROR: "detect_error",       // Desafío 3: oración con palabra incorrecta
  COMPLETE_WORD: "complete_word",     // Desafío 4: prote_er -> G/J
  MATCH_RULE: "match_rule",           // Desafío 5: -aje -> J
  TRAP_WORD: "trap_word",             // Desafío 6: excepciones
  VERB_CHANGE: "verb_change",         // Desafío 7: verbo cambiante
  MEANING: "meaning",                 // Desafío 8: homófonas
  EMAIL_CHECK: "email_check",         // Desafío 9: correo profesional
  APP_CHECK: "app_check",             // Desafío 10: interfaz de app
  SECURITY_CHECK: "security_check",   // Desafío 11: ciberseguridad
  PROGRAMMING_CHECK: "programming_check" // Desafío 12: modo programador
};

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickN(arr, n) {
  return shuffle(arr).slice(0, Math.min(n, arr.length));
}

function findBlankIndex(word, answer) {
  const lower = word.toLowerCase();
  if (answer === "u" || answer === "ü") {
    // Busca la primera u o ü (con diéresis) de la palabra
    const m = lower.match(/[uü]/);
    return m ? m.index : -1;
  }
  return lower.indexOf(answer.toLowerCase());
}

function wordToBlank(word, answer) {
  const idx = findBlankIndex(word, answer);
  if (idx === -1) return { before: "", after: word };
  return { before: word.slice(0, idx), after: word.slice(idx + 1) };
}

/* -------------------------------------------------------------------------
   Pool de palabras y Selección Adaptativa
   ------------------------------------------------------------------------- */
class WordPool {
  constructor(allWords) {
    this.allWords = allWords || [];
  }

  /**
   * Selecciona una palabra basada en dificultad y criterios.
   * @param {number} minD - Dificultad mínima (1-4)
   * @param {number} maxD - Dificultad máxima (1-4)
   * @param {boolean} onlyExceptions - Solo palabras marcadas como isException
   * @param {string[]} excludeWords - Lista de palabras (strings) a evitar
   */
  nextAdaptive(minD, maxD, onlyExceptions = false, excludeWords = []) {
    // 1. Filtrar pool base por dificultad y si es excepción
    let pool = this.allWords.filter(w => {
      const inDifficulty = w.difficulty >= minD && w.difficulty <= maxD;
      const isEx = !!w.isException;
      if (onlyExceptions && !isEx) return false;
      return inDifficulty;
    });

    // 2. Intentar evitar las palabras excluidas (ya usadas en el nivel)
    let candidates = pool.filter(w => !excludeWords.includes(w.word));

    // 3. Fallback: Si no hay candidatos tras exclusión, usamos el pool filtrado original
    if (candidates.length === 0) candidates = pool;

    // 4. Fallback extremo: Si sigue vacío (ej. no hay excepciones en ese rango), relajamos dificultad
    if (candidates.length === 0) {
      candidates = this.allWords.filter(w => onlyExceptions ? !!w.isException : true);
    }
    
    // 5. Seguridad total: Si nada funciona, devolvemos una palabra aleatoria de toda la base
    if (candidates.length === 0) candidates = this.allWords;

    return candidates[Math.floor(Math.random() * candidates.length)];
  }
}

const GlobalPools = {
  _shared: null,
  getShared() {
    if (!this._shared) {
      // WORDS se encuentra definido globalmente en data.js
      this._shared = new WordPool(typeof WORDS !== 'undefined' ? WORDS : []);
    }
    return this._shared;
  }
};

/* -------------------------------------------------------------------------
   Generación de desafíos a partir de un pool de palabras (WORDS)
   ------------------------------------------------------------------------- */
const ChallengeFactory = {
  fromWordChoose(item) {
    const isDiaeresis = item.answer === "u" || item.answer === "ü";
    const blank = wordToBlank(item.word, item.answer);
    return {
      type: CHALLENGE_TYPES.CHOOSE_LETTER,
      prompt: blank,
      word: item.word,
      answer: item.answer,
      options: isDiaeresis ? ["u", "ü"] : ["G", "J"],
      isDiaeresis,
      explanation: item.explanation,
      examples: item.examples,
      ruleId: item.ruleId,
      rule: item.rule,
      isException: !!item.isException,
      letter: isDiaeresis ? "G" : item.answer
    };
  },

  fromWordComplete(item) {
    // Same mechanic as choose but framed as "completa la palabra"
    const c = ChallengeFactory.fromWordChoose(item);
    c.type = CHALLENGE_TYPES.COMPLETE_WORD;
    return c;
  },

  fromWordFix(item) {
    // Construye una grafía incorrecta cambiando la letra/carácter clave
    const isDiaeresis = item.answer === "u" || item.answer === "ü";
    const swapChar = isDiaeresis ? (item.answer === "u" ? "ü" : "u") : (item.answer === "G" ? "j" : "g");
    const idx = findBlankIndex(item.word, item.answer);
    let wrongWord = item.word;
    if (idx !== -1) {
      wrongWord = item.word.slice(0, idx) + swapChar + item.word.slice(idx + 1);
    }
    return {
      type: CHALLENGE_TYPES.FIX_WORD,
      wrongWord,
      answer: item.word,
      explanation: item.explanation,
      examples: item.examples,
      ruleId: item.ruleId,
      rule: item.rule,
      isException: !!item.isException,
      letter: isDiaeresis ? "G" : item.answer
    };
  },

  fromWordTrap(item) {
    const c = ChallengeFactory.fromWordChoose(item);
    c.type = CHALLENGE_TYPES.TRAP_WORD;
    return c;
  },

  fromText(item) {
    if (item.type === "sentence") {
      return {
        id: item.id,
        type: CHALLENGE_TYPES.DETECT_ERROR,
        text: item.text,
        wrongWord: item.wrongWord,
        correctWord: item.correctWord,
        extraWrong: item.extraWrong,
        extraCorrect: item.extraCorrect,
        noError: !!item.noError,
        explanation: item.explanation,
        ruleId: item.ruleId,
        context: item.context
      };
    }
    if (item.type === "email") {
      return {
        id: item.id,
        type: CHALLENGE_TYPES.EMAIL_CHECK,
        subject: item.subject,
        body: item.body,
        errors: item.errors,
        context: item.context
      };
    }
    if (item.type === "app") {
      return {
        id: item.id,
        type: CHALLENGE_TYPES.APP_CHECK,
        label: item.label,
        wrong: item.wrong,
        correct: item.correct,
        wrongWord: item.wrongWord,
        correctWord: item.correctWord,
        noError: !!item.noError,
        explanation: item.explanation,
        ruleId: item.ruleId,
        context: item.context
      };
    }
    if (item.type === "security") {
      return {
        id: item.id,
        type: CHALLENGE_TYPES.SECURITY_CHECK,
        label: item.label,
        wrong: item.wrong,
        correct: item.correct,
        explanation: item.explanation,
        ruleId: item.ruleId,
        context: item.context
      };
    }
    if (item.type === "programming" || item.type === "web") {
      return {
        id: item.id,
        type: CHALLENGE_TYPES.PROGRAMMING_CHECK,
        label: item.label,
        wrong: item.wrong,
        correct: item.correct,
        explanation: item.explanation,
        ruleId: item.ruleId,
        context: item.context
      };
    }
    return null;
  },

  /* Genera un desafío atómico "Une la regla": un patrón + opciones (la
     respuesta correcta + distractores tomados de otros pares). */
  fromSingleMatchPair(pair, allPairs) {
    const distractorPool = allPairs.filter(p => p.right !== pair.right).map(p => p.right);
    const distractors = pickN([...new Set(distractorPool)], 2);
    const options = shuffle([pair.right, ...distractors]);
    return {
      type: CHALLENGE_TYPES.MATCH_RULE,
      pattern: pair.left,
      answer: pair.right,
      options,
      explanation: pair.explanation
    };
  },

  fromVerbChange(item) {
    return {
      type: CHALLENGE_TYPES.VERB_CHANGE,
      prompt: item.prompt,
      infinitive: item.infinitive,
      answer: item.answer,
      options: shuffle(item.options),
      explanation: item.explanation
    };
  },

  fromMeaning(item) {
    return {
      id: item.id,
      type: CHALLENGE_TYPES.MEANING,
      sentence: item.sentence,
      options: shuffle(item.options),
      explanation: item.explanation
    };
  }
};

/* -------------------------------------------------------------------------
   Sesión de juego — controla una partida (nivel, reto rápido, examen final)
   ------------------------------------------------------------------------- */
class GameSession {
  constructor({ challenges, lives = 3, timeLimitMs = null, onEnd = null }) {
    this.challenges = challenges;
    this.index = 0;
    this.lives = lives;
    this.maxLives = lives;
    this.score = 0;
    this.streak = 0;
    this.bestStreakThisRun = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.timeLimitMs = timeLimitMs;
    this.onEnd = onEnd;
    this.finished = false;
    this.log = []; // {challenge, correct, points}
  }

  get current() {
    return this.challenges[this.index];
  }

  get total() {
    return this.challenges.length;
  }

  get progressPct() {
    return Math.round((this.index / this.total) * 100);
  }

  get accuracy() {
    const answered = this.correctCount + this.wrongCount;
    return answered === 0 ? 0 : Math.round((this.correctCount / answered) * 100);
  }

  /* Calcula puntos: base + bonus de velocidad + bonus de racha */
  computeScore(correct, elapsedMs) {
    if (!correct) return -10; // penalización moderada
    let points = 100;
    if (elapsedMs !== null && elapsedMs < 6000) points += 50; // bonus rapidez
    points += Math.min(this.streak, 5) * 25; // bonus por racha (tope razonable)
    return points;
  }

  answer(correct, elapsedMs = null) {
    const points = this.computeScore(correct, elapsedMs);
    this.score = Math.max(0, this.score + points);
    if (correct) {
      this.correctCount++;
      this.streak++;
      this.bestStreakThisRun = Math.max(this.bestStreakThisRun, this.streak);
    } else {
      this.wrongCount++;
      this.streak = 0;
      this.lives = Math.max(0, this.lives - 1);
    }
    this.log.push({ challenge: this.current, correct, points });
    Storage.updateBestStreak(this.bestStreakThisRun);
    return { points, livesLeft: this.lives, streak: this.streak };
  }

  advance() {
    this.index++;
    if (this.index >= this.total || this.lives <= 0) {
      this.finished = true;
      if (this.onEnd) this.onEnd(this.summary());
      return false;
    }
    return true;
  }

  outOfLives() {
    return this.lives <= 0;
  }

  summary() {
    return {
      score: this.score,
      correctCount: this.correctCount,
      wrongCount: this.wrongCount,
      total: this.total,
      accuracy: this.accuracy,
      bestStreak: this.bestStreakThisRun,
      livesLeft: this.lives
    };
  }
}

/* -------------------------------------------------------------------------
   Construcción de desafíos para un nivel específico (mezcla de tipos)
   Ahora integra el historial global para evitar repeticiones.
   ------------------------------------------------------------------------- */
function buildChallengesForLevel(level) {
  const wordPool = GlobalPools.getShared();
  const tempUsedWords = []; // Evita repeticiones dentro del mismo nivel antes del marcado oficial en UI

  if (level.type === "meaning") {
    return pickN(MEANING_CHALLENGES, level.questionCount).map(ChallengeFactory.fromMeaning);
  }

  if (level.type === "text") {
    const usedTexts = Storage.getUsedTexts();
    let available = TEXT_CHALLENGES.filter(t => level.contexts.includes(t.context) && !usedTexts.includes(t.id));
    
    if (available.length < level.questionCount) {
      available = TEXT_CHALLENGES.filter(t => level.contexts.includes(t.context));
    }
    
    let items = pickN(available, level.questionCount);
    return items.map(ChallengeFactory.fromText).filter(Boolean);
  }

  if (level.isFinal) {
    // Examen C2: mezcla completa de 20 desafíos (según data.js)
    const wordItems = [];
    for(let i=0; i<8; i++) {
        const item = wordPool.nextAdaptive(3, 4, false, tempUsedWords);
        if(item) { wordItems.push(item); tempUsedWords.push(item.word); }
    }

    const wordChallenges = wordItems.map((w, i) => {
      const variants = [ChallengeFactory.fromWordChoose, ChallengeFactory.fromWordFix, ChallengeFactory.fromWordComplete];
      return variants[i % variants.length](w);
    });
    
    const usedTexts = Storage.getUsedTexts();
    const finalTexts = TEXT_CHALLENGES.filter(t => t.difficulty === 4 && ["final", "professional"].includes(t.context) && !usedTexts.includes(t.id));
    
    const textItems = pickN(finalTexts.length ? finalTexts : TEXT_CHALLENGES, 6).map(ChallengeFactory.fromText).filter(Boolean);
    const verbItems = pickN(FINAL_VERB_CHANGES, 2).map(ChallengeFactory.fromVerbChange);
    const meaningItems = pickN(FINAL_MEANING_CHALLENGES, 2).map(ChallengeFactory.fromMeaning);
    const matchItems = pickN(FINAL_MATCH_PAIRS, 2).map(p => ChallengeFactory.fromSingleMatchPair(p, FINAL_MATCH_PAIRS));
    
    return shuffle([...wordChallenges, ...textItems, ...verbItems, ...meaningItems, ...matchItems]).slice(0, level.questionCount);
  }

  // Niveles normales (1-6)
  const [minD, maxD] = level.difficultyRange;
  const challenges = [];
  
  for(let i=0; i<level.questionCount; i++) {
    if (level.id === 5 && i % 3 === 0 && VERB_CHANGES.length) {
       challenges.push(ChallengeFactory.fromVerbChange(pickN(VERB_CHANGES, 1)[0]));
       continue;
    }

    const item = wordPool.nextAdaptive(minD, maxD, level.onlyExceptions, tempUsedWords);
    if (item) {
        tempUsedWords.push(item.word);
        if (level.onlyExceptions) {
            challenges.push(ChallengeFactory.fromWordTrap(item));
        } else {
            const variants = [ChallengeFactory.fromWordChoose, ChallengeFactory.fromWordComplete, ChallengeFactory.fromWordFix];
            challenges.push(variants[challenges.length % variants.length](item));
        }
    }
  }

  return challenges;
}

/* -------------------------------------------------------------------------
   Dificultad adaptativa (Reto Rápido y 1v1)
   ------------------------------------------------------------------------- */
function adaptiveDifficulty(correctCount, wrongCount) {
  const total = correctCount + wrongCount;
  if (total < 3) return [2, 3];               // arranque: nivel C1
  const acc = (correctCount / total) * 100;
  if (acc >= 85) return [3, 4];                // experto: vocabulario C1/C2 y trampas técnicas
  if (acc >= 60) return [2, 3];                // avanzado: intermedio y difícil
  return [1, 2];                               // refuerzo: principiante e intermedio
}

function pickAdaptiveQuickChallenge(quickState) {
  const [minD, maxD] = adaptiveDifficulty(quickState.correct, quickState.wrong);
  const pool = GlobalPools.getShared();
  const item = pool.nextAdaptive(minD, maxD);
  if (item && item.word) Storage.markWordAsUsed(item.word);
  return ChallengeFactory.fromWordChoose(item);
}

function pickFor1v1(phase) {
  const pool = GlobalPools.getShared();
  let minD = 1, maxD = 3;
  
  if (phase === "sudden") {
    minD = 2; maxD = 4;
  } else if (phase === "extreme") {
    minD = 3; maxD = 4;
  }
  
  const item = pool.nextAdaptive(minD, maxD);
  if (item && item.word) Storage.markWordAsUsed(item.word);
  return ChallengeFactory.fromWordChoose(item);
}

/* -------------------------------------------------------------------------
   Evaluación de insignias tras cada nivel/partida
   ------------------------------------------------------------------------- */
function checkBadges() {
  const s = Storage.load();
  const newly = [];

  BADGES.forEach(b => {
    if (s.badges.includes(b.id)) return;
    const c = b.condition;
    let earned = false;
    if (c.type === "correctByLetter") earned = (s.stats.correctByLetter[c.letter] || 0) >= c.count;
    else if (c.type === "exceptions") earned = s.stats.exceptionsCorrect >= c.count;
    else if (c.type === "levelAccuracy") earned = s.levels[c.levelId] && s.levels[c.levelId].bestAccuracy >= c.min;
    else if (c.type === "levelComplete") earned = !!(s.levels[c.levelId] && s.levels[c.levelId].completed);
    else if (c.type === "meaningPerfect") earned = !!s.meaningPerfectRun;
    else if (c.type === "categoryPerfect") {
      const cat = s.stats.categoryStats[c.context];
      earned = !!(cat && cat.correct >= 3 && cat.wrong === 0);
    }
    else if (c.type === "gueGuiPerfect") earned = !!s.gueGuiPerfectRun;
    else if (c.type === "finalBossComplete") earned = !!s.finalBossCompleted;

    if (earned && Storage.awardBadge(b.id)) newly.push(b);
  });

  return newly;
}
