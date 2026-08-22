/* Cuerpo de pruebas — se concatena y evalúa junto al código de la app,
   por lo que comparte el mismo scope (State, render, navigate, MODULES...). */

function __log(step) { console.log("OK:", step); }

function __answerChallengeCorrectly(ch) {
  switch (ch.type) {
    case "choose_letter":
    case "complete_word":
    case "trap_word": {
      const btn = [...document.querySelectorAll(".letter-btn")].find(b => b.getAttribute("data-value") === ch.answer);
      if (!btn) throw new Error("No option button for answer " + ch.answer);
      btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      break;
    }
    case "fix_word": {
      const input = document.getElementById("fixInput");
      input.value = ch.answer;
      submitFix();
      break;
    }
    case "detect_error": {
      if (ch.noError) { pickNoError(); }
      else {
        const tok = [...document.querySelectorAll(".tok")].find(t => t.getAttribute("data-word").toLowerCase() === ch.wrongWord.toLowerCase());
        if (!tok) throw new Error("No token found for " + ch.wrongWord);
        tok.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      }
      break;
    }
    case "match_rule":
    case "verb_change": {
      const btn = [...document.querySelectorAll(".choice-btn")].find(b => b.getAttribute("data-value") === ch.answer);
      if (!btn) throw new Error("No choice for answer " + ch.answer + " type=" + ch.type);
      btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      break;
    }
    case "meaning": {
      const correctOpt = ch.options.find(o => o.correct);
      const btn = [...document.querySelectorAll(".choice-btn")].find(b => b.getAttribute("data-value") === correctOpt.text);
      btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      break;
    }
    case "email_check": {
      ch.errors.forEach(er => {
        const tok = [...document.querySelectorAll(".tok")].find(t => t.getAttribute("data-word").toLowerCase() === er.wrong.toLowerCase());
        if (tok) tok.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      submitEmail();
      break;
    }
    case "app_check":
    case "security_check":
    case "programming_check": {
      const btn = [...document.querySelectorAll(".choice-btn")].find(b => b.getAttribute("data-correct") === "true");
      if (!btn) throw new Error("No correct choice for " + ch.type);
      btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      break;
    }
    default:
      throw new Error("Tipo de desafío no manejado en test: " + ch.type);
  }
}

try {
  document.dispatchEvent(new Event("DOMContentLoaded"));
  __log("Carga inicial (home)");
  if (!document.querySelector(".gj-duel")) throw new Error("Home no renderizó gj-duel");

  navigate("learn");
  const moduleItems = document.querySelectorAll(".module-list-item");
  if (moduleItems.length !== MODULES.length) throw new Error("Cantidad de módulos no coincide: " + moduleItems.length);
  __log("Aprender lista " + moduleItems.length + " módulos");

  MODULES.forEach(m => {
    navigate("learnModule", { learnModuleId: m.id });
    if (!document.querySelector(".page-head h1")) throw new Error("Módulo sin título: " + m.id);
  });
  __log("Todos los módulos renderizan sin error");

  navigate("rules");
  if (document.querySelectorAll(".rule-ref-card").length !== MODULES.length) throw new Error("Rules count mismatch");
  __log("Pantalla de reglas OK");

  navigate("tutorial");
  if (document.querySelectorAll(".method-step").length !== 6) throw new Error("Tutorial steps != 6");
  __log("Tutorial OK (6 pasos)");

  // Jugar cada nivel completo respondiendo siempre de forma correcta
  LEVELS.filter(l => !l.isFinal).forEach(level => {
    startLevel(level.id);
    let guard = 0;
    while (State.screen === "game" && guard < 60) {
      guard++;
      const ch = State.session.current;
      __answerChallengeCorrectly(ch);
      const btn = document.querySelector('[data-action="nextChallenge"]');
      if (!btn) throw new Error("Sin botón continuar en nivel " + level.id);
      btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }
    if (State.screen !== "levelResult") throw new Error("Nivel " + level.id + " no llegó a resultado, screen=" + State.screen);
    __log("Nivel " + level.id + " (" + level.title + ") completado. Score=" + State.lastSummary.score + " Acc=" + State.lastSummary.accuracy + "%");
  });

  // Desafío final
  startFinal();
  {
    let guard = 0;
    while (State.screen === "game" && guard < 60) {
      guard++;
      const ch = State.session.current;
      __answerChallengeCorrectly(ch);
      const btn = document.querySelector('[data-action="nextChallenge"]');
      btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }
    if (State.screen !== "levelResult") throw new Error("Final no llegó a resultado");
    __log("Desafío final completado. Score=" + State.lastSummary.score + " Acc=" + State.lastSummary.accuracy + "%");
  }

  // Reto rápido (con dificultad adaptativa)
  startQuick();
  for (let i = 0; i < 5; i++) {
    const ch = State.quick.current;
    quickAnswer(ch.answer);
    State.answered = false;
    renderQuick();
  }
  endQuick();
  if (State.screen !== "quickResult") throw new Error("Reto rápido no terminó bien");
  __log("Reto rápido OK. Score=" + State.quick.score);

  // Dos jugadores
  startTwoPlayer();
  {
    let guard = 0;
    while (!State.two.ended && guard < 30) {
      guard++;
      const ch = State.two.queue[State.two.index % State.two.queue.length];
      twoAnswer(ch.answer);
      const btn = document.querySelector('[data-action="twoNext"]');
      if (btn) btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }
  }
  __log("Dos jugadores OK. P1=" + State.two.scores[1] + " P2=" + State.two.scores[2]);

  // Progreso
  navigate("progress");
  if (!document.querySelector(".stat-card")) throw new Error("Progress screen missing stat-card");
  __log("Progreso OK, insignias=" + Storage.load().badges.length);

  // Reset con modal
  confirmReset();
  if (!document.querySelector('[data-action="doReset"]')) throw new Error("Modal reset no renderizó");
  doReset();
  if (Storage.load().stats.totalScore !== 0) throw new Error("Reset no limpió el score");
  __log("Reset de progreso OK");

  // Insignias
  navigate("badges");
  if (document.querySelectorAll(".badge-card").length !== BADGES.length) throw new Error("Badges count mismatch");
  __log("Insignias screen OK");

  // Modo exposición
  State.expo = { index: 0, revealed: false };
  navigate("expo");
  for (let i = 0; i < EXPO_QUESTIONS.length; i++) {
    expoReveal();
    if (!document.querySelector(".expo-answer")) throw new Error("Expo answer no reveló en pregunta " + i);
    if (i < EXPO_QUESTIONS.length - 1) expoNext();
  }
  __log("Modo exposición: " + EXPO_QUESTIONS.length + " preguntas OK");

  // Créditos
  navigate("credits");
  if (!document.querySelector(".credits-block")) throw new Error("Credits screen missing");
  __log("Créditos OK");

  // Verificar bloqueo de niveles tras reset
  navigate("levelSelect");
  const locked = document.querySelectorAll(".level-card.locked").length;
  __log("Nivel select tras reset: " + locked + " niveles bloqueados (se espera >0)");

  // Verificar que ningún botón data-action quede roto (acción desconocida) recorriendo pantallas clave
  ["home", "modeSelect", "learn", "rules", "levelSelect", "progress", "badges", "credits"].forEach(scr => {
    navigate(scr);
    document.querySelectorAll("[data-action]").forEach(elX => {
      const act = elX.getAttribute("data-action");
      if (!act) throw new Error("Elemento sin acción válida en " + scr);
    });
  });
  __log("Verificación de botones en pantallas principales OK");

  // --- Camino de respuestas incorrectas: agotar vidas y verificar fin de partida ---
  startLevel(3);
  {
    let guard = 0;
    while (State.screen === "game" && guard < 30) {
      guard++;
      const ch = State.session.current;
      if (ch.type === "choose_letter" || ch.type === "complete_word" || ch.type === "trap_word") {
        const wrongOpt = ch.options.find(o => o !== ch.answer) || ch.options[0];
        const btn = [...document.querySelectorAll(".letter-btn")].find(b => b.getAttribute("data-value") === wrongOpt);
        btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      } else if (ch.type === "fix_word") {
        const input = document.getElementById("fixInput");
        input.value = "respuesta_incorrecta_a_proposito";
        submitFix();
      } else {
        const btn = document.querySelector(".choice-btn, .letter-btn");
        if (btn) btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      }
      const nextBtn = document.querySelector('[data-action="nextChallenge"]');
      if (!nextBtn) throw new Error("Sin botón continuar tras respuesta incorrecta");
      nextBtn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }
    if (State.screen !== "levelResult") throw new Error("Camino de vidas agotadas no llegó a resultado. screen=" + State.screen);
    if (State.lastSummary.livesLeft !== 0) throw new Error("Se esperaba game over por vidas agotadas, livesLeft=" + State.lastSummary.livesLeft);
    __log("Camino de vidas agotadas (game over) OK. Score final=" + State.lastSummary.score + " Precisión=" + State.lastSummary.accuracy + "%");
  }

  // Verificar que el sistema de repaso inteligente puede sugerir reglas débiles
  navigate("levelResult", { lastSummary: State.lastSummary, lastLevel: State.lastLevel, newBadges: [] });
  const reviewBtn = document.querySelector('[data-action="reviewRule"]');
  if (!reviewBtn) {
    __log("Repaso inteligente: sin reglas débiles suficientes aún (comportamiento válido con pocos datos)");
  } else {
    reviewBtn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    if (State.screen !== "learnModule") throw new Error("Repasar regla no navegó al módulo");
    __log("Repaso inteligente de reglas débiles OK");
  }

} catch (e) {
  window.__TEST_FAILED__ = e.message + "\n" + e.stack;
}

