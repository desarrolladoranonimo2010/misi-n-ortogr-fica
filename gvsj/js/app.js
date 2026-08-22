/* =========================================================================
   app.js — Punto de entrada. Delegación de eventos global y arranque.
   ========================================================================= */

function handleAction(action, el, ev) {
  switch (action) {
    /* Navegación genérica */
    case "goto": {
      const screen = el.getAttribute("data-screen");
      const extra = {};
      if (el.hasAttribute("data-module")) extra.learnModuleId = el.getAttribute("data-module");
      if (screen === "finalIntro") {
        const save = Storage.load();
        const complete = LEVELS.filter(l => !l.isFinal).every(l => save.levels[l.id] && save.levels[l.id].completed);
        if (!complete) {
          State.toast = "El desafío final se desbloquea al completar todos los niveles anteriores.";
          render();
          break;
        }
      }
      if (isActiveActivity()) requestAbandon(screen);
      else navigate(screen, extra);
      break;
    }
    case "home": goHome(); break;
    case "back": goBack(); break;
    case "confirmAbandon": confirmAbandon(); break;
    case "cancelAbandon": State.abandon = null; render(); break;
    case "dismissToast": if (ev.target === el) { State.toast = null; render(); } break;
    case "dismissToastForce": State.toast = null; render(); break;

    /* Niveles */
    case "startLevel": startLevel(Number(el.getAttribute("data-level"))); break;
    case "startFinal": startFinal(); break;
    case "reviewRule": reviewRule(el.getAttribute("data-rule")); break;

    /* Respuestas dentro de una partida (nivel / final / reto rápido / dos jugadores) */
    case "answerLetter": {
      const value = el.getAttribute("data-value");
      if (State.screen === "quick") quickAnswer(value);
      else if (State.screen === "two") twoAnswer(value);
      else answerLetter(value);
      break;
    }
    case "submitFix": submitFix(); break;
    case "pickToken": pickToken(el.getAttribute("data-word"), el); break;
    case "pickNoError": pickNoError(); break;
    case "answerChoice": answerChoice(el.getAttribute("data-value"), el.getAttribute("data-correct"), el); break;
    case "toggleEmailToken": toggleEmailToken(el.getAttribute("data-word"), el); break;
    case "submitEmail": submitEmail(); break;
    case "nextChallenge": nextChallenge(); break;

    /* Reto rápido */
    case "startQuick": startQuick(); break;

    /* Dos jugadores */
    case "startTwoPlayer": startTwoPlayer(document.getElementById("playerOneName")?.value, document.getElementById("playerTwoName")?.value); break;
    case "startTwoOnboarding": startTwoOnboarding(); break;
    case "twoNext": twoNext(); break;

    /* Progreso */
    case "confirmReset": confirmReset(); break;
    case "doReset": doReset(); break;

    /* Modo exposición */
    case "expoReveal": expoReveal(); break;
    case "expoNext": expoNext(); break;
    case "expoPrev": expoPrev(); break;

    default: break;
  }
}

document.addEventListener("click", (ev) => {
  // Cierre de modal al hacer click fuera de la caja (pero no dentro de ella)
  const overlay = ev.target.closest(".modal-overlay");
  if (overlay && ev.target === overlay) {
    State.toast = null;
    render();
    return;
  }
  const el = ev.target.closest("[data-action]");
  if (!el) return;
  const action = el.getAttribute("data-action");
  const answerActions = ["answerLetter", "answerChoice", "submitFix", "pickToken", "pickNoError", "toggleEmailToken", "submitEmail"];
  if (el.classList.contains("play-cta")) AudioManager.playConfigured("play");
  else if (!answerActions.includes(action)) AudioManager.playConfigured("button", true);
  handleAction(action, el, ev);
});

// Cerrar modal con tecla Escape (accesibilidad: ningún modal debe quedar atrapado)
document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape" && State.toast) { State.toast = null; render(); return; }
  // Activar con Enter/Espacio elementos clicables que no son <button> nativo
  if ((ev.key === "Enter" || ev.key === " ") && ev.target && ev.target.getAttribute && ev.target.getAttribute("role") === "button") {
    ev.preventDefault();
    ev.target.click();
  }
});

// Arranque
document.addEventListener("DOMContentLoaded", () => {
  Storage.load();
  render();
  AudioManager.start(LOBBY_MUSIC_FILE);
});
