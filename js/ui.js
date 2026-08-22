/* =========================================================================
   ui.js — Renderizado de pantallas y navegación (SPA sin framework)
   ========================================================================= */

const State = {
  screen: "home",
  history: [],
  session: null,
  currentLevel: null,
  learnModuleId: null,
  ruleFilterModule: null,
  quick: null,
  expo: { index: 0, revealed: false },
  two: null,
  cState: {},          // estado efímero del desafío actual (selección, tokens, etc.)
  answered: false,
  challengeStartTime: 0,
  toast: null,
  abandon: null,
  finalTimer: null
};

// Coloca tu archivo musical en esta ruta o cambia únicamente esta línea.
const USER_MUSIC_FILE = "audio/musica-fondo.mp3";
const LOBBY_MUSIC_FILE = "audio/musica-fondo-lobby.mp3";
// Música opcional exclusiva para Dos jugadores.
const TWO_PLAYER_MUSIC_FILE = "audio/musica-duelo.mp3";
const MUSIC_OUTPUT_LEVEL = 0.12;
const EFFECT_OUTPUT_LEVEL = 0.045;
const SOUND_CORRECT_FILE = "audio/sonido-correcto.mp3";
const SOUND_INCORRECT_FILE = "audio/sonido-incorrecto.mp3";
const SOUND_PLAY_FILE = "audio/sonido-jugar.mp3";
const SOUND_BUTTON_FILE = "audio/sonido-boton.mp3";
const SOUND_VICTORY_FILE = "audio/sonido-victoria.mp3";
const SOUND_SPECIAL_VICTORY_FILE = "audio/sonido-victoria-especial.mp3";

const AudioManager = {
  music: null,
  context: null,
  transitionId: 0,
  clips: {},
  start(file = USER_MUSIC_FILE) {
    if (!Storage.load().settings.audio) return;
    if (typeof Audio === "undefined") return;
    if (!this.music) this.music = new Audio();
    const nextSrc = new URL(file, document.baseURI).href;
    if (!this.music.src) {
      this.music.src = nextSrc;
      this.music.loop = true;
      this.music.autoplay = true;
      this.music.preload = "auto";
      this.music.volume = MUSIC_OUTPUT_LEVEL;
      this.music.play().catch(() => {});
      return;
    }
    if (this.music.src === nextSrc && !this.music.paused) return;
    this.transitionTo(nextSrc);
  },
  transitionTo(nextSrc) {
    const id = ++this.transitionId;
    const audio = this.music;
    if (!audio) return;
    const fadeOut = setInterval(() => {
      if (id !== this.transitionId) { clearInterval(fadeOut); return; }
      audio.volume = Math.max(0, audio.volume - 0.02);
      if (audio.volume > 0) return;
      clearInterval(fadeOut);
      audio.pause();
      audio.currentTime = 0;
      audio.src = nextSrc;
      audio.loop = true;
      audio.volume = 0;
      audio.play().then(() => {
        const fadeIn = setInterval(() => {
          if (id !== this.transitionId) { clearInterval(fadeIn); return; }
              audio.volume = Math.min(MUSIC_OUTPUT_LEVEL, audio.volume + 0.02);
              if (audio.volume >= MUSIC_OUTPUT_LEVEL) clearInterval(fadeIn);
        }, 40);
      }).catch(() => {});
    }, 40);
  },
  stop() {
    if (!this.music) return;
    const id = ++this.transitionId;
    const audio = this.music;
    const fadeOut = setInterval(() => {
      if (id !== this.transitionId) { clearInterval(fadeOut); return; }
      audio.volume = Math.max(0, audio.volume - 0.02);
      if (audio.volume <= 0) { clearInterval(fadeOut); audio.pause(); audio.currentTime = 0; }
    }, 40);
  },
  playConfigured(name, fallbackCorrect = null) {
    if (!Storage.load().settings.audio) return;
    const files = {
      correct: SOUND_CORRECT_FILE,
      incorrect: SOUND_INCORRECT_FILE,
      play: SOUND_PLAY_FILE,
      button: SOUND_BUTTON_FILE,
      victory: SOUND_VICTORY_FILE,
      specialVictory: SOUND_SPECIAL_VICTORY_FILE
    };
    const file = files[name];
    if (!file || typeof Audio === "undefined") {
      if (fallbackCorrect !== null) this.effect(fallbackCorrect);
      return;
    }
    if (!this.clips[name]) this.clips[name] = new Audio(file);
    const clip = this.clips[name];
    clip.volume = name === "button" ? 0.035 : 0.07;
    clip.currentTime = 0;
    clip.play().catch(() => { if (fallbackCorrect !== null) this.effect(fallbackCorrect); });
  },
  effect(correct) {
    if (!Storage.load().settings.audio) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!this.context) this.context = new AudioContext();
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = correct ? "sine" : "sawtooth";
    oscillator.frequency.value = correct ? 660 : 180;
    gain.gain.setValueAtTime(0.0001, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(EFFECT_OUTPUT_LEVEL, this.context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + (correct ? 0.18 : 0.24));
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start();
    oscillator.stop(this.context.currentTime + 0.25);
  }
};

const root = () => document.getElementById("app");

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function normalizeAnswer(str) {
  return String(str).trim().toLowerCase().replace(/\s+/g, " ");
}

/* ---------------------------------------------------------------------
   Navegación
   --------------------------------------------------------------------- */
function navigate(screen, extra = {}) {
  if (State.screen && State.screen !== screen) State.history.push(State.screen);
  Object.assign(State, extra);
  State.screen = screen;
  if (!["game", "quick", "two"].includes(screen)) AudioManager.start(LOBBY_MUSIC_FILE);
  render();
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

function isActiveActivity() {
  return ["game", "quick", "two"].includes(State.screen);
}

function clearActivityState() {
  if (State.quick && State.quick.timerId) clearInterval(State.quick.timerId);
  if (State.finalTimer && State.finalTimer.timerId) clearInterval(State.finalTimer.timerId);
  State.session = null;
  State.currentLevel = null;
  State.quick = null;
  State.two = null;
  State.twoLobbyStep = null;
  State.finalTimer = null;
  State.answered = false;
  AudioManager.stop();
}

function requestAbandon(target, historyBack = false) {
  State.abandon = { target, historyBack };
  render();
}

function confirmAbandon() {
  const pending = State.abandon;
  State.abandon = null;
  clearActivityState();
  if (pending.historyBack) {
    const prev = State.history.pop();
    State.screen = prev || "home";
    render();
  } else navigate(pending.target || "home");
}

function goBack() {
  if (isActiveActivity()) { requestAbandon("", true); return; }
  const prev = State.history.pop();
  if (prev) { State.screen = prev; render(); window.scrollTo(0, 0); }
  else navigate("home");
}

function goHome() {
  if (isActiveActivity()) { requestAbandon("home"); return; }
  State.history = [];
  navigate("home");
}

/* ---------------------------------------------------------------------
   Shell / topbar
   --------------------------------------------------------------------- */
const SCREEN_TITLES = {
  home: "", modeSelect: "Selección de modo", levelSelect: "Selección de nivel",
  tutorial: "Tutorial", learn: "Aprender", learnModule: "Aprender", game: "Desafío",
  levelResult: "Resultado del nivel", progress: "Progreso", badges: "Insignias",
  rules: "Reglas", quick: "Reto rápido", quickResult: "Reto rápido — Resultado",
  expo: "Modo exposición", credits: "Acerca del proyecto", two: "Dos jugadores",
  finalIntro: "El Gran Desafío G vs J"
};

function renderShell(contentHtml, opts = {}) {
  const showBack = State.screen !== "home";
  const title = SCREEN_TITLES[State.screen] || "";
  root().innerHTML = `
    <div class="ambient-scene" aria-hidden="true">
      <div class="wireframe wireframe-one"></div><div class="wireframe wireframe-two"></div>
      <div class="constellation constellation-one"><i></i><i></i><i></i><i></i><b></b><b></b><b></b></div>
      <div class="constellation constellation-two"><i></i><i></i><i></i><i></i><i></i><b></b><b></b><b></b><b></b></div>
      <div class="constellation constellation-three"><i></i><i></i><i></i><b></b><b></b></div>
      <div class="constellation constellation-four"><i></i><i></i><i></i><i></i><b></b><b></b><b></b></div>
      <div class="constellation constellation-five"><i></i><i></i><i></i><i></i><i></i><b></b><b></b><b></b><b></b></div>
      <div class="constellation constellation-six"><i></i><i></i><i></i><b></b><b></b></div>
      <div class="ambient-particles">${["G", "J", "0", "1", "{", "}", "G", "J", "/", "*", "()", "=>", "G", "J", "lambda", "sum", "01", "[]"].map((char, i) => `<span style="--particle-x:${i * 5.3}%;--particle-delay:${i * -1.7}s;--particle-duration:${15 + (i % 5) * 2}s">${char}</span>`).join("")}</div>
    </div>
    <header class="topbar">
      <div class="topbar-left">
        ${showBack ? `<button class="back-btn" data-action="back" aria-label="Regresar">&larr; Atrás</button>` : ""}
        <div class="topbar-brand" data-action="home" role="button" tabindex="0"><span class="g">G</span><span style="color:var(--ink-faint)">vs</span><span class="j">J</span></div>
        ${title ? `<div class="topbar-title">${title}</div>` : ""}
      </div>
      <div class="topbar-actions">
        <button class="icon-btn" data-action="goto" data-screen="progress" title="Progreso" aria-label="Ver progreso">◔</button>
        <button class="icon-btn" data-action="goto" data-screen="badges" title="Insignias" aria-label="Ver insignias">★</button>
        <button class="icon-btn" data-action="home" title="Inicio" aria-label="Ir al inicio">⌂</button>
      </div>
    </header>
    <main>${contentHtml}</main>
    ${State.toast ? `<div class="modal-overlay" data-action="dismissToast">${State.toast}</div>` : ""}
    ${State.abandon ? `<div class="modal-overlay"><div class="abandon-dialog"><div class="home-eyebrow">Partida en curso</div><h2>¿Seguro que deseas abandonar el nivel?</h2><p>Se perderá el progreso de esta actividad y, cuando vuelvas a entrar, comenzarás desde cero.</p><div class="result-actions"><button class="btn btn-primary" data-action="confirmAbandon">Sí, abandonar</button><button class="btn btn-outline" data-action="cancelAbandon">Continuar jugando</button></div></div></div>` : ""}
  `;
}

/* =======================================================================
   PANTALLA: INICIO
   ======================================================================= */
function renderHome() {
  const html = `
    <div class="home-hero">
      <div class="home-eyebrow">Proyecto educativo interactivo</div>
      <div class="gj-duel"><span class="gj-letter g">G</span><span class="gj-vs">VS</span><span class="gj-letter j">J</span></div>
      <h1 class="home-title">La Misión Ortográfica</h1>
      <p class="home-subtitle">Domina las reglas. Detecta los errores. Comunica mejor.</p>
      <div class="home-menu">
        <button class="btn btn-primary primary-cell play-cta" data-action="goto" data-screen="modeSelect">JUGAR</button>
        <button class="btn btn-outline" data-action="goto" data-screen="learn">APRENDER</button>
        <button class="btn btn-outline" data-action="goto" data-screen="modeSelect">DESAFÍOS</button>
        <button class="btn btn-outline" data-action="goto" data-screen="progress">PROGRESO</button>
        <button class="btn btn-outline" data-action="goto" data-screen="rules">REGLAS</button>
        <button class="btn btn-outline" data-action="goto" data-screen="credits">ACERCA DEL PROYECTO</button>
      </div>
      <p class="muted-note">Complemento interactivo para la exposición: «El uso de la G y la J en la ortografía española».</p>
    </div>
  `;
  renderShell(html);
}

/* =======================================================================
   PANTALLA: SELECCIÓN DE MODO
   ======================================================================= */
function renderModeSelect() {
  const html = `
    <div class="screen">
      <div class="page-head"><div class="eyebrow">Jugar</div><h1>Elige tu modo de misión</h1><p>Cada modo pone a prueba tus conocimientos de una forma distinta.</p></div>
      <div class="grid grid-3" style="margin-top:26px">
        <div class="card card-hover mode-card" data-action="goto" data-screen="levelSelect" role="button" tabindex="0"><span class="tag">Campaña</span><h3>Niveles</h3><p>Recorre los 10 niveles, desde los fundamentos hasta el desafío final.</p></div>
        <div class="card card-hover mode-card" data-action="startQuick" role="button" tabindex="0"><span class="tag">C1 · 60 segundos</span><h3>Reto rápido</h3><p>Responde tantas palabras G/J como puedas antes de que se acabe el tiempo.</p></div>
        <div class="card card-hover mode-card" data-action="goto" data-screen="two" role="button" tabindex="0"><span class="tag">C1 · Opcional · local</span><h3>Dos jugadores</h3><p>Alterna turnos con otra persona y compite por la mayor puntuación.</p></div>
        <div class="card card-hover mode-card" data-action="goto" data-screen="finalIntro" role="button" tabindex="0"><span class="tag">C2 · Nivel 10</span><h3>Desafío final</h3><p>El Gran Desafío G vs J: todos los contenidos combinados.</p></div>
        <div class="card card-hover mode-card" data-action="goto" data-screen="expo" role="button" tabindex="0"><span class="tag">C2 · Para la exposición</span><h3>Modo exposición</h3><p>Preguntas listas para lanzar al público durante tu presentación.</p></div>
        <div class="card card-hover mode-card" data-action="goto" data-screen="tutorial" role="button" tabindex="0"><span class="tag">Guía</span><h3>Tutorial</h3><p>Repasa el método de 6 pasos antes de empezar a jugar.</p></div>
      </div>
    </div>
  `;
  renderShell(html);
}

/* =======================================================================
   PANTALLA: TUTORIAL — Método de 6 pasos
   ======================================================================= */
function renderTutorial() {
  const steps = METHOD_STEPS.map(s => `
    <div class="method-step">
      <div class="n">${String(s.step).padStart(2, "0")}</div>
      <div><h4>${escapeHtml(s.title)}</h4><p>${escapeHtml(s.body)}</p></div>
    </div>
  `).join("");
  const html = `
    <div class="screen screen-narrow">
      <div class="page-head"><div class="eyebrow">Tutorial</div><h1>El detector automático de G/J</h1><p>Cuando dudes entre G y J, sigue este procedimiento de seis pasos. No memorices: razona.</p></div>
      <div class="method-steps" style="margin-top:24px">${steps}</div>
      <div style="margin-top:30px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-primary" data-action="goto" data-screen="modeSelect">Empezar a jugar</button>
        <button class="btn btn-outline" data-action="goto" data-screen="learn">Ver módulos de teoría</button>
      </div>
    </div>
  `;
  renderShell(html);
}

/* =======================================================================
   PANTALLA: APRENDER (lista de módulos)
   ======================================================================= */
function renderLearn() {
  const items = MODULES.map(m => `
    <div class="module-list-item" data-action="goto" data-screen="learnModule" data-module="${m.id}" role="button" tabindex="0">
      <div class="num">${String(m.num).padStart(2, "0")}</div>
      <div class="txt"><h4>${escapeHtml(m.title)}</h4><p>${escapeHtml(m.summary)}</p></div>
    </div>
  `).join("");
  const html = `
    <div class="screen screen-narrow">
      <div class="page-head"><div class="eyebrow">Aprender</div><h1>Módulos de teoría</h1><p>19 módulos con las reglas, ejemplos y excepciones antes de enfrentarte a los desafíos.</p></div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:24px">${items}</div>
    </div>
  `;
  renderShell(html);
}

function renderLearnModule() {
  const m = MODULES.find(x => x.id === State.learnModuleId) || MODULES[0];
  const idx = MODULES.findIndex(x => x.id === m.id);
  const body = m.body.map(p => `<p style="margin-bottom:12px">${escapeHtml(p)}</p>`).join("");
  const visualRule = (m.visualRule || []).map(v => `
    <div class="visual-rule-row ${v.cls}"><span>${escapeHtml(v.pattern)}</span><span>${escapeHtml(v.result)}</span></div>
  `).join("");
  const examples = (m.examples || []).map(e => `
    <div class="rule-example-row"><span class="seq">${escapeHtml(e.seq)}</span><span class="w">${escapeHtml(e.word)}</span></div>
  `).join("");
  const exceptions = (m.exceptions || []).length ? `
    <div class="exception-box"><div class="label">Cuidado con la excepción</div>
      <p>${m.exceptions.map(escapeHtml).join(" · ")}</p>
    </div>` : "";
  const prevM = MODULES[idx - 1], nextM = MODULES[idx + 1];
  const html = `
    <div class="screen screen-narrow">
      <div class="page-head"><div class="eyebrow">Módulo ${String(m.num).padStart(2, "0")} / 19</div><h1>${escapeHtml(m.title)}</h1></div>
      <div class="card" style="margin-top:20px">
        ${body}
        ${visualRule ? `<div style="margin-top:18px">${visualRule}</div>` : ""}
        ${examples ? `<div style="display:flex;flex-direction:column;gap:8px;margin-top:18px">${examples}</div>` : ""}
        ${exceptions}
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:22px;gap:10px;flex-wrap:wrap">
        <button class="btn btn-outline" ${prevM ? "" : "disabled"} data-action="goto" data-screen="learnModule" data-module="${prevM ? prevM.id : ""}">&larr; Anterior</button>
        <button class="btn btn-outline" data-action="goto" data-screen="learn">Todos los módulos</button>
        <button class="btn btn-primary" ${nextM ? "" : "disabled"} data-action="goto" data-screen="learnModule" data-module="${nextM ? nextM.id : ""}">Siguiente &rarr;</button>
      </div>
    </div>
  `;
  renderShell(html);
}

/* =======================================================================
   PANTALLA: REGLAS (referencia rápida)
   ======================================================================= */
function renderRules() {
  const cards = MODULES.map(m => `
    <div class="card rule-ref-card card-hover" data-action="goto" data-screen="learnModule" data-module="${m.id}" role="button" tabindex="0">
      <span class="tag">Módulo ${String(m.num).padStart(2, "0")}</span>
      <h4>${escapeHtml(m.title)}</h4>
      <p>${escapeHtml(m.summary)}</p>
    </div>
  `).join("");
  const html = `
    <div class="screen">
      <div class="page-head"><div class="eyebrow">Referencia</div><h1>Todas las reglas de un vistazo</h1><p>Toca cualquier tarjeta para ver la explicación completa con ejemplos y excepciones.</p></div>
      <div class="grid grid-3" style="margin-top:24px">${cards}</div>
    </div>
  `;
  renderShell(html);
}

/* =======================================================================
   PANTALLA: SELECCIÓN DE NIVEL
   ======================================================================= */
function renderLevelSelect() {
  const s = Storage.load();
  const campaignComplete = LEVELS.filter(l => !l.isFinal).every(l => s.levels[l.id] && s.levels[l.id].completed);
  const cards = LEVELS.filter(l => !l.isFinal).map((l, i) => {
    const prevDone = i === 0 || !!(s.levels[LEVELS[i - 1].id] && s.levels[LEVELS[i - 1].id].completed);
    const locked = !prevDone;
    const rec = s.levels[l.id];
    const stars = rec ? rec.stars : 0;
    const starsHtml = [1, 2, 3].map(n => `<span class="${n <= stars ? "on" : ""}">★</span>`).join("");
    return `
      <div class="card level-card ${locked ? "locked" : ""} card-hover" ${locked ? "" : `data-action="startLevel" data-level="${l.id}" role="button" tabindex="0"`}>
        ${rec && rec.completed ? `<span class="badge-complete">COMPLETADO</span>` : ""}
        <span class="level-num">Nivel ${String(l.id).padStart(2, "0")} · ${l.cefr}${locked ? " · Bloqueado" : ""}</span>
        <h3>${escapeHtml(l.title)}</h3>
        <p>${escapeHtml(l.desc)}</p>
        <div class="stars">${starsHtml}</div>
      </div>
    `;
  }).join("");
  const html = `
    <div class="screen">
      <div class="page-head"><div class="eyebrow">Campaña</div><h1>Selecciona un nivel</h1><p>Completa un nivel para desbloquear el siguiente. La dificultad aumenta progresivamente.</p></div>
      <div class="grid grid-3" style="margin-top:24px">${cards}</div>
      <div class="card final-gateway ${campaignComplete ? "unlocked" : "locked"}" style="margin-top:26px;text-align:center">
        <span class="tag">C2 · Acceso directo</span>
        <h2>${campaignComplete ? "La puerta C2 está abierta" : "La puerta C2 permanece cerrada"}</h2>
        <p>${campaignComplete ? "Has completado la campaña: ahora puedes defender tus decisiones en el Gran Desafío G vs J." : "Completa los niveles 1 a 9 para activar el acceso al Gran Desafío G vs J."}</p>
        <button class="btn btn-primary" ${campaignComplete ? "" : "disabled"} data-action="goto" data-screen="finalIntro">${campaignComplete ? "Ir al desafío final" : "Completa la campaña para desbloquearlo"}</button>
      </div>
    </div>
  `;
  renderShell(html);
}

function renderFinalIntro() {
  const s = Storage.load();
  const done = LEVELS.filter(l => !l.isFinal).every(l => s.levels[l.id] && s.levels[l.id].completed);
  const html = `
    <div class="screen screen-narrow">
      <div class="result-hero">
        <div class="home-eyebrow">Nivel 10 · C2 · Examen final</div>
        <h1 style="font-size:clamp(26px,5vw,38px)">EL GRAN DESAFÍO G VS J</h1>
        <p style="max-width:520px;margin:14px auto 0">Combina reglas fonéticas, terminaciones cultas, excepciones, alternancias verbales, parónimas y edición profesional de textos y código. Tendrás que justificar decisiones ortográficas propias del nivel C2.</p>
        ${done ? "" : `<p class="muted-note">Recomendado: completa primero los niveles 1 a 9 para llegar mejor preparado.</p>`}
        <div class="result-actions">
          <button class="btn btn-primary" ${done ? "" : "disabled"} data-action="startFinal">${done ? "Comenzar el desafío final" : "Completa los niveles 1 a 9"}</button>
          <button class="btn btn-outline" data-action="goto" data-screen="levelSelect">Ver niveles</button>
        </div>
      </div>
    </div>
  `;
  renderShell(html);
}

/* =======================================================================
   MOTOR DE JUEGO — pantalla "game" (compartida por niveles y examen final)
   ======================================================================= */
function startLevel(levelId) {
  const level = LEVELS.find(l => l.id === levelId);
  const challenges = buildChallengesForLevel(level);
  State.currentLevel = level;
  State.session = new GameSession({ challenges, lives: 3 });
  State.cState = {};
  State.answered = false;
  State.challengeStartTime = Date.now();
  AudioManager.start();
  navigate("game");
}

function startFinal() {
  const s = Storage.load();
  const campaignComplete = LEVELS.filter(l => !l.isFinal).every(l => s.levels[l.id] && s.levels[l.id].completed);
  if (!campaignComplete) {
    State.toast = "Debes completar los niveles 1 a 9 antes de acceder al desafío final.";
    render();
    return;
  }
  const level = LEVELS.find(l => l.isFinal);
  const challenges = buildChallengesForLevel(level);
  State.currentLevel = level;
  State.session = new GameSession({ challenges, lives: 3 });
  State.cState = {};
  State.answered = false;
  State.challengeStartTime = Date.now();
  State.finalTimer = { timeLeft: null, timerId: null, round: 0 };
  AudioManager.start();
  navigate("game");
}

function finalSecondsForIndex(index) {
  if (index < 5) return null;
  return Math.max(30, 90 - (index - 5) * 10);
}

function startFinalTimer() {
  const timer = State.finalTimer;
  const seconds = finalSecondsForIndex(State.session.index);
  if (!timer || seconds === null) return;
  timer.timeLeft = seconds;
  timer.round = State.session.index - 4;
  timer.timerId = setInterval(finalTick, 1000);
}

function finalTick() {
  const timer = State.finalTimer;
  if (!timer || State.screen !== "game") return;
  timer.timeLeft--;
  const display = document.getElementById("finalTimerDisplay");
  if (display) display.textContent = `${Math.floor(timer.timeLeft / 60)}:${String(timer.timeLeft % 60).padStart(2, "0")}`;
  if (timer.timeLeft <= 0) {
    clearInterval(timer.timerId);
    timer.timerId = null;
    timer.timeLeft = 0;
    finalizeSession(true);
  }
}

function letterColorClass(letter) {
  const l = (letter || "").toUpperCase();
  if (l === "G") return "g";
  if (l === "J") return "j";
  return "";
}

function renderChallengeBody(ch) {
  switch (ch.type) {
    case CHALLENGE_TYPES.CHOOSE_LETTER:
    case CHALLENGE_TYPES.COMPLETE_WORD:
    case CHALLENGE_TYPES.TRAP_WORD: {
      const kicker = ch.type === CHALLENGE_TYPES.TRAP_WORD ? "Palabra trampa · ¿regla o excepción?" : (ch.type === CHALLENGE_TYPES.COMPLETE_WORD ? "Completa la palabra" : "Elige la letra correcta");
      return `
        <div class="challenge-kicker"><span class="dot"></span>${kicker}</div>
        <div class="word-display">
          <span>${escapeHtml(ch.prompt.before)}</span>
          <span class="word-blank" id="blankSlot">?</span>
          <span>${escapeHtml(ch.prompt.after)}</span>
        </div>
        <div class="option-row">
          ${ch.options.map(opt => `<button class="letter-btn ${letterColorClass(opt) === "g" ? "g-opt" : "j-opt"}" data-action="answerLetter" data-value="${escapeHtml(opt)}">${escapeHtml(opt)}</button>`).join("")}
        </div>
      `;
    }
    case CHALLENGE_TYPES.FIX_WORD: {
      return `
        <div class="challenge-kicker"><span class="dot"></span>Corrige la palabra</div>
        <div class="fix-input-wrap">
          <div class="wrong-chip">${escapeHtml(ch.wrongWord)}</div>
          <input type="text" class="fix-input" id="fixInput" placeholder="Escribe la forma correcta" autocomplete="off" autocorrect="off" spellcheck="false" />
          <button class="btn btn-primary" data-action="submitFix">Comprobar</button>
        </div>
      `;
    }
    case CHALLENGE_TYPES.DETECT_ERROR: {
      const words = ch.text.split(" ");
      const toks = words.map((w, i) => {
        const clean = w.replace(/[.,!?:;()"“”«»]/g, "");
        return `<span class="tok" data-action="pickToken" data-word="${escapeHtml(clean)}" data-index="${i}" role="button" tabindex="0">${escapeHtml(w)}</span>`;
      }).join(" ");
      return `
        <div class="challenge-kicker"><span class="dot"></span>Detecta el error</div>
        <div class="sentence-box">${toks}</div>
        <div style="text-align:center;margin-top:18px">
          <button class="btn btn-outline btn-sm" data-action="pickNoError">Esta oración no tiene errores</button>
        </div>
      `;
    }
    case CHALLENGE_TYPES.MATCH_RULE: {
      return `
        <div class="challenge-kicker"><span class="dot"></span>Une la regla</div>
        <div class="word-display" style="font-size:clamp(22px,4vw,32px)">${escapeHtml(ch.pattern)}</div>
        <div class="choice-list">
          ${ch.options.map((opt, i) => `<button class="choice-btn" data-action="answerChoice" data-value="${escapeHtml(opt)}"><span class="k">${String.fromCharCode(65 + i)}</span>${escapeHtml(opt)}</button>`).join("")}
        </div>
      `;
    }
    case CHALLENGE_TYPES.VERB_CHANGE: {
      return `
        <div class="challenge-kicker"><span class="dot"></span>Verbo cambiante · ${escapeHtml(ch.infinitive)}</div>
        <div class="word-display" style="font-size:clamp(18px,3.4vw,26px);font-family:var(--font-body);font-weight:500">${escapeHtml(ch.prompt)}</div>
        <div class="choice-list">
          ${ch.options.map((opt, i) => `<button class="choice-btn" data-action="answerChoice" data-value="${escapeHtml(opt)}"><span class="k">${String.fromCharCode(65 + i)}</span>${escapeHtml(opt)}</button>`).join("")}
        </div>
      `;
    }
    case CHALLENGE_TYPES.MEANING: {
      return `
        <div class="challenge-kicker"><span class="dot"></span>¿Qué significado corresponde?</div>
        <div class="word-display" style="font-size:clamp(18px,3.4vw,26px);font-family:var(--font-body);font-weight:500">${escapeHtml(ch.sentence)}</div>
        <div class="choice-list">
          ${ch.options.map((opt, i) => `<button class="choice-btn" data-action="answerChoice" data-value="${escapeHtml(opt.text)}" data-correct="${opt.correct}"><span class="k">${String.fromCharCode(65 + i)}</span>${escapeHtml(opt.text)}</button>`).join("")}
        </div>
      `;
    }
    case CHALLENGE_TYPES.EMAIL_CHECK: {
      const paras = ch.body.split("\n").map(line => {
        if (!line.trim()) return "<br/>";
        const words = line.split(" ");
        return words.map((w, i) => {
          const clean = w.replace(/[.,!?:;()"“”«»]/g, "");
          return `<span class="tok" data-action="toggleEmailToken" data-word="${escapeHtml(clean)}" role="button" tabindex="0">${escapeHtml(w)}</span>`;
        }).join(" ");
      }).join("<br/>");
      return `
        <div class="challenge-kicker"><span class="dot"></span>Correo profesional · encuentra los errores</div>
        <div class="email-box">
          <div class="email-head"><b>Asunto:</b> ${escapeHtml(ch.subject)}</div>
          <div class="email-body">${paras}</div>
        </div>
        <p class="muted-note" style="margin-bottom:14px">Toca todas las palabras que creas incorrectas (puede haber más de una) y luego confirma.</p>
        <div style="text-align:center"><button class="btn btn-primary" data-action="submitEmail">Confirmar corrección</button></div>
      `;
    }
    case CHALLENGE_TYPES.APP_CHECK:
    case CHALLENGE_TYPES.PROGRAMMING_CHECK: {
      const isCode = ch.type === CHALLENGE_TYPES.PROGRAMMING_CHECK;
      const options = shuffle([ch.correct, ch.wrong]);
      return `
        <div class="challenge-kicker"><span class="dot"></span>${isCode ? "Modo programador" : "Interfaz de app"} · ${escapeHtml(ch.label)}</div>
        <div class="mock-panel ${isCode ? "programming" : ""}">
          <div class="mock-bar">${isCode ? "console / código" : "vista previa"}</div>
          <div class="mock-body">${escapeHtml(ch.wrong)}</div>
        </div>
        <p class="muted-note" style="margin-bottom:14px">Selecciona la versión que deberíamos publicar:</p>
        <div class="choice-list">
          ${options.map((opt, i) => `<button class="choice-btn" data-action="answerChoice" data-value="${escapeHtml(opt)}" data-correct="${opt === ch.correct}"><span class="k">${String.fromCharCode(65 + i)}</span>${escapeHtml(opt)}</button>`).join("")}
        </div>
      `;
    }
    case CHALLENGE_TYPES.SECURITY_CHECK: {
      const options = shuffle([ch.correct, ch.wrong]);
      return `
        <div class="challenge-kicker"><span class="dot"></span>Modo ciberseguridad · ${escapeHtml(ch.label)}</div>
        <div class="mock-panel security">
          <div class="mock-bar">⚑ mensaje recibido</div>
          <div class="mock-body">${escapeHtml(ch.wrong)}</div>
        </div>
        <p class="muted-note" style="margin-bottom:14px">¿Cuál sería la versión correctamente escrita?</p>
        <div class="choice-list">
          ${options.map((opt, i) => `<button class="choice-btn" data-action="answerChoice" data-value="${escapeHtml(opt)}" data-correct="${opt === ch.correct}"><span class="k">${String.fromCharCode(65 + i)}</span>${escapeHtml(opt)}</button>`).join("")}
        </div>
      `;
    }
    default:
      return `<p>Desafío no disponible.</p>`;
  }
}

function renderGame() {
  const sess = State.session;
  const ch = sess.current;
  const lives = Array.from({ length: sess.maxLives }, (_, i) => `<span class="hud-life ${i < sess.lives ? "" : "lost"}"></span>`).join("");
  const finalSeconds = State.currentLevel && State.currentLevel.isFinal ? finalSecondsForIndex(sess.index) : null;
  const html = `
    <div class="screen screen-narrow">
      <div class="game-hud">
        <div class="hud-progress"><div class="hud-track"><div class="hud-fill" style="width:${sess.progressPct}%"></div></div></div>
        <div class="hud-meta">
                    ${finalSeconds !== null ? `<div class="final-timer" id="finalTimerDisplay">${Math.floor((State.finalTimer && State.finalTimer.timeLeft || finalSeconds) / 60)}:${String((State.finalTimer && State.finalTimer.timeLeft || finalSeconds) % 60).padStart(2, "0")}</div>` : ""}
          <div class="hud-streak ${sess.streak >= 2 ? "show" : ""}">RACHA ×${sess.streak}</div>
          <div class="hud-score">${sess.score} pts</div>
          <div class="hud-lives">${lives}</div>
        </div>
      </div>
      <div class="challenge-panel" id="challengePanel">
        ${renderChallengeBody(ch)}
        <div id="feedbackSlot"></div>
      </div>
    </div>
  `;
  renderShell(html);
  const input = document.getElementById("fixInput");
  if (input) {
    input.focus();
    input.addEventListener("keydown", e => { if (e.key === "Enter") submitFix(); });
  }
}

/* ---- Evaluación de respuestas ---- */
function elapsedMs() { return Date.now() - State.challengeStartTime; }

function showFeedback(correct, explanation, meta = {}) {
  State.answered = true;
  AudioManager.playConfigured(correct ? "correct" : "incorrect", correct);
  const sess = State.session;
  const result = sess.answer(correct, elapsedMs());
  Storage.addScore(Math.max(0, result.points));
  if (meta.ruleId || meta.letter || meta.isException || meta.context) {
    Storage.recordAnswer({ correct, letter: meta.letter, isException: meta.isException, ruleId: meta.ruleId, context: meta.context });
  }
  const slot = document.getElementById("feedbackSlot");
  if (!slot) return;
  const examplesHtml = (meta.examples && meta.examples.length) ? `<div class="feedback-examples">${meta.examples.map(e => `<span>${escapeHtml(e)}</span>`).join("")}</div>` : "";
  slot.innerHTML = `
    <div class="feedback-panel ${correct ? "ok" : "bad"}">
      <div class="feedback-head ${correct ? "ok" : "bad"}">${correct ? "✓ Correcto" : "✕ Incorrecto"}${correct && result.points > 0 ? ` · +${result.points} pts` : ""}</div>
      <div class="feedback-rule">${explanation}</div>
      ${examplesHtml}
      <div class="feedback-actions">
        <button class="btn ${correct ? "btn-primary" : "btn-outline"}" data-action="nextChallenge">${sess.outOfLives() || sess.index + 1 >= sess.total ? "Ver resultado" : "Continuar"}</button>
      </div>
    </div>
  `;
  slot.scrollIntoView && slot.scrollIntoView({ behavior: "smooth", block: "end" });
}

function answerLetter(value) {
  if (State.answered) return;
  const ch = State.session.current;
  const correct = normalizeAnswer(value) === normalizeAnswer(ch.answer);
  document.querySelectorAll(".letter-btn").forEach(btn => {
    const btnVal = btn.getAttribute("data-value");
    if (normalizeAnswer(btnVal) === normalizeAnswer(ch.answer)) btn.classList.add("correct-flash");
    else if (normalizeAnswer(btnVal) === normalizeAnswer(value) && !correct) btn.classList.add("wrong-flash");
  });
  const blank = document.getElementById("blankSlot");
  if (blank) { blank.textContent = ch.answer; blank.classList.add(letterColorClass(ch.letter) === "g" ? "filled-g" : "filled-j"); }
  const explanation = correct
    ? buildRuleExplanation(ch)
    : `<b>Tu respuesta:</b> ${escapeHtml(value)} &nbsp;·&nbsp; <b>Correcta:</b> ${escapeHtml(ch.answer)}<br/>${buildRuleExplanation(ch)}`;
  showFeedback(correct, explanation, { ruleId: ch.ruleId, letter: ch.letter, isException: ch.isException, examples: ch.examples });
}

function buildRuleExplanation(ch) {
  return `${escapeHtml(ch.explanation)}`;
}

function submitFix() {
  if (State.answered) return;
  const input = document.getElementById("fixInput");
  const ch = State.session.current;
  const val = input ? input.value : "";
  const correct = normalizeAnswer(val) === normalizeAnswer(ch.answer);
  if (input) input.style.borderColor = correct ? "var(--success)" : "var(--danger)";
  const explanation = correct
    ? buildRuleExplanation(ch)
    : `<b>Tu respuesta:</b> ${escapeHtml(val || "(vacío)")} &nbsp;·&nbsp; <b>Correcta:</b> ${escapeHtml(ch.answer)}<br/>${buildRuleExplanation(ch)}`;
  showFeedback(correct, explanation, { ruleId: ch.ruleId, letter: ch.letter, isException: ch.isException, examples: ch.examples });
}

function pickToken(word, el) {
  if (State.answered) return;
  const ch = State.session.current;
  document.querySelectorAll(".tok").forEach(t => t.classList.remove("picked"));
  if (el) el.classList.add("picked");
  const correct = !ch.noError && normalizeAnswer(word) === normalizeAnswer(ch.wrongWord || "");
  document.querySelectorAll(".tok").forEach(t => {
    const w = t.getAttribute("data-word");
    if (!ch.noError && normalizeAnswer(w) === normalizeAnswer(ch.wrongWord || "")) t.classList.add("tok-correct");
    else if (t === el && !correct) t.classList.add("tok-wrong");
  });
  const explanation = correct
    ? `<b>${escapeHtml(ch.wrongWord)}</b> debía escribirse <b>${escapeHtml(ch.correctWord)}</b>. ${escapeHtml(ch.explanation)}`
    : (ch.noError ? `Esta oración sí tenía un error. ${escapeHtml(ch.explanation)}` : `La palabra incorrecta era <b>${escapeHtml(ch.wrongWord)}</b>, que debía escribirse <b>${escapeHtml(ch.correctWord)}</b>. ${escapeHtml(ch.explanation)}`);
  showFeedback(correct, explanation, { ruleId: ch.ruleId, context: ch.context });
}

function pickNoError() {
  if (State.answered) return;
  const ch = State.session.current;
  const correct = !!ch.noError;
  const explanation = correct
    ? `Correcto: la oración no tenía errores de G/J. ${escapeHtml(ch.explanation)}`
    : `En realidad sí había un error: <b>${escapeHtml(ch.wrongWord)}</b> debía escribirse <b>${escapeHtml(ch.correctWord)}</b>. ${escapeHtml(ch.explanation)}`;
  showFeedback(correct, explanation, { ruleId: ch.ruleId, context: ch.context });
}

function answerChoice(value, correctAttr, el) {
  if (State.answered) return;
  const ch = State.session.current;
  let correct;
  if (correctAttr !== null && correctAttr !== undefined && correctAttr !== "") {
    correct = correctAttr === "true";
  } else {
    correct = normalizeAnswer(value) === normalizeAnswer(ch.answer);
  }
  document.querySelectorAll(".choice-btn").forEach(btn => {
    const v = btn.getAttribute("data-value");
    const c = btn.getAttribute("data-correct");
    const isRight = (c !== null && c !== "") ? c === "true" : normalizeAnswer(v) === normalizeAnswer(ch.answer);
    if (isRight) btn.classList.add("correct-flash");
    else if (btn === el) btn.classList.add("wrong-flash");
  });
  const explanation = `${escapeHtml(ch.explanation)}`;
  const meta = { ruleId: ch.ruleId, context: ch.context };
  showFeedback(correct, explanation, meta);
  if (ch.type === CHALLENGE_TYPES.MEANING) State.cState.meaningResult = correct;
  if (State.currentLevel && State.currentLevel.type === "meaning") {
    State.cState.meaningTrack = State.cState.meaningTrack || [];
    State.cState.meaningTrack.push(correct);
  }
}

function toggleEmailToken(word, el) {
  if (State.answered) return;
  State.cState.emailPicked = State.cState.emailPicked || new Set();
  const norm = normalizeAnswer(word);
  if (State.cState.emailPicked.has(norm)) { State.cState.emailPicked.delete(norm); el.classList.remove("picked"); }
  else { State.cState.emailPicked.add(norm); el.classList.add("picked"); }
}

function submitEmail() {
  if (State.answered) return;
  const ch = State.session.current;
  const picked = State.cState.emailPicked || new Set();
  const errorWords = new Set(ch.errors.map(e => normalizeAnswer(e.wrong)));
  let hits = 0;
  errorWords.forEach(w => { if (picked.has(w)) hits++; });
  const falsePositives = [...picked].filter(w => !errorWords.has(w)).length;
  const correct = hits === errorWords.size && falsePositives === 0;
  document.querySelectorAll(".tok").forEach(t => {
    const w = normalizeAnswer(t.getAttribute("data-word"));
    if (errorWords.has(w)) t.classList.add("tok-correct");
    else if (picked.has(w)) t.classList.add("tok-wrong");
  });
  const list = ch.errors.map(e => `<div style="margin-top:6px"><b>${escapeHtml(e.wrong)}</b> → <b>${escapeHtml(e.correct)}</b>: ${escapeHtml(e.explanation)}</div>`).join("");
  const explanation = `${correct ? "Encontraste todos los errores del correo." : `Se detectaron ${hits} de ${errorWords.size} errores${falsePositives ? `, con ${falsePositives} selección(es) de más` : ""}.`}${list}`;
  showFeedback(correct, explanation, { context: ch.context });
}

function nextChallenge() {
  const sess = State.session;
  if (sess.outOfLives() || sess.index + 1 >= sess.total) {
    finalizeSession();
    return;
  }
  sess.advance();
  if (State.finalTimer && State.finalTimer.timerId) {
    clearInterval(State.finalTimer.timerId);
    State.finalTimer.timerId = null;
  }
  State.cState = {};
  State.answered = false;
  State.challengeStartTime = Date.now();
  navigate("game");
  if (State.currentLevel && State.currentLevel.isFinal && sess.index >= 5) startFinalTimer();
}

function finalizeSession(timedOut = false) {
  const sess = State.session;
  const level = State.currentLevel;
  if (State.finalTimer && State.finalTimer.timerId) clearInterval(State.finalTimer.timerId);
  AudioManager.stop();
  if (timedOut) sess.wrongCount++;
  const summary = sess.summary();
  const stars = summary.accuracy >= 90 ? 3 : summary.accuracy >= 70 ? 2 : summary.accuracy >= 40 ? 1 : 0;

  if (level && !level.isFinal) Storage.recordLevelResult(level.id, summary.accuracy, stars);
  if (level && level.isFinal && summary.accuracy >= 50) {
    const s = Storage.load(); s.finalBossCompleted = true; Storage.save();
  }
  if (level && level.type === "meaning") {
    const track = State.cState.meaningTrackAll || [];
  }
  if (level && level.type === "meaning" && summary.wrongCount === 0) {
    const s = Storage.load(); s.meaningPerfectRun = true; Storage.save();
  }
  if (level && level.id === 2 && summary.wrongCount === 0) {
    const s = Storage.load(); s.gueGuiPerfectRun = true; Storage.save();
  }

  const newBadges = checkBadges();
  if (level) AudioManager.playConfigured(level.isFinal ? "specialVictory" : "victory");
  navigate("levelResult", { lastSummary: summary, lastLevel: level, newBadges, finalTimedOut: timedOut });
}

function renderLevelResult() {
  const summary = State.lastSummary;
  const level = State.lastLevel;
  const nextLevel = level && !level.isFinal ? LEVELS.find(l => l.id === level.id + 1 && !l.isFinal) : null;
  const weak = Storage.weakestRules(3);
  const weakHtml = weak.length ? `
    <div class="card" style="margin-top:22px;text-align:left">
      <h3 style="font-size:16px;margin-bottom:10px">Parece que necesitas reforzar estas reglas</h3>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${weak.map(w => `<div style="display:flex;justify-content:space-between;align-items:center"><span>${escapeHtml(ruleNameFromId(w.ruleId))}</span><button class="btn btn-outline btn-sm" data-action="reviewRule" data-rule="${w.ruleId}">Repasar regla</button></div>`).join("")}
      </div>
    </div>
  ` : "";
  const badgesHtml = (State.newBadges && State.newBadges.length) ? `
    <div class="card" style="margin-top:22px">
      <h3 style="font-size:16px;margin-bottom:12px">¡Nuevas insignias desbloqueadas!</h3>
      <div class="grid grid-3">
        ${State.newBadges.map(b => `<div class="badge-card earned"><div class="icon">${escapeHtml(b.icon)}</div><h4>${escapeHtml(b.name)}</h4><p>${escapeHtml(b.desc)}</p></div>`).join("")}
      </div>
    </div>
  ` : "";
  const html = `
    <div class="screen screen-narrow">
      <div class="result-hero">
        <div class="home-eyebrow">${level && level.isFinal ? "Desafío final completado" : `Nivel ${level ? level.id : ""} completado`}</div>
        ${level && level.isFinal && State.lastSummary.accuracy >= 50 ? `<div class="master-diploma"><div class="diploma-seal">G/J</div><h2>MAESTRO TOTAL DE LA ORTOGRAFÍA</h2><p>Has recorrido cada regla, excepción, significado y contexto con una precisión digna de una defensa académica. Tu dominio de la G y la J ya no depende de la intuición: sabes argumentarlo.</p><strong>Certificado de excelencia lingüística · Nivel C2</strong></div>` : ""}
        <div class="result-score">${summary.score}</div>
        <p>puntos totales en esta partida</p>
        <div class="result-stats">
          <div><div class="v">${summary.accuracy}%</div><div class="l">Precisión</div></div>
          <div><div class="v">${summary.correctCount}/${summary.total}</div><div class="l">Correctas</div></div>
          <div><div class="v">${summary.bestStreak}</div><div class="l">Mejor racha</div></div>
        </div>
        ${weakHtml}
        ${badgesHtml}
        <div class="result-actions">
          ${nextLevel ? `<button class="btn btn-primary" data-action="startLevel" data-level="${nextLevel.id}">Siguiente nivel</button>` : ""}
          <button class="btn btn-outline" data-action="goto" data-screen="levelSelect">Selección de nivel</button>
          <button class="btn btn-ghost" data-action="home">Inicio</button>
        </div>
      </div>
    </div>
  `;
  renderShell(html);
}

function ruleNameFromId(ruleId) {
  const m = MODULES.find(x => x.id === ruleId);
  return m ? m.title : ruleId;
}

function reviewRule(ruleId) {
  navigate("learnModule", { learnModuleId: ruleId });
}

/* =======================================================================
   RETO RÁPIDO (60 segundos)
   ======================================================================= */
function startQuick() {
  const q = { current: null, score: 0, correct: 0, wrong: 0, timeLeft: 60, timerId: null, ended: false };
  q.current = pickAdaptiveQuickChallenge(q);
  State.quick = q;
  State.answered = false;
  AudioManager.start(USER_MUSIC_FILE);
  navigate("quick");
}

function renderQuick() {
  const q = State.quick;
  if (!q) { startQuick(); return; }
  const ch = q.current;
  const urgent = q.timeLeft <= 10;
  const html = `
    <div class="screen screen-narrow">
      <div class="quick-timer ${urgent ? "urgent" : ""}" id="quickTimerDisplay">${q.timeLeft}s</div>
      <div class="quick-bar"><div class="quick-bar-fill" id="quickBarFill" style="width:${(q.timeLeft / 60) * 100}%"></div></div>
      <div style="display:flex;justify-content:center;gap:24px;margin-bottom:18px;font-family:var(--font-mono);font-size:13px;color:var(--ink-dim)">
        <span>Puntos: <b class="mono" id="quickScoreDisplay" style="color:var(--ink)">${q.score}</b></span>
        <span>Aciertos: ${q.correct}</span>
        <span>Errores: ${q.wrong}</span>
      </div>
      <div class="challenge-panel" id="challengePanel">
        ${renderChallengeBody(ch)}
        <div id="feedbackSlot"></div>
      </div>
    </div>
  `;
  renderShell(html);
  if (!q.timerId && !q.ended) {
    q.timerId = setInterval(quickTick, 1000);
  }
}

function quickTick() {
  const q = State.quick;
  if (!q || q.ended) return;
  q.timeLeft--;
  const timerEl = document.getElementById("quickTimerDisplay");
  const barEl = document.getElementById("quickBarFill");
  if (timerEl) { timerEl.textContent = q.timeLeft + "s"; if (q.timeLeft <= 10) timerEl.classList.add("urgent"); }
  if (barEl) barEl.style.width = (q.timeLeft / 60) * 100 + "%";
  if (q.timeLeft <= 0) endQuick();
}

function quickAnswer(value) {
  const q = State.quick;
  if (!q || q.ended || State.answered) return;
  State.answered = true;
  const ch = q.current;
  const correct = normalizeAnswer(value) === normalizeAnswer(ch.answer);
  AudioManager.playConfigured(correct ? "correct" : "incorrect", correct);
  document.querySelectorAll(".letter-btn").forEach(btn => {
    const v = btn.getAttribute("data-value");
    if (normalizeAnswer(v) === normalizeAnswer(ch.answer)) btn.classList.add("correct-flash");
    else if (normalizeAnswer(v) === normalizeAnswer(value) && !correct) btn.classList.add("wrong-flash");
  });
  if (correct) { q.score += 10; q.correct++; } else { q.score = Math.max(0, q.score - 5); q.wrong++; }
  Storage.recordAnswer({ correct, letter: ch.letter, isException: ch.isException, ruleId: ch.ruleId });
  const scoreEl = document.getElementById("quickScoreDisplay");
  if (scoreEl) scoreEl.textContent = q.score;
  // Dificultad adaptativa: la siguiente palabra se elige según el rendimiento acumulado
  q.current = pickAdaptiveQuickChallenge(q);
  setTimeout(() => {
    if (q.ended) return;
    State.answered = false;
    renderQuick();
  }, 420);
}

function endQuick() {
  const q = State.quick;
  if (!q || q.ended) return;
  q.ended = true;
  clearInterval(q.timerId);
  Storage.updateBestQuick(q.score);
  navigate("quickResult");
}

function renderQuickResult() {
  const q = State.quick;
  const s = Storage.load();
  const total = q.correct + q.wrong;
  const acc = total ? Math.round((q.correct / total) * 100) : 0;
  const isRecord = q.score >= s.stats.bestQuickChallenge && q.score > 0;
  const html = `
    <div class="screen screen-narrow">
      <div class="result-hero">
        <div class="home-eyebrow">Reto rápido · resultado</div>
        <div class="result-score">${q.score}</div>
        <p>${isRecord ? "¡Nueva mejor marca!" : `Mejor marca: ${s.stats.bestQuickChallenge} pts`}</p>
        <div class="result-stats">
          <div><div class="v">${q.correct}</div><div class="l">Aciertos</div></div>
          <div><div class="v">${q.wrong}</div><div class="l">Errores</div></div>
          <div><div class="v">${acc}%</div><div class="l">Precisión</div></div>
        </div>
        <div class="result-actions">
          <button class="btn btn-primary" data-action="startQuick">Jugar de nuevo</button>
          <button class="btn btn-outline" data-action="goto" data-screen="modeSelect">Otros modos</button>
          <button class="btn btn-ghost" data-action="home">Inicio</button>
        </div>
      </div>
    </div>
  `;
  renderShell(html);
}

/* =======================================================================
   DOS JUGADORES (opcional, local)
   ======================================================================= */
function startTwoPlayer(name1, name2) {
  if (name1 === undefined && name2 === undefined) {
    name1 = "Jugador 1";
    name2 = "Jugador 2";
  }
  if (!name1 || !name2) { render(); return; }
  const queue = buildQuickChallengeQueue();
  State.two = {
    queue,
    c2Queue: WORDS.filter(w => w.difficulty === 4).map(ChallengeFactory.fromWordChoose),
    index: 0,
    turn: 1,
    scores: { 1: 0, 2: 0 },
    names: { 1: name1.trim().slice(0, 24), 2: name2.trim().slice(0, 24) },
    rounds: 12,
    phase: "normal",
    suddenRound: 1,
    suddenAnswers: 0,
    responseTime: { 1: 0, 2: 0 },
    timerId: null,
    timeLeft: null,
    challengeStartedAt: Date.now(),
    ended: false,
    announcement: ""
  };
  AudioManager.start(TWO_PLAYER_MUSIC_FILE);
  State.answered = false;
  navigate("two");
}

function startTwoOnboarding() {
  State.twoLobbyStep = "names";
  AudioManager.start(TWO_PLAYER_MUSIC_FILE);
  render();
}

function twoRoundLimit(t) {
  if (t.phase === "extreme") return 20;
  return [60, 45, 30, 20, 10][t.suddenRound - 1];
}

function twoCurrentChallenge(t) {
  const pool = t.phase === "extreme" ? t.c2Queue : t.queue;
  return pool[t.index % pool.length];
}

function startTwoTimer() {
  const t = State.two;
  if (!t || t.phase === "normal" || t.timerId) return;
  t.timeLeft = twoRoundLimit(t);
  t.challengeStartedAt = Date.now();
  t.timerId = setInterval(twoTick, 1000);
}

function twoTick() {
  const t = State.two;
  if (!t || t.phase === "normal" || t.ended) return;
  t.timeLeft--;
  const display = document.getElementById("twoTimerDisplay");
  if (display) display.textContent = `${t.timeLeft}s`;
  if (t.timeLeft <= 0) {
    clearInterval(t.timerId);
    t.timerId = null;
    twoAnswer("__timeout__", true);
  }
}

function renderTwo() {
  const t = State.two;
  if (!t) {
    if (State.twoLobbyStep !== "names") {
      const introHtml = `
        <div class="screen screen-narrow">
          <div class="battle-onboarding">
            <div class="home-eyebrow">Modo 1v1 · Preparación</div>
            <div class="battle-mark"><span class="g">G</span><span>VS</span><span class="j">J</span></div>
            <h1>La batalla está a punto de comenzar</h1>
            <p>Dos estrategas. Una palabra. Cada respuesta puede cambiar el marcador.</p>
            <div class="battle-rules"><div><b>01</b><span>Turnos alternos</span></div><div><b>02</b><span>La precisión suma puntos</span></div><div><b>03</b><span>Si hay empate, comienza la muerte súbita</span></div></div>
            <button class="btn btn-primary battle-start" data-action="startTwoOnboarding">Entrar a la batalla</button>
          </div>
        </div>
      `;
      renderShell(introHtml);
      AudioManager.start(TWO_PLAYER_MUSIC_FILE);
      return;
    }
    const html = `
      <div class="screen screen-narrow">
        <div class="page-head"><div class="eyebrow">C1 · Opcional · sin conexión</div><h1>Dos jugadores</h1><p>Escribe los nombres de quienes competirán. Si hay empate, el juego activa una muerte súbita progresiva.</p></div>
        <div class="card player-form" style="margin-top:24px">
          <label>Nombre del jugador 1<input id="playerOneName" maxlength="24" placeholder="Ej.: Martina" /></label>
          <label>Nombre del jugador 2<input id="playerTwoName" maxlength="24" placeholder="Ej.: Joaquín" /></label>
          <button class="btn btn-primary" data-action="startTwoPlayer">Comenzar duelo</button>
        </div>
      </div>
    `;
    renderShell(html);
    return;
  }
  if (t.ended) { renderTwoResult(); return; }
  const ch = twoCurrentChallenge(t);
  const phaseTitle = t.phase === "normal" ? `Turno de ${t.names[t.turn]}` : t.phase === "extreme" ? "MUERTE SÚBITA EXTREMA · SOLO C2" : "MUERTE SÚBITA · HORA DEL DESEMPATE";
  const announcement = t.announcement ? `<div class="sudden-announcement">${escapeHtml(t.announcement)}</div>` : "";
  const html = `
    <div class="screen screen-narrow">
      ${announcement}
      <div class="tp-turn-banner p${t.turn}">${escapeHtml(phaseTitle)}</div>
      ${t.phase !== "normal" ? `<div class="sudden-meta"><span>Ronda ${t.suddenRound} de 5</span><strong id="twoTimerDisplay">${t.timeLeft || twoRoundLimit(t)}s</strong></div>` : ""}
      <div class="tp-scores">
        <div><div class="v" style="color:var(--g-color)">${t.scores[1]}</div><div class="l">${escapeHtml(t.names[1])}</div></div>
        <div><div class="v" style="color:var(--j-color)">${t.scores[2]}</div><div class="l">${escapeHtml(t.names[2])}</div></div>
      </div>
      <p class="muted-note" style="margin-bottom:18px">${t.phase === "normal" ? `Ronda ${t.index + 1} de ${t.rounds}` : `Turno de ${escapeHtml(t.names[t.turn])}`}</p>
      <div class="challenge-panel" id="challengePanel">
        ${renderChallengeBody(ch)}
        <div id="feedbackSlot"></div>
      </div>
    </div>
  `;
  renderShell(html);
  startTwoTimer();
}

function twoAnswer(value, timedOut = false) {
  const t = State.two;
  if (!t || State.answered) return;
  if (t.timerId) { clearInterval(t.timerId); t.timerId = null; }
  State.answered = true;
  const ch = twoCurrentChallenge(t);
  const correct = normalizeAnswer(value) === normalizeAnswer(ch.answer);
  AudioManager.playConfigured(correct ? "correct" : "incorrect", correct);
  t.responseTime[t.turn] += Date.now() - t.challengeStartedAt;
  document.querySelectorAll(".letter-btn").forEach(btn => {
    const v = btn.getAttribute("data-value");
    if (normalizeAnswer(v) === normalizeAnswer(ch.answer)) btn.classList.add("correct-flash");
    else if (normalizeAnswer(v) === normalizeAnswer(value) && !correct) btn.classList.add("wrong-flash");
  });
  if (correct) t.scores[t.turn] += t.phase === "normal" ? 10 : 20;
  const slot = document.getElementById("feedbackSlot");
  if (slot) {
    slot.innerHTML = `<div class="feedback-panel ${correct ? "ok" : "bad"}">
      <div class="feedback-head ${correct ? "ok" : "bad"}">${timedOut ? "⌛ Tiempo agotado" : correct ? "✓ Correcto" : "✕ Incorrecto"}</div>
      <div class="feedback-rule">${escapeHtml(ch.explanation)}</div>
      <div class="feedback-actions"><button class="btn btn-primary" data-action="twoNext">Continuar</button></div>
    </div>`;
  }
}

function twoNext() {
  const t = State.two;
  if (t.timerId) { clearInterval(t.timerId); t.timerId = null; }
  t.index++;
  if (t.phase !== "normal") t.suddenAnswers++;
  t.turn = t.turn === 1 ? 2 : 1;
  State.answered = false;
  if (t.phase === "normal" && t.index >= t.rounds) {
    if (t.scores[1] === t.scores[2]) {
      t.phase = "sudden";
      t.index = 0;
      t.turn = 1;
      t.suddenRound = 1;
      t.suddenAnswers = 0;
      t.announcement = "Has entrado a la muerte súbita: el verdadero reto comienza.";
    } else t.ended = true;
  } else if (t.phase !== "normal" && t.suddenAnswers % 2 === 0) {
    if (t.scores[1] !== t.scores[2]) t.ended = true;
    else if (t.suddenRound < 5) {
      t.suddenRound++;
      t.index = 0;
      t.turn = 1;
      t.announcement = t.phase === "extreme" ? "Nueva ronda extrema: cada segundo cuenta." : "Hora del desempate: el margen de error se reduce.";
    } else if (t.phase === "sudden") {
      t.phase = "extreme";
      t.suddenRound = 1;
      t.suddenAnswers = 0;
      t.index = 0;
      t.turn = 1;
      t.announcement = "Has llegado a la muerte súbita extrema: solo C2, solo 20 segundos.";
    } else {
      t.ended = true;
    }
  }
  if (t.ended) AudioManager.playConfigured("specialVictory");
  navigate("two");
}

function renderTwoResult() {
  const t = State.two;
  const winnerId = t.scores[1] === t.scores[2] ? (t.responseTime[1] <= t.responseTime[2] ? 1 : 2) : (t.scores[1] > t.scores[2] ? 1 : 2);
  const winner = `¡Gana ${escapeHtml(t.names[winnerId])}!`;
  const html = `
    <div class="screen screen-narrow">
      <div class="result-hero">
        <div class="home-eyebrow">Dos jugadores · resultado</div>
        <h1 style="margin:10px 0">${winner}</h1>
        <div class="result-stats">
          <div><div class="v" style="color:var(--g-color)">${t.scores[1]}</div><div class="l">${escapeHtml(t.names[1])}</div></div>
          <div><div class="v" style="color:var(--j-color)">${t.scores[2]}</div><div class="l">${escapeHtml(t.names[2])}</div></div>
        </div>
        <div class="result-actions">
          <button class="btn btn-primary" data-action="startTwoPlayer">Jugar de nuevo</button>
          <button class="btn btn-ghost" data-action="home">Inicio</button>
        </div>
      </div>
    </div>
  `;
  renderShell(html);
}

/* =======================================================================
   PROGRESO
   ======================================================================= */
function renderProgress() {
  const s = Storage.load();
  const levelsCompleted = Object.values(s.levels).filter(l => l.completed).length;
  const totalLevels = LEVELS.length;
  const overallAcc = s.stats.totalAnswered ? Math.round((s.stats.totalCorrect / s.stats.totalAnswered) * 100) : 0;

  const ruleRows = Object.entries(s.stats.ruleStats).map(([ruleId, v]) => {
    const total = v.correct + v.wrong;
    const pct = total ? Math.round((v.correct / total) * 100) : 0;
    return { ruleId, pct, total };
  }).filter(r => r.total > 0).sort((a, b) => a.pct - b.pct);

  const rowsHtml = ruleRows.map(r => `
    <div class="rule-progress-row">
      <span class="name">${escapeHtml(ruleNameFromId(r.ruleId))}</span>
      <div class="bar"><div class="bar-fill" style="width:${r.pct}%; background:${r.pct >= 70 ? "var(--success)" : r.pct >= 40 ? "var(--warn)" : "var(--danger)"}"></div></div>
      <span class="pct">${r.pct}%</span>
    </div>
  `).join("") || `<p class="muted-note">Aún no hay estadísticas por regla. ¡Juega un nivel para empezar!</p>`;

  const html = `
    <div class="screen">
      <div class="page-head"><div class="eyebrow">Tu progreso</div><h1>Estadísticas</h1></div>
      <div class="grid grid-4" style="margin-top:22px">
        <div class="card stat-card"><div class="val">${levelsCompleted}/${totalLevels}</div><div class="lab">Niveles completados</div></div>
        <div class="card stat-card"><div class="val">${s.stats.totalScore}</div><div class="lab">Puntuación acumulada</div></div>
        <div class="card stat-card"><div class="val">${overallAcc}%</div><div class="lab">Precisión general</div></div>
        <div class="card stat-card"><div class="val">${s.stats.bestStreak}</div><div class="lab">Mejor racha</div></div>
      </div>
      <div class="grid grid-3" style="margin-top:16px">
        <div class="card stat-card"><div class="val">${s.stats.bestQuickChallenge}</div><div class="lab">Mejor reto rápido</div></div>
        <div class="card stat-card"><div class="val">${s.badges.length}/${BADGES.length}</div><div class="lab">Insignias obtenidas</div></div>
        <div class="card stat-card"><div class="val">${s.stats.totalAnswered}</div><div class="lab">Preguntas respondidas</div></div>
      </div>
      <div class="section-head"><h2>Reglas dominadas y reglas a reforzar</h2></div>
      <div class="card">${rowsHtml}</div>
      <div style="text-align:center;margin-top:34px">
        <button class="btn btn-outline btn-sm" data-action="confirmReset">Restablecer progreso</button>
      </div>
    </div>
  `;
  renderShell(html);
}

function confirmReset() {
  State.toast = `
    <div class="modal-box">
      <button class="modal-close" data-action="dismissToastForce" aria-label="Cerrar">✕</button>
      <h3>Restablecer progreso</h3>
      <p>Esto borrará toda tu puntuación, niveles, insignias y estadísticas guardadas en este dispositivo. Esta acción no se puede deshacer.</p>
      <div class="reset-confirm-actions">
        <button class="btn btn-outline btn-sm" data-action="dismissToast">Cancelar</button>
        <button class="btn btn-sm" style="background:var(--danger);color:#fff" data-action="doReset">Sí, restablecer</button>
      </div>
    </div>
  `;
  render();
}

function doReset() {
  Storage.reset();
  State.toast = null;
  navigate("progress");
}

/* =======================================================================
   INSIGNIAS
   ======================================================================= */
function renderBadges() {
  const s = Storage.load();
  const cards = BADGES.map(b => {
    const earned = s.badges.includes(b.id);
    return `<div class="card badge-card ${earned ? "earned" : "locked"}"><div class="icon">${escapeHtml(b.icon)}</div><h4>${escapeHtml(b.name)}</h4><p>${escapeHtml(b.desc)}</p></div>`;
  }).join("");
  const html = `
    <div class="screen">
      <div class="page-head"><div class="eyebrow">Logros</div><h1>Insignias</h1><p>${s.badges.length} de ${BADGES.length} desbloqueadas.</p></div>
      <div class="grid grid-4" style="margin-top:24px">${cards}</div>
    </div>
  `;
  renderShell(html);
}

/* =======================================================================
   MODO EXPOSICIÓN
   ======================================================================= */
function renderExpo() {
  const i = State.expo.index;
  const item = EXPO_QUESTIONS[i];
  const html = `
    <div class="screen">
      <div class="page-head" style="text-align:center"><div class="eyebrow">Modo exposición · C2</div><h1>Preguntas para el público</h1><p class="expo-counter">Pregunta ${i + 1} de ${EXPO_QUESTIONS.length}</p></div>
      <div class="expo-stage">
        <div class="expo-q">${escapeHtml(item.q)}</div>
        ${State.expo.revealed ? `<div class="expo-answer"><p><b>${escapeHtml(item.a)}</b></p><p style="margin-top:8px">${escapeHtml(item.detail)}</p></div>` : `<div style="margin-top:26px"><button class="btn btn-primary" data-action="expoReveal">Revelar respuesta</button></div>`}
        <div class="expo-nav">
          <button class="btn btn-outline" ${i === 0 ? "disabled" : ""} data-action="expoPrev">&larr; Anterior</button>
          <button class="btn btn-outline" data-action="goto" data-screen="modeSelect">Salir del modo exposición</button>
          <button class="btn btn-outline" ${i === EXPO_QUESTIONS.length - 1 ? "disabled" : ""} data-action="expoNext">Siguiente &rarr;</button>
        </div>
      </div>
    </div>
  `;
  renderShell(html);
}
function expoReveal() { State.expo.revealed = true; render(); }
function expoNext() { State.expo.index = Math.min(EXPO_QUESTIONS.length - 1, State.expo.index + 1); State.expo.revealed = false; render(); }
function expoPrev() { State.expo.index = Math.max(0, State.expo.index - 1); State.expo.revealed = false; render(); }

/* =======================================================================
   CRÉDITOS / ACERCA DEL PROYECTO
   ======================================================================= */
function renderCredits() {
  const html = `
    <div class="screen screen-narrow">
      <div class="credits-block">
        <div class="home-eyebrow">Proyecto educativo</div>
        <h2>El uso de la G y la J en la ortografía española</h2>
        <p style="max-width:520px;margin:0 auto">Una experiencia interactiva para aprender, practicar y aplicar las reglas ortográficas de la G y la J, desarrollada como complemento directo de una exposición escolar sobre el mismo tema.</p>
        <div class="divider"></div>
        <p style="max-width:520px;margin:0 auto">«G vs J — La Misión Ortográfica» combina 19 módulos de teoría, 12 tipos de desafío, 10 niveles progresivos, un examen final, un reto contrarreloj, un modo para dos jugadores y un modo de exposición, todo basado en la investigación original sobre el tema.</p>
        <p class="sig">Progreso guardado localmente en este dispositivo · Sin conexión a servidores externos</p>
        <div style="margin-top:26px"><button class="btn btn-primary" data-action="home">Volver al inicio</button></div>
      </div>
    </div>
  `;
  renderShell(html);
}

/* =======================================================================
   RENDER DISPATCHER
   ======================================================================= */
function render() {
  switch (State.screen) {
    case "home": return renderHome();
    case "modeSelect": return renderModeSelect();
    case "tutorial": return renderTutorial();
    case "learn": return renderLearn();
    case "learnModule": return renderLearnModule();
    case "rules": return renderRules();
    case "levelSelect": return renderLevelSelect();
    case "finalIntro": return renderFinalIntro();
    case "game": return renderGame();
    case "levelResult": return renderLevelResult();
    case "quick": return renderQuick();
    case "quickResult": return renderQuickResult();
    case "two": return renderTwo();
    case "progress": return renderProgress();
    case "badges": return renderBadges();
    case "expo": return renderExpo();
    case "credits": return renderCredits();
    default: return renderHome();
  }
}
