const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

const files = ["js/data.js", "js/storage.js", "js/game.js", "js/ui.js", "js/app.js"];
const appScript = files.map(f => fs.readFileSync(path.join(__dirname, "..", f), "utf8")).join("\n;\n");
const testBody = fs.readFileSync(path.join(__dirname, "test-body.js"), "utf8");

const fullScript = appScript + "\n;\n" + testBody;

const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="app"></div></body></html>`, {
  runScripts: "outside-only",
  url: "http://localhost/",
  pretendToBeVisual: true
});
const { window } = dom;
window.localStorage = (() => {
  let store = {};
  return {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
    clear: () => { store = {}; }
  };
})();
window.console = console;
window.scrollTo = () => {};

dom.window.eval(fullScript);

if (window.__TEST_FAILED__) {
  console.error("FALLO EN PRUEBA:", window.__TEST_FAILED__);
  process.exit(1);
} else {
  console.log("\n=== TODAS LAS PRUEBAS PASARON ===");
}
