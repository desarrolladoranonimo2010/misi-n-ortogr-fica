/* =========================================================================
   G vs J — La Misión Ortográfica
   data.js — Base de datos de contenido pedagógico
   Toda la información aquí se basa en las reglas de la investigación
   "El uso de la G y la J en la ortografía española". No se inventan reglas.
   ========================================================================= */

/* -------------------------------------------------------------------------
   1. MÓDULOS DE APRENDIZAJE (modo APRENDER)
   Cada módulo agrupa una explicación conceptual + ejemplos + excepciones.
   ------------------------------------------------------------------------- */
const MODULES = [
  {
    id: "m1", num: 1, title: "El conflicto entre G y J",
    summary: "Por qué G y J compiten delante de E e I.",
    body: [
      "Delante de A, O, U la lectura no genera dudas: la G suena suave (gato, gota, gusano) y la J suena fuerte (jarra, joven, juego).",
      "El problema aparece delante de E e I: en esa posición, tanto G como J pueden representar el mismo sonido fricativo velar sordo /x/. Por eso 'gente' y 'jefe' suenan de forma parecida, aunque se escriban distinto."
    ],
    examples: [
      { seq: "ge", word: "gente" }, { seq: "gi", word: "girar" },
      { seq: "je", word: "jefe" }, { seq: "ji", word: "jirafa" }
    ],
    visualRule: [
      { pattern: "G + A / O / U", result: "sonido suave", cls: "g" },
      { pattern: "J + A / O / U", result: "sonido fuerte", cls: "j" },
      { pattern: "G / J + E / I", result: "puede sonar igual — /x/", cls: "warn" }
    ]
  },
  {
    id: "m2", num: 2, title: "El papel especial de la U",
    summary: "GUE/GUI vs GÜE/GÜI y el uso de la diéresis.",
    body: [
      "En GUE y GUI la U normalmente no se pronuncia: solo está ahí para que la G conserve su sonido suave delante de E o I. Ejemplos: guerra, guitarra, guiso, manguera.",
      "Cuando sí queremos que la U se pronuncie, se coloca una diéresis (¨) sobre ella: GÜE / GÜI. Ejemplos: pingüino, cigüeña, vergüenza, agüita, antigüedad, bilingüe."
    ],
    examples: [
      { seq: "gue (u muda)", word: "guerra" }, { seq: "gui (u muda)", word: "guitarra" },
      { seq: "güe (u sonora)", word: "pingüino" }, { seq: "güi (u sonora)", word: "agüita" }
    ],
    visualRule: [
      { pattern: "GU + E/I", result: "U muda", cls: "g" },
      { pattern: "GÜ + E/I", result: "U pronunciada (diéresis)", cls: "j" }
    ]
  },
  {
    id: "m3", num: 3, title: "Reglas de la G: GEST-, GEO-, LEG-, GEN",
    summary: "Cuatro secuencias que casi siempre van con G.",
    body: [
      "GEST-: gestar, gestión, gesticular, gestación. Excepción destacada: majestuoso.",
      "GEO- (relación con la idea de tierra): geografía, geología, geometría, geopolítica.",
      "LEG- seguida de E o I: legislar, legítimo, legible, legión. Excepciones: lejía, lejos, lejanía.",
      "GEN: gente, agencia, origen, margen, inteligencia, aborigen. Excepciones: ajenjo, jengibre, avejentar, jején. También algunas formas verbales como dejen, tejen, crujen escapan al patrón porque pertenecen a verbos en -jar/-jer/-jir."
    ],
    examples: [
      { seq: "GEST-", word: "gestión" }, { seq: "GEO-", word: "geografía" },
      { seq: "LEG-", word: "legislar" }, { seq: "GEN", word: "inteligencia" }
    ],
    exceptions: ["majestuoso", "lejía", "lejos", "lejanía", "ajenjo", "jengibre", "avejentar", "jején", "dejen", "tejen", "crujen"]
  },
  {
    id: "m4", num: 4, title: "Terminaciones con G",
    summary: "-gión, -gionario, -gioso/-giosa, -gírico, -gia/-gio.",
    body: [
      "-GIÓN: región, religión.  -GIONARIO: legionario.  -GIOSO/-GIOSA: religioso, contagioso.  -GÍRICO: panegírico.  -GIA/-GIO: magia, colegio, plagio.",
      "Excepciones importantes que terminan en -jía y suenan parecido: bujía, lejía, herejía, apoplejía, hemiplejía, crujía."
    ],
    examples: [
      { seq: "-gión", word: "religión" }, { seq: "-gioso", word: "contagioso" },
      { seq: "-gia", word: "magia" }, { seq: "-gio", word: "colegio" }
    ],
    exceptions: ["bujía", "lejía", "herejía", "apoplejía", "hemiplejía", "crujía"]
  },
  {
    id: "m5", num: 5, title: "Terminaciones cultas",
    summary: "-gélico, -genario, -géneo, -génico, -genio, -génito, -gesimal, -gésimo, -gético, -ígeno/-ígera.",
    body: [
      "Estas terminaciones de origen culto (latín/griego) se escriben con G: evangélico, octogenario, homogéneo, fotogénico, ingenio, primogénito, vigesimal, trigésimo, apologético.",
      "También el grupo -ígeno / -ígena / -ígero / -ígera: oxígeno, indígena, belígero."
    ],
    examples: [
      { seq: "-géneo", word: "homogéneo" }, { seq: "-génito", word: "primogénito" },
      { seq: "-ígeno", word: "oxígeno" }, { seq: "-ígena", word: "indígena" }
    ]
  },
  {
    id: "m6", num: 6, title: "Terminaciones científicas",
    summary: "-logía, -gogía, -algia: vocabulario académico y médico.",
    body: [
      "-LOGÍA (estudio o ciencia de algo): biología, tecnología.",
      "-GOGÍA / -GOGIA: pedagogía.",
      "-ALGIA (relacionada con dolor): neuralgia.",
      "Este vocabulario científico y médico refuerza que casi todas estas terminaciones cultas van con G."
    ],
    examples: [
      { seq: "-logía", word: "biología" }, { seq: "-gogía", word: "pedagogía" },
      { seq: "-algia", word: "neuralgia" }
    ]
  },
  {
    id: "m7", num: 7, title: "Verbos con G: -ger, -gir, -igerar",
    summary: "coger, proteger, dirigir, exigir, aligerar, refrigerar.",
    body: [
      "Los verbos terminados en -GER, -GIR e -IGERAR se escriben con G en su infinitivo: coger, proteger, dirigir, exigir, aligerar, refrigerar.",
      "Excepciones destacadas que NO siguen este patrón: tejer, crujir (se escriben con J)."
    ],
    examples: [
      { seq: "-ger", word: "proteger" }, { seq: "-gir", word: "dirigir" },
      { seq: "-igerar", word: "refrigerar" }
    ],
    exceptions: ["tejer", "crujir"]
  },
  {
    id: "m8", num: 8, title: "Reglas de la J: AJE-, EJE-",
    summary: "Palabras que comienzan por AJE- y EJE-.",
    body: [
      "AJE- al inicio de palabra: ajedrez, ajetreo.",
      "EJE- al inicio de palabra: ejemplo, ejercicio, ejecutar.",
      "Excepciones que empiezan igual pero van con G: agenda, agencia, agente."
    ],
    examples: [
      { seq: "AJE-", word: "ajedrez" }, { seq: "EJE-", word: "ejercicio" }
    ],
    exceptions: ["agenda", "agencia", "agente"]
  },
  {
    id: "m9", num: 9, title: "Terminaciones con J",
    summary: "-aje/-eje, -jería, -jero/-jera, -jear.",
    body: [
      "-AJE / -EJE: coraje, viaje, garaje, vendaje, hereje, despeje. Excepciones cultas poco frecuentes: ambages, enálage.",
      "-JERÍA: relojería, conserjería, brujería, cerrajería.",
      "-JERO / -JERA: cajero, pasajero, lisonjero. Excepción trampa: ligero (se escribe con G aunque termine igual que 'cajero').",
      "-JEAR: canjear, cojear, homenajear, hojear, ojear, burbujear. La J se mantiene en todas las formas conjugadas de estos verbos."
    ],
    examples: [
      { seq: "-aje", word: "viaje" }, { seq: "-jería", word: "relojería" },
      { seq: "-jero", word: "pasajero" }, { seq: "-jear", word: "hojear" }
    ],
    exceptions: ["ambages", "enálage", "ligero"]
  },
  {
    id: "m10", num: 10, title: "Verbos rebeldes",
    summary: "Verbos que cambian su escritura al conjugarse: decir, traer, -ducir.",
    body: [
      "DECIR: decir → dije, dijimos, predijeron.",
      "TRAER: traer → traje, trajimos, contrajeron.",
      "Verbos en -DUCIR: conducir → conduje, producir → produjeron, deducir → dedujimos, traducir → tradujera.",
      "Estos verbos 'cambian de forma': aunque el infinitivo no tenga J, ciertas conjugaciones (pretérito y derivados) sí la incorporan."
    ],
    examples: [
      { seq: "decir →", word: "dije" }, { seq: "traer →", word: "traje" },
      { seq: "conducir →", word: "conduje" }, { seq: "producir →", word: "produjeron" }
    ]
  },
  {
    id: "m11", num: 11, title: "Familias léxicas",
    summary: "Observar palabras relacionadas ayuda a decidir entre G y J.",
    body: [
      "Cuando una palabra genera dudas, buscar otras de su misma familia léxica puede aclarar la escritura: caja → cajita → cajón; rojo → rojizo; reloj → relojero; viejo → viejecito.",
      "Si la familia completa se escribe con la misma letra, es una señal fuerte (aunque no infalible) de cuál corresponde."
    ],
    examples: [
      { seq: "caja →", word: "cajita, cajón" }, { seq: "reloj →", word: "relojero" }
    ]
  },
  {
    id: "m12", num: 12, title: "Alternancia G → J (avanzado)",
    summary: "En verbos -ger/-gir, la G cambia a J para conservar el sonido fuerte.",
    body: [
      "En los verbos terminados en -GER y -GIR, la G del infinitivo cambia a J cuando la siguiente vocal es A u O, porque 'ga' y 'go' con G sonarían suaves y romperían el sonido fuerte /x/ del verbo.",
      "COGER: yo cojo, tú coges, coja, cojas, cojamos.",
      "EXIGIR: yo exijo, tú exiges, exija, exijas, exijamos.",
      "DIRIGIR: yo dirijo, tú diriges, dirija, dirijas.",
      "PROTEGER: yo protejo, tú proteges, proteja, protejamos.",
      "El cambio COG-→COJ-, EXIG-→EXIJ-, DIRIG-→DIRIJ- no es una excepción: es la ortografía protegiendo el mismo sonido."
    ],
    examples: [
      { seq: "COG- →", word: "COJ- (yo cojo)" }, { seq: "EXIG- →", word: "EXIJ- (yo exijo)" },
      { seq: "DIRIG- →", word: "DIRIJ- (yo dirijo)" }, { seq: "PROTEG- →", word: "PROTEJ- (yo protejo)" }
    ]
  },
  {
    id: "m13", num: 13, title: "Homófonas y parónimas",
    summary: "Palabras casi idénticas donde una sola letra cambia el significado.",
    body: [
      "GIRA / JIRA — Gira: excursión o viaje, o forma del verbo girar. Jira: pedazo de tela, o merienda/banquete campestre.",
      "INGERIR / INJERIR — Ingerir: introducir alimentos o medicamentos en el cuerpo. Injerir: entrometerse o introducir algo en otra cosa.",
      "VEGETAR / VEJETAR — Vegetar: crecer las plantas o vivir de forma pasiva. Vejetar: envejecer.",
      "AGITO / AJITO — Agito: forma del verbo agitar. Ajito: diminutivo de ajo."
    ],
    examples: [
      { seq: "gira / jira", word: "viaje / tela" }, { seq: "ingerir / injerir", word: "comer / entrometerse" }
    ]
  },
  {
    id: "m14", num: 14, title: "G y J en el mundo real: contexto profesional",
    summary: "La ortografía como parte de la presentación profesional.",
    body: [
      "En un correo, informe o documento de trabajo, errores como escribir 'desición' o 'jestion' en vez de 'decisión' y 'gestión' afectan la percepción de seriedad y competencia de quien escribe.",
      "Detectar y corregir estos errores en contextos reales es tan importante como conocer la regla en abstracto."
    ],
    examples: []
  },
  {
    id: "m15", num: 15, title: "Interfaces de aplicaciones",
    summary: "Errores ortográficos en botones, menús y formularios.",
    body: [
      "Un botón que dice 'Elejir' en vez de 'Elegir' puede parecer un detalle menor, pero afecta directamente la percepción de calidad y confianza de una aplicación.",
      "Revisar la ortografía de una interfaz es parte del control de calidad de cualquier producto digital."
    ],
    examples: []
  },
  {
    id: "m16", num: 16, title: "Mundo digital y ciberseguridad",
    summary: "Errores ortográficos como posible señal de alerta.",
    body: [
      "En mensajes digitales, un error como 'pájina' en vez de 'página' puede ser simplemente un descuido, pero en ciertos contextos también puede ser una señal de alerta: mensajes fraudulentos a veces usan variaciones deliberadas de palabras (por ejemplo en técnicas de typosquatting o ingeniería social) para parecerse a un sitio o mensaje legítimo sin serlo del todo.",
      "El objetivo de este módulo es únicamente educativo y preventivo: aprender a fijarse en el detalle ortográfico como parte de la lectura crítica de un mensaje, no enseñar técnicas de ataque."
    ],
    examples: []
  },
  {
    id: "m17", num: 17, title: "Programación y tecnología",
    summary: "La ortografía en variables, botones, mensajes y documentación.",
    body: [
      "Al desarrollar software, se revisan variables, etiquetas, mensajes de error, comentarios, documentación y manuales antes de publicar una aplicación.",
      "El código puede funcionar correctamente, pero la aplicación también debe comunicar correctamente: un error ortográfico visible reduce la percepción de calidad aunque la lógica del programa sea perfecta."
    ],
    examples: []
  },
  {
    id: "m18", num: 18, title: "Buscadores y contenido web",
    summary: "Escribir bien ayuda a comunicar con claridad en internet.",
    body: [
      "Corregir errores ortográficos en títulos y textos de una página web ayuda a presentar información clara y profesional, y puede favorecer que los buscadores interpreten mejor el contenido.",
      "La ortografía correcta es, en este sentido, parte de la calidad general de un contenido digital."
    ],
    examples: []
  },
  {
    id: "m19", num: 19, title: "Etimología: un dato curioso",
    summary: "La elección entre G y J también cuenta la historia de la lengua.",
    body: [
      "Muchas de las reglas actuales de G y J no son arbitrarias: reflejan la evolución histórica de las palabras desde el latín u otras lenguas de origen.",
      "En este sentido, la ortografía conserva parte de la historia de la lengua: al escribir correctamente, también se respeta ese origen."
    ],
    examples: []
  }
];

/* -------------------------------------------------------------------------
   2. MÉTODO DE 6 PASOS — "Detector automático de G/J"
   ------------------------------------------------------------------------- */
const METHOD_STEPS = [
  { step: 1, title: "Escuchar el sonido", body: "¿La palabra suena fuerte o suave delante de la vocal? Delante de A/O/U el sonido ya distingue G de J; delante de E/I, no." },
  { step: 2, title: "Observar la vocal", body: "¿La letra dudosa va seguida de E o I? Si es así, el sonido por sí solo no basta: hay que seguir analizando." },
  { step: 3, title: "Observar la terminación", body: "¿La palabra termina en -aje, -eje, -jería, -jero, -gión, -gia, -logía...? Muchas terminaciones tienen una letra fija." },
  { step: 4, title: "Buscar la familia léxica", body: "¿Existen otras palabras relacionadas (caja → cajita, reloj → relojero) que puedan orientar la escritura?" },
  { step: 5, title: "Comprobar si es una conjugación", body: "¿Es la forma de un verbo? Verbos como coger, exigir o dirigir cambian su G por J en ciertas formas (cojo, exijo, dirijo)." },
  { step: 6, title: "Recordar las excepciones", body: "¿La palabra pertenece a una lista de excepciones conocida (lejía, ligero, tejer...)? Ninguna regla es absoluta." }
];

/* -------------------------------------------------------------------------
   3. BASE DE PALABRAS (desafíos de tipo elige-letra / completa / corrige)
   Estructura: word, answer, rule, ruleId(module), difficulty(1-4), type,
   explanation, examples, isException
   ------------------------------------------------------------------------- */
const WORDS = [
  // --- NIVEL 1: fundamentos, sonido suave/fuerte, contraste básico ---
  { word: "gente", answer: "G", rule: "GEN", ruleId: "m3", difficulty: 1, explanation: "Las palabras con GEN se escriben con G. Es una de las secuencias más frecuentes del español.", examples: ["agencia", "origen", "inteligencia"] },
  { word: "jefe", answer: "J", rule: "Sonido fuerte ante E", ruleId: "m1", difficulty: 1, explanation: "Delante de E, la J representa el sonido fuerte /x/. No pertenece a ninguna secuencia especial de G, así que se mantiene con J.", examples: ["joven", "jarra", "juego"] },
  { word: "girar", answer: "G", rule: "Verbo -ar sin secuencia especial", ruleId: "m1", difficulty: 1, explanation: "'Girar' no pertenece a GEST-, GEO-, LEG- ni GEN, pero se escribe con G por uso establecido; no es un verbo en -ger/-gir con alternancia porque su raíz ya es 'gir-'.", examples: ["giro", "girasol"] },
  { word: "jirafa", answer: "J", rule: "Palabra de uso con J ante I", ruleId: "m1", difficulty: 1, explanation: "'Jirafa' se escribe con J; no pertenece a ninguna de las secuencias que exigen G (GEST-, GEO-, LEG-, GEN).", examples: ["jinete", "jícama"] },
  { word: "gato", answer: "G", rule: "G + A = sonido suave", ruleId: "m1", difficulty: 1, explanation: "Delante de A, O, U el sonido de la G es suave y no genera ambigüedad con la J.", examples: ["gota", "gusano"] },
  { word: "jarra", answer: "J", rule: "J + A = sonido fuerte", ruleId: "m1", difficulty: 1, explanation: "Delante de A, O, U el sonido de la J es fuerte y no se confunde con la G.", examples: ["joven", "juego"] },
  { word: "gusano", answer: "G", rule: "G + U = sonido suave", ruleId: "m1", difficulty: 1, explanation: "Delante de U, la G suena suave: no hay ambigüedad posible con J en esta posición.", examples: ["gato", "gota"] },
  { word: "juego", answer: "J", rule: "J + U/O = sonido fuerte", ruleId: "m1", difficulty: 1, explanation: "Delante de O, la J mantiene su sonido fuerte característico.", examples: ["jarra", "joven"] },

  // --- NIVEL 2: GUE/GUI/GÜE/GÜI ---
  { word: "guerra", answer: "u", rule: "GUE con U muda", ruleId: "m2", difficulty: 1, explanation: "En GUE, la U no se pronuncia: solo permite que la G conserve su sonido suave delante de E.", examples: ["guitarra", "manguera"] },
  { word: "guitarra", answer: "u", rule: "GUI con U muda", ruleId: "m2", difficulty: 1, explanation: "En GUI, la U no se pronuncia: sirve para mantener el sonido suave de la G ante I.", examples: ["guerra", "guiso"] },
  { word: "pingüino", answer: "ü", rule: "GÜI con diéresis", ruleId: "m2", difficulty: 2, explanation: "La diéresis (¨) indica que la U SÍ debe pronunciarse: pin-GÜI-no, no 'pinguino'.", examples: ["cigüeña", "agüita"] },
  { word: "cigüeña", answer: "ü", rule: "GÜE con diéresis", ruleId: "m2", difficulty: 2, explanation: "La diéresis marca que la U se pronuncia dentro de GÜE: ci-GÜE-ña.", examples: ["vergüenza", "antigüedad"] },
  { word: "vergüenza", answer: "ü", rule: "GÜE con diéresis", ruleId: "m2", difficulty: 2, explanation: "Sin diéresis se leería 'verguenza' con G suave silenciando la U; la diéresis obliga a pronunciarla.", examples: ["cigüeña", "bilingüe"] },
  { word: "antigüedad", answer: "ü", rule: "GÜE con diéresis", ruleId: "m2", difficulty: 2, explanation: "La diéresis conserva el sonido de la U en 'antigüedad', derivado de 'antiguo'.", examples: ["bilingüe", "agüita"] },
  { word: "bilingüe", answer: "ü", rule: "GÜE con diéresis", ruleId: "m2", difficulty: 2, explanation: "'Bilingüe' necesita diéresis para pronunciar la U: bi-lin-GÜE.", examples: ["antigüedad", "vergüenza"] },
  { word: "manguera", answer: "u", rule: "GUE con U muda", ruleId: "m2", difficulty: 1, explanation: "La U de 'manguera' no se pronuncia; solo mantiene el sonido suave de la G.", examples: ["guerra", "guiso"] },

  // --- NIVEL 3: GEST-, GEO-, LEG-, GEN ---
  { word: "gestión", answer: "G", rule: "GEST-", ruleId: "m3", difficulty: 1, explanation: "Las palabras que comienzan con GEST- se escriben con G.", examples: ["gestar", "gesticular", "gestación"] },
  { word: "gesticular", answer: "G", rule: "GEST-", ruleId: "m3", difficulty: 1, explanation: "Pertenece a la secuencia GEST-, que siempre se escribe con G (con la excepción de 'majestuoso').", examples: ["gestión", "gestar"] },
  { word: "majestuoso", answer: "J", rule: "Excepción a GEST-", ruleId: "m3", difficulty: 3, explanation: "'Majestuoso' es la excepción más destacada a la regla GEST-: aunque suena parecido, se escribe con J.", examples: [], isException: true },
  { word: "geografía", answer: "G", rule: "GEO-", ruleId: "m3", difficulty: 1, explanation: "GEO- se relaciona con la idea de 'tierra' y siempre se escribe con G.", examples: ["geología", "geometría"] },
  { word: "geología", answer: "G", rule: "GEO-", ruleId: "m3", difficulty: 1, explanation: "Toda palabra que empieza con GEO- (tierra) se escribe con G.", examples: ["geografía", "geopolítica"] },
  { word: "geometría", answer: "G", rule: "GEO-", ruleId: "m3", difficulty: 1, explanation: "GEO- siempre lleva G, sin excepciones conocidas en este grupo.", examples: ["geografía", "geología"] },
  { word: "legislar", answer: "G", rule: "LEG- + E/I", ruleId: "m3", difficulty: 2, explanation: "LEG- seguida de E o I se escribe con G, salvo las excepciones 'lejía', 'lejos' y 'lejanía'.", examples: ["legítimo", "legible", "legión"] },
  { word: "legítimo", answer: "G", rule: "LEG- + E/I", ruleId: "m3", difficulty: 2, explanation: "Pertenece a LEG-, que va con G delante de E/I.", examples: ["legislar", "legible"] },
  { word: "legible", answer: "G", rule: "LEG- + E/I", ruleId: "m3", difficulty: 2, explanation: "LEG- ante E/I se escribe con G: legible, legión, legítimo.", examples: ["legislar", "legítimo"] },
  { word: "lejía", answer: "J", rule: "Excepción a LEG-", ruleId: "m3", difficulty: 3, explanation: "'Lejía' es una de las excepciones clásicas a LEG-: se escribe con J.", examples: ["lejos", "lejanía"], isException: true },
  { word: "lejos", answer: "J", rule: "Excepción a LEG-", ruleId: "m3", difficulty: 2, explanation: "'Lejos' no sigue la regla LEG-: es una excepción con J.", examples: ["lejía", "lejanía"], isException: true },
  { word: "lejanía", answer: "J", rule: "Excepción a LEG-", ruleId: "m3", difficulty: 2, explanation: "'Lejanía' se escribe con J, igual que 'lejos' y 'lejía'.", examples: ["lejos", "lejía"], isException: true },
  { word: "agencia", answer: "G", rule: "GEN", ruleId: "m3", difficulty: 1, explanation: "GEN se escribe con G: agencia, gente, origen, margen.", examples: ["origen", "margen"] },
  { word: "origen", answer: "G", rule: "GEN", ruleId: "m3", difficulty: 1, explanation: "'Origen' pertenece a la secuencia GEN, que va con G.", examples: ["margen", "agencia"] },
  { word: "margen", answer: "G", rule: "GEN", ruleId: "m3", difficulty: 1, explanation: "GEN se escribe con G: margen, origen, agencia, inteligencia.", examples: ["origen", "inteligencia"] },
  { word: "inteligencia", answer: "G", rule: "GEN", ruleId: "m3", difficulty: 2, explanation: "Aunque es una palabra larga, contiene GEN y se escribe con G.", examples: ["agencia", "aborigen"] },
  { word: "aborigen", answer: "G", rule: "GEN", ruleId: "m3", difficulty: 2, explanation: "'Aborigen' termina en GEN y se escribe con G.", examples: ["origen", "margen"] },
  { word: "ajenjo", answer: "J", rule: "Excepción a GEN", ruleId: "m3", difficulty: 3, explanation: "'Ajenjo' es una excepción a la secuencia GEN: se escribe con J.", examples: ["jengibre"], isException: true },
  { word: "jengibre", answer: "J", rule: "Excepción a GEN", ruleId: "m3", difficulty: 3, explanation: "'Jengibre' escapa a la regla GEN y se escribe con J.", examples: ["ajenjo"], isException: true },
  { word: "avejentar", answer: "J", rule: "Excepción a GEN", ruleId: "m3", difficulty: 3, explanation: "'Avejentar' (hacer parecer viejo) se escribe con J, no con G como el resto del grupo GEN.", examples: ["jején"], isException: true },
  { word: "jején", answer: "J", rule: "Excepción a GEN", ruleId: "m3", difficulty: 3, explanation: "'Jején' (un insecto) es otra excepción a GEN: se escribe con J.", examples: ["ajenjo"], isException: true },
  { word: "dejen", answer: "J", rule: "Forma verbal de 'dejar'", ruleId: "m3", difficulty: 2, explanation: "'Dejen' no es una excepción a GEN: es la conjugación del verbo 'dejar', que ya lleva J en su raíz.", examples: ["tejen", "crujen"] },
  { word: "crujen", answer: "J", rule: "Forma verbal de 'crujir'", ruleId: "m3", difficulty: 2, explanation: "'Crujen' viene de 'crujir', verbo que se escribe con J (excepción a -gir).", examples: ["dejen"] },

  // --- NIVEL 4: terminaciones de G y J ---
  { word: "región", answer: "G", rule: "-GIÓN", ruleId: "m4", difficulty: 2, explanation: "Las palabras terminadas en -GIÓN se escriben con G.", examples: ["religión"] },
  { word: "religión", answer: "G", rule: "-GIÓN", ruleId: "m4", difficulty: 2, explanation: "-GIÓN va con G: religión, región.", examples: ["región"] },
  { word: "legionario", answer: "G", rule: "-GIONARIO", ruleId: "m4", difficulty: 2, explanation: "-GIONARIO se escribe con G.", examples: ["legión"] },
  { word: "religioso", answer: "G", rule: "-GIOSO/-GIOSA", ruleId: "m4", difficulty: 2, explanation: "-GIOSO/-GIOSA va con G: religioso, contagioso.", examples: ["contagioso"] },
  { word: "contagioso", answer: "G", rule: "-GIOSO/-GIOSA", ruleId: "m4", difficulty: 2, explanation: "-GIOSO se escribe con G, como 'religioso'.", examples: ["religioso"] },
  { word: "panegírico", answer: "G", rule: "-GÍRICO", ruleId: "m4", difficulty: 3, explanation: "-GÍRICO se escribe con G (elogio solemne).", examples: [] },
  { word: "magia", answer: "G", rule: "-GIA", ruleId: "m4", difficulty: 1, explanation: "-GIA se escribe con G: magia, plagio.", examples: ["plagio"] },
  { word: "colegio", answer: "G", rule: "-GIO", ruleId: "m4", difficulty: 1, explanation: "-GIO se escribe con G: colegio.", examples: ["plagio"] },
  { word: "plagio", answer: "G", rule: "-GIO", ruleId: "m4", difficulty: 2, explanation: "-GIO va con G, salvo excepciones como 'bujía' o 'lejía' que terminan distinto (-JÍA).", examples: ["colegio"] },
  { word: "bujía", answer: "J", rule: "Excepción -GIA/-GIO (-JÍA)", ruleId: "m4", difficulty: 3, explanation: "'Bujía' termina en -JÍA, no en -GIA: es una de las excepciones que se memorizan aparte.", examples: ["herejía", "crujía"], isException: true },
  { word: "herejía", answer: "J", rule: "Excepción -GIA/-GIO (-JÍA)", ruleId: "m4", difficulty: 3, explanation: "'Herejía' se escribe con J, como 'bujía', 'apoplejía', 'hemiplejía' y 'crujía'.", examples: ["bujía"], isException: true },
  { word: "apoplejía", answer: "J", rule: "Excepción -GIA/-GIO (-JÍA)", ruleId: "m4", difficulty: 3, explanation: "'Apoplejía' pertenece al grupo de excepciones en -JÍA.", examples: ["hemiplejía"], isException: true },
  { word: "hemiplejía", answer: "J", rule: "Excepción -GIA/-GIO (-JÍA)", ruleId: "m4", difficulty: 3, explanation: "'Hemiplejía' se escribe con J, igual que 'apoplejía'.", examples: ["apoplejía"], isException: true },
  { word: "crujía", answer: "J", rule: "Excepción -GIA/-GIO (-JÍA)", ruleId: "m4", difficulty: 3, explanation: "'Crujía' (espacio arquitectónico) es otra excepción del grupo -JÍA.", examples: ["bujía"], isException: true },

  // --- NIVEL 4/5: terminaciones cultas ---
  { word: "evangélico", answer: "G", rule: "-gélico", ruleId: "m5", difficulty: 3, explanation: "Las terminaciones cultas como -GÉLICO se escriben con G.", examples: [] },
  { word: "octogenario", answer: "G", rule: "-genario", ruleId: "m5", difficulty: 3, explanation: "-GENARIO es una terminación culta con G.", examples: [] },
  { word: "homogéneo", answer: "G", rule: "-géneo", ruleId: "m5", difficulty: 3, explanation: "-GÉNEO se escribe con G: homogéneo.", examples: [] },
  { word: "fotogénico", answer: "G", rule: "-génico", ruleId: "m5", difficulty: 3, explanation: "-GÉNICO se escribe con G: fotogénico.", examples: [] },
  { word: "ingenio", answer: "G", rule: "-genio", ruleId: "m5", difficulty: 2, explanation: "-GENIO se escribe con G: ingenio.", examples: [] },
  { word: "primogénito", answer: "G", rule: "-génito", ruleId: "m5", difficulty: 3, explanation: "-GÉNITO se escribe con G: primogénito.", examples: [] },
  { word: "vigesimal", answer: "G", rule: "-gesimal", ruleId: "m5", difficulty: 3, explanation: "-GESIMAL se escribe con G.", examples: [] },
  { word: "trigésimo", answer: "G", rule: "-gésimo", ruleId: "m5", difficulty: 3, explanation: "-GÉSIMO se escribe con G: trigésimo.", examples: [] },
  { word: "apologético", answer: "G", rule: "-gético", ruleId: "m5", difficulty: 3, explanation: "-GÉTICO se escribe con G: apologético.", examples: [] },
  { word: "oxígeno", answer: "G", rule: "-ígeno", ruleId: "m5", difficulty: 2, explanation: "-ÍGENO se escribe con G: oxígeno.", examples: [] },
  { word: "indígena", answer: "G", rule: "-ígena", ruleId: "m5", difficulty: 2, explanation: "-ÍGENA se escribe con G: indígena.", examples: [] },
  { word: "belígero", answer: "G", rule: "-ígero", ruleId: "m5", difficulty: 3, explanation: "-ÍGERO se escribe con G: belígero.", examples: [] },

  // --- Terminaciones científicas ---
  { word: "biología", answer: "G", rule: "-LOGÍA", ruleId: "m6", difficulty: 1, explanation: "-LOGÍA (estudio de algo) se escribe con G: biología, tecnología.", examples: ["tecnología"] },
  { word: "tecnología", answer: "G", rule: "-LOGÍA", ruleId: "m6", difficulty: 1, explanation: "-LOGÍA se escribe con G, sin excepción.", examples: ["biología"] },
  { word: "pedagogía", answer: "G", rule: "-GOGÍA", ruleId: "m6", difficulty: 2, explanation: "-GOGÍA se escribe con G: pedagogía.", examples: [] },
  { word: "neuralgia", answer: "G", rule: "-ALGIA", ruleId: "m6", difficulty: 2, explanation: "-ALGIA (relacionado con dolor) se escribe con G: neuralgia.", examples: [] },

  // --- Verbos -ger, -gir, -igerar y sus excepciones ---
  { word: "coger", answer: "G", rule: "-GER", ruleId: "m7", difficulty: 1, explanation: "Los verbos terminados en -GER se escriben con G en infinitivo.", examples: ["proteger"] },
  { word: "proteger", answer: "G", rule: "-GER", ruleId: "m7", difficulty: 1, explanation: "-GER se escribe con G: proteger, coger.", examples: ["coger"] },
  { word: "dirigir", answer: "G", rule: "-GIR", ruleId: "m7", difficulty: 1, explanation: "-GIR se escribe con G: dirigir, exigir.", examples: ["exigir"] },
  { word: "exigir", answer: "G", rule: "-GIR", ruleId: "m7", difficulty: 1, explanation: "-GIR se escribe con G en infinitivo, aunque cambie a J en 'yo exijo'.", examples: ["dirigir"] },
  { word: "aligerar", answer: "G", rule: "-IGERAR", ruleId: "m7", difficulty: 2, explanation: "-IGERAR se escribe con G: aligerar, refrigerar.", examples: ["refrigerar"] },
  { word: "refrigerar", answer: "G", rule: "-IGERAR", ruleId: "m7", difficulty: 2, explanation: "-IGERAR se escribe con G, como 'aligerar'.", examples: ["aligerar"] },
  { word: "tejer", answer: "J", rule: "Excepción a -GER", ruleId: "m7", difficulty: 2, explanation: "'Tejer' es una excepción destacada: aunque termina como 'coger' o 'proteger', se escribe con J.", examples: [], isException: true },
  { word: "crujir", answer: "J", rule: "Excepción a -GIR", ruleId: "m7", difficulty: 2, explanation: "'Crujir' es una excepción a -GIR: se escribe con J.", examples: [], isException: true },

  // --- AJE-, EJE- ---
  { word: "ajedrez", answer: "J", rule: "AJE-", ruleId: "m8", difficulty: 1, explanation: "Las palabras que comienzan con AJE- se escriben con J.", examples: ["ajetreo"] },
  { word: "ajetreo", answer: "J", rule: "AJE-", ruleId: "m8", difficulty: 2, explanation: "AJE- inicial se escribe con J.", examples: ["ajedrez"] },
  { word: "ejemplo", answer: "J", rule: "EJE-", ruleId: "m8", difficulty: 1, explanation: "EJE- inicial se escribe con J: ejemplo, ejercicio, ejecutar.", examples: ["ejercicio"] },
  { word: "ejercicio", answer: "J", rule: "EJE-", ruleId: "m8", difficulty: 1, explanation: "EJE- se escribe con J.", examples: ["ejecutar"] },
  { word: "ejecutar", answer: "J", rule: "EJE-", ruleId: "m8", difficulty: 1, explanation: "EJE- se escribe con J: ejecutar, ejemplo.", examples: ["ejemplo"] },
  { word: "agenda", answer: "G", rule: "Excepción a EJE- (empieza AGE-)", ruleId: "m8", difficulty: 2, explanation: "'Agenda' no empieza con EJE- sino con AGE-, y pertenece al grupo GEN: se escribe con G.", examples: ["agencia", "agente"], isException: true },
  { word: "agencia", answer: "G", rule: "Excepción a EJE- (empieza AGE-)", ruleId: "m8", difficulty: 2, explanation: "'Agencia' se escribe con G, como 'agenda' y 'agente'.", examples: ["agenda", "agente"], isException: true },
  { word: "agente", answer: "G", rule: "Excepción a EJE- (empieza AGE-)", ruleId: "m8", difficulty: 2, explanation: "'Agente' pertenece a GEN y se escribe con G, no con J como AJE-/EJE-.", examples: ["agenda", "agencia"], isException: true },

  // --- -aje/-eje, -jería, -jero/-jera, -jear ---
  { word: "coraje", answer: "J", rule: "-AJE", ruleId: "m9", difficulty: 1, explanation: "-AJE se escribe con J: coraje, viaje, garaje.", examples: ["viaje", "garaje"] },
  { word: "viaje", answer: "J", rule: "-AJE", ruleId: "m9", difficulty: 1, explanation: "-AJE se escribe con J.", examples: ["coraje", "garaje"] },
  { word: "garaje", answer: "J", rule: "-AJE", ruleId: "m9", difficulty: 1, explanation: "-AJE va con J: garaje, vendaje.", examples: ["vendaje"] },
  { word: "vendaje", answer: "J", rule: "-AJE", ruleId: "m9", difficulty: 1, explanation: "-AJE se escribe con J.", examples: ["coraje"] },
  { word: "hereje", answer: "J", rule: "-EJE", ruleId: "m9", difficulty: 2, explanation: "-EJE se escribe con J: hereje, despeje.", examples: ["despeje"] },
  { word: "despeje", answer: "J", rule: "-EJE", ruleId: "m9", difficulty: 2, explanation: "-EJE va con J.", examples: ["hereje"] },
  { word: "relojería", answer: "J", rule: "-JERÍA", ruleId: "m9", difficulty: 2, explanation: "-JERÍA se escribe con J: relojería, brujería.", examples: ["brujería"] },
  { word: "conserjería", answer: "J", rule: "-JERÍA", ruleId: "m9", difficulty: 2, explanation: "-JERÍA va con J: conserjería, cerrajería.", examples: ["cerrajería"] },
  { word: "brujería", answer: "J", rule: "-JERÍA", ruleId: "m9", difficulty: 2, explanation: "-JERÍA se escribe con J.", examples: ["relojería"] },
  { word: "cerrajería", answer: "J", rule: "-JERÍA", ruleId: "m9", difficulty: 2, explanation: "-JERÍA va con J: cerrajería, conserjería.", examples: ["conserjería"] },
  { word: "cajero", answer: "J", rule: "-JERO/-JERA", ruleId: "m9", difficulty: 1, explanation: "-JERO/-JERA se escribe con J: cajero, pasajero.", examples: ["pasajero"] },
  { word: "pasajero", answer: "J", rule: "-JERO/-JERA", ruleId: "m9", difficulty: 1, explanation: "-JERO se escribe con J.", examples: ["cajero"] },
  { word: "lisonjero", answer: "J", rule: "-JERO/-JERA", ruleId: "m9", difficulty: 2, explanation: "-JERO va con J: lisonjero, cajero.", examples: ["cajero"] },
  { word: "ligero", answer: "G", rule: "Excepción a -JERO/-JERA", ruleId: "m9", difficulty: 3, explanation: "'Ligero' es la 'palabra trampa' del grupo -JERO: aunque termina igual que 'cajero', se escribe con G.", examples: [], isException: true },
  { word: "canjear", answer: "J", rule: "-JEAR", ruleId: "m9", difficulty: 2, explanation: "-JEAR mantiene la J en toda la conjugación: canjear, canjeo, canjeamos.", examples: ["cojear", "hojear"] },
  { word: "cojear", answer: "J", rule: "-JEAR", ruleId: "m9", difficulty: 2, explanation: "-JEAR se escribe con J: cojear, homenajear.", examples: ["homenajear"] },
  { word: "homenajear", answer: "J", rule: "-JEAR", ruleId: "m9", difficulty: 2, explanation: "-JEAR va con J.", examples: ["hojear", "ojear"] },
  { word: "hojear", answer: "J", rule: "-JEAR", ruleId: "m9", difficulty: 2, explanation: "'Hojear' (pasar las hojas de un libro) se escribe con J. No confundir con 'ojear'.", examples: ["ojear"] },
  { word: "ojear", answer: "J", rule: "-JEAR", ruleId: "m9", difficulty: 2, explanation: "'Ojear' (mirar rápidamente) también se escribe con J, como todo el grupo -JEAR.", examples: ["hojear"] },
  { word: "burbujear", answer: "J", rule: "-JEAR", ruleId: "m9", difficulty: 2, explanation: "-JEAR se escribe con J: burbujear.", examples: ["canjear"] },

  // --- NIVEL 6/EXPERTO: alternancia G→J en formas conjugadas ---
  { word: "cojo", answer: "J", rule: "Alternancia COG-→COJ-", ruleId: "m12", difficulty: 3, explanation: "En 'yo cojo', la G de 'coger' cambia a J para conservar el sonido fuerte delante de O.", examples: ["exijo", "dirijo"] },
  { word: "exijo", answer: "J", rule: "Alternancia EXIG-→EXIJ-", ruleId: "m12", difficulty: 3, explanation: "En 'yo exijo', la G de 'exigir' cambia a J delante de O para mantener el sonido fuerte.", examples: ["cojo", "dirijo"] },
  { word: "dirijo", answer: "J", rule: "Alternancia DIRIG-→DIRIJ-", ruleId: "m12", difficulty: 3, explanation: "'Dirijo' viene de 'dirigir': la G cambia a J delante de O.", examples: ["protejo"] },
  { word: "protejo", answer: "J", rule: "Alternancia PROTEG-→PROTEJ-", ruleId: "m12", difficulty: 3, explanation: "'Protejo' viene de 'proteger': la G cambia a J delante de O para conservar el sonido /x/.", examples: ["cojo"] },
  { word: "coges", answer: "G", rule: "-GER con G (no cambia ante E)", ruleId: "m12", difficulty: 3, explanation: "Delante de E la G ya suena fuerte, así que no hace falta cambiarla a J: 'tú coges' conserva la G.", examples: ["diriges", "proteges"] },
  { word: "exiges", answer: "G", rule: "-GIR con G (no cambia ante E)", ruleId: "m12", difficulty: 3, explanation: "Delante de E, 'exigir' conserva la G: 'tú exiges'. El cambio a J solo ocurre ante A/O.", examples: ["diriges"] },

  // --- Verbos rebeldes (pretéritos con J) ---
  { word: "dije", answer: "J", rule: "Pretérito de 'decir'", ruleId: "m10", difficulty: 3, explanation: "'Decir' cambia su raíz en pretérito: dije, dijimos, dijeron. Se escribe con J.", examples: ["dijimos", "predijeron"] },
  { word: "traje", answer: "J", rule: "Pretérito de 'traer'", ruleId: "m10", difficulty: 3, explanation: "'Traer' cambia su raíz en pretérito: traje, trajimos, contrajeron. Se escribe con J.", examples: ["trajimos"] },
  { word: "conduje", answer: "J", rule: "Pretérito de verbos en -DUCIR", ruleId: "m10", difficulty: 3, explanation: "Los verbos en -DUCIR (conducir, producir, deducir, traducir) forman su pretérito con J: conduje, produjeron.", examples: ["produjeron", "dedujimos"] },
  { word: "produjeron", answer: "J", rule: "Pretérito de verbos en -DUCIR", ruleId: "m10", difficulty: 3, explanation: "'Producir' → 'produjeron', con J, como todos los verbos en -DUCIR.", examples: ["conduje"] },

  // --- Distractores adicionales de nivel 1-2 para variedad ---
  { word: "jueves", answer: "J", rule: "Palabra de uso con J", ruleId: "m1", difficulty: 1, explanation: "'Jueves' se escribe con J por uso fijo del idioma.", examples: [] },
  { word: "jamón", answer: "J", rule: "J + A = sonido fuerte", ruleId: "m1", difficulty: 1, explanation: "Delante de A, la J mantiene su sonido fuerte característico.", examples: [] },
  { word: "gorra", answer: "G", rule: "G + O = sonido suave", ruleId: "m1", difficulty: 1, explanation: "Delante de O, la G suena suave y no se confunde con J.", examples: [] },
  { word: "goma", answer: "G", rule: "G + O = sonido suave", ruleId: "m1", difficulty: 1, explanation: "Delante de O, la G es suave.", examples: [] }
  ,{ word: "hegemonía", answer: "G", rule: "-GÉNICO / vocabulario culto", ruleId: "m5", difficulty: 4, explanation: "'Hegemonía' se escribe con G y designa la supremacía o preponderancia de un grupo sobre otros.", examples: ["hegemónico", "heterogéneo"] }
  ,{ word: "heterogéneo", answer: "G", rule: "-GÉNEO", ruleId: "m5", difficulty: 4, explanation: "La terminación culta -GÉNEO se escribe con G; exige reconocer una base grecolatina en un contexto académico.", examples: ["homogéneo", "fotogénico"] }
  ,{ word: "paradigmático", answer: "G", rule: "Vocabulario académico", ruleId: "m5", difficulty: 4, explanation: "'Paradigmático' contiene G y se usa para aquello que constituye un modelo o paradigma.", examples: ["paradigma", "epistemología"] }
  ,{ word: "transigencia", answer: "G", rule: "-GEN / familia léxica", ruleId: "m3", difficulty: 4, explanation: "'Transigencia' pertenece a la familia de 'transigir' y conserva G en el sustantivo derivado.", examples: ["transigir", "exigencia"] }
  ,{ word: "injerencia", answer: "J", rule: "Familia de injerir", ruleId: "m13", difficulty: 4, explanation: "'Injerencia' significa intromisión y se escribe con J, al igual que 'injerir(se)'. No debe confundirse con 'ingerencia', forma incorrecta.", examples: ["injerir", "ingerir"] }
  ,{ word: "jerarquización", answer: "J", rule: "Familia de jerarquía", ruleId: "m9", difficulty: 4, explanation: "La familia 'jerarquía, jerarquizar, jerarquización' conserva J en todo el paradigma derivativo.", examples: ["jerárquico", "jerarquizar"] }
  ,{ word: "conjetura", answer: "J", rule: "Familia léxica", ruleId: "m13", difficulty: 4, explanation: "'Conjetura' se escribe con J y nombra una opinión formada sin pruebas concluyentes.", examples: ["conjeturar", "conjetural"] }
  ,{ word: "subyugación", answer: "G", rule: "-GACIÓN", ruleId: "m4", difficulty: 4, explanation: "'Subyugación' lleva G en la terminación -gación, relacionada con 'subyugar'.", examples: ["subyugar", "navegación"] }
  ,{ word: "beligerancia", answer: "G", rule: "Familia de belígero", ruleId: "m5", difficulty: 4, explanation: "'Beligerancia' conserva G en una palabra culta relacionada con 'belígero' y 'beligerante'.", examples: ["beligerante", "belígero"] }
  ,{ word: "extravagancia", answer: "G", rule: "-GANCIA", ruleId: "m4", difficulty: 4, explanation: "'Extravagancia' se escribe con G y alude a una conducta o idea que se aparta de lo habitual.", examples: ["extravagante", "elegancia"] }
  ,{ word: "prodigiosa", answer: "G", rule: "-GIOSO/-GIOSA", ruleId: "m4", difficulty: 4, explanation: "La terminación -GIOSO/-GIOSA se escribe con G: prodigiosa, religiosa, contagiosa.", examples: ["prodigio", "contagiosa"] }
  ,{ word: "herejía", answer: "J", rule: "Excepción -JÍA", ruleId: "m4", difficulty: 4, explanation: "'Herejía' es una excepción lexicalizada del grupo que podría confundirse con -GIA; se escribe con J.", examples: ["bujía", "hemiplejía"], isException: true }
];

/* -------------------------------------------------------------------------
   4. ORACIONES / TEXTOS PARA DESAFÍOS CONTEXTUALES
   type: "sentence" (detectar error en oración), "email", "app", "security", "programming", "web"
   ------------------------------------------------------------------------- */
const TEXT_CHALLENGES = [
  // Detecta el error (oraciones sueltas)
  { id: "s1", type: "sentence", context: "general", text: "El comité avanzó con la jestión del nuevo proyecto interno.", wrongWord: "jestión", correctWord: "gestión", ruleId: "m3", explanation: "GEST- se escribe con G: gestión, gestar, gesticular.", difficulty: 1 },
  { id: "s2", type: "sentence", context: "general", text: "El biólogo estudia la jeografía de la región para proteger el ecosistema.", wrongWord: "jeografía", correctWord: "geografía", ruleId: "m3", explanation: "GEO- (relación con la tierra) siempre se escribe con G: geografía.", difficulty: 1 },
  { id: "s3", type: "sentence", context: "general", text: "El pasagero abordó el vuelo con su equipaje de mano.", wrongWord: "pasagero", correctWord: "pasajero", ruleId: "m9", explanation: "-JERO se escribe con J: pasajero, no 'pasagero'.", difficulty: 1 },
  { id: "s4", type: "sentence", context: "general", text: "El pingüino y la cigueña viven en climas muy distintos.", wrongWord: "cigueña", correctWord: "cigüeña", ruleId: "m2", explanation: "'Cigüeña' necesita diéresis en la U (GÜE) para indicar que se pronuncia.", difficulty: 2 },
  { id: "s5", type: "sentence", context: "general", text: "El agente de la ajencia confirmó la reunión para el jueves.", wrongWord: "ajencia", correctWord: "agencia", ruleId: "m8", explanation: "'Agencia' pertenece al grupo GEN y se escribe con G, no con J como AJE-.", difficulty: 2 },
  { id: "s6", type: "sentence", context: "general", text: "El profesor de pedagojía explicó la teoría con mucha claridad.", wrongWord: "pedagojía", correctWord: "pedagogía", ruleId: "m6", explanation: "-GOGÍA se escribe con G: pedagogía.", difficulty: 2 },
  { id: "s7", type: "sentence", context: "general", text: "Es un verbo muy exijente: siempre pide más esfuerzo del equipo.", wrongWord: "exijente", correctWord: "exigente", ruleId: "m7", explanation: "'Exigente' viene de 'exigir' (-GIR con G); solo cambia a J en formas como 'yo exijo', no en el adjetivo 'exigente'.", difficulty: 3 },
  { id: "s8", type: "sentence", context: "general", text: "Cada día ella cose un poco más rápido: ya no cogea al caminar.", wrongWord: "cogea", correctWord: "cojea", ruleId: "m9", explanation: "'Cojear' pertenece al grupo -JEAR y se escribe con J en todas sus formas.", difficulty: 2 },
  { id: "s9", type: "sentence", context: "general", text: "El testigo se negó a injerir en la investigación oficial.", wrongWord: null, correctWord: "injerir", ruleId: "m13", explanation: "Aquí 'injerir' (entrometerse) está bien escrito. Es distinto de 'ingerir' (comer o tragar). No hay error en esta oración.", difficulty: 3, noError: true },

  // Correo profesional (Módulo 14)
  { id: "email1", type: "email", context: "professional",
    subject: "Actualización del proyecto",
    body: "Buenas tardes:\n\nLes escribo para informar sobre la jestion del proyecto. Tomamos la desición de haser una nueva propuesta esta semana. El equipo de injenieria ya está trabajando en los ajustes.\n\nSaludos cordiales.",
    errors: [
      { wrong: "jestion", correct: "gestión", ruleId: "m3", explanation: "GEST- se escribe con G: gestión." },
      { wrong: "haser", correct: "hacer", ruleId: null, explanation: "No es un caso de G/J, pero conviene revisarlo: se escribe con C, 'hacer'." },
      { wrong: "injenieria", correct: "ingeniería", ruleId: "m5", explanation: "'Ingeniería' viene de 'ingenio' (-GENIO), que se escribe con G." }
    ],
    difficulty: 3
  },
  { id: "email2", type: "email", context: "professional",
    subject: "Confirmación de viaje",
    body: "Hola equipo:\n\nConfirmo el biaje de la próxima semana. El pasajero principal es el gerente jeneral, y el itinerario ya fue corregido por la ajencia.\n\nCualquier duda, quedo atenta.",
    errors: [
      { wrong: "biaje", correct: "viaje", ruleId: null, explanation: "No es un error de G/J (se escribe con V), pero se incluyó para practicar la lectura atenta." },
      { wrong: "jeneral", correct: "general", ruleId: "m3", explanation: "'General' pertenece al grupo GEN y se escribe con G." },
      { wrong: "ajencia", correct: "agencia", ruleId: "m8", explanation: "'Agencia' pertenece a GEN, no a AJE-: se escribe con G." }
    ],
    difficulty: 3
  },
  { id: "email3", type: "email", context: "professional",
    subject: "Informe de evaluación lingüística",
    body: "Estimado equipo:\n\nLa revisión de la jestion documental revela una injerencia innecesaria en el protocolo. Sugiero jerarquizar las observaciones y remitir la versión corregida al comité de validación.\n\nAtentamente.",
    errors: [
      { wrong: "jestion", correct: "gestión", ruleId: "m3", explanation: "GEST- se escribe con G: gestión." }
    ],
    difficulty: 4
  },
  { id: "email4", type: "email", context: "professional",
    subject: "Conclusiones del proyecto",
    body: "Buenas tardes:\n\nLa conclusión provisional no debe confundirse con una conjetura. El informe describe un escenario heterojéneo y recomienda una nueva jerarquización de los datos antes de publicar la versión definitiva.\n\nSaludos cordiales.",
    errors: [
      { wrong: "heterojéneo", correct: "heterogéneo", ruleId: "m5", explanation: "La terminación culta -GÉNEO se escribe con G." }
    ],
    difficulty: 4
  },

  // Interfaz de app (Módulo 15)
  { id: "app1", type: "app", context: "app",
    label: "Botón principal",
    wrong: "Elejir", correct: "Elegir", ruleId: "m7",
    explanation: "'Elegir' viene de -GIR (dirigir, exigir) y se escribe con G en su infinitivo.",
    difficulty: 2
  },
  { id: "app2", type: "app", context: "app",
    label: "Mensaje de confirmación",
    wrong: "Cambios guardados correctamente. Proteje tu cuenta activando la verificación.",
    correct: "Cambios guardados correctamente. Protege tu cuenta activando la verificación.",
    wrongWord: "Proteje", correctWord: "Protege", ruleId: "m7",
    explanation: "'Protege' (él/ella protege) viene de 'proteger' (-GER con G) y no cambia a J delante de E.",
    difficulty: 2
  },
  { id: "app3", type: "app", context: "app",
    label: "Menú de navegación",
    wrong: "Mi equipage", correct: "Mi equipaje", ruleId: "m9",
    explanation: "'Equipaje' pertenece a -AJE y se escribe con J, no con G. Aunque parezca sutil, este tipo de detalle afecta la percepción de calidad de la app.",
    difficulty: 1
  },
  { id: "app4", type: "app", context: "app",
    label: "Etiqueta de formulario",
    wrong: "Njreso mensual", correct: "Ingreso mensual", ruleId: "m3",
    explanation: "'Ingreso' contiene GRE, no un caso dudoso de G/J propiamente, pero se revisó como parte del control de calidad del formulario.",
    difficulty: 1
  },
  { id: "app5", type: "app", context: "app",
    label: "Botón secundario",
    wrong: "Cojer producto", correct: "Coger producto", ruleId: "m7",
    explanation: "'Coger' se escribe con G en infinitivo (-GER); solo cambia a J en formas como 'yo cojo'.",
    difficulty: 2
  },

  // Ciberseguridad (Módulo 16) — solo detección educativa, sin técnicas de ataque
  { id: "sec1", type: "security", context: "security",
    label: "Mensaje recibido",
    wrong: "Verifique su quenta ingresando a este enlase antes de que caduque su asseso.",
    correct: "Verifique su cuenta ingresando a este enlace antes de que caduque su acceso.",
    ruleId: null,
    explanation: "Este mensaje contiene varias alteraciones ortográficas (quenta, enlase, asseso) que no son errores comunes de escritura, sino señales típicas de mensajes poco confiables. Fijarse en estos detalles ayuda a leer con más cuidado, sin necesidad de analizar técnicamente el mensaje.",
    difficulty: 3
  },
  { id: "sec2", type: "security", context: "security",
    label: "Mensaje recibido",
    wrong: "Bienvenido a la pájina oficial. Confirme su rejistro para continuar.",
    correct: "Bienvenido a la página oficial. Confirme su registro para continuar.",
    ruleId: "m3",
    explanation: "'Página' y 'registro' están mal escritas aquí. Este tipo de variaciones ortográficas puede aparecer en mensajes que buscan parecerse a uno legítimo sin serlo del todo: por eso conviene leer con atención.",
    difficulty: 2
  },
  { id: "sec3", type: "security", context: "security",
    label: "Mensaje recibido",
    wrong: "Su solicitud fue rejistrada correctamente. Gracias por su preferencia.",
    correct: "Su solicitud fue registrada correctamente. Gracias por su preferencia.",
    ruleId: "m3",
    explanation: "'Registrada' no pertenece a un caso de G/J propiamente (se escribe con G por raíz latina 'registrum'), pero un solo error ortográfico ya puede ser una señal para revisar la fuente del mensaje con más cuidado.",
    difficulty: 2
  },

  // Programación (Módulo 17)
  { id: "prog1", type: "programming", context: "programming",
    label: "Comentario en el código",
    wrong: "// Esta función se encarga de rejistrar al usuario",
    correct: "// Esta función se encarga de registrar al usuario",
    ruleId: null,
    explanation: "Aunque el código funcione, un comentario mal escrito reduce la claridad de la documentación para el resto del equipo.",
    difficulty: 1
  },
  { id: "prog2", type: "programming", context: "programming",
    label: "Nombre de variable / etiqueta",
    wrong: "const mensajeDeBienbenida = 'Gracias por elejir nuestra app';",
    correct: "const mensajeDeBienvenida = 'Gracias por elegir nuestra app';",
    ruleId: "m7",
    explanation: "'Elegir' (-GIR) se escribe con G. Un texto visible para el usuario final debe revisarse igual que cualquier otro contenido antes de publicar la app.",
    difficulty: 2
  },
  { id: "prog3", type: "programming", context: "programming",
    label: "Mensaje de error en consola",
    wrong: "Error: no se pudo cargar la ajenda del usuario.",
    correct: "Error: no se pudo cargar la agenda del usuario.",
    ruleId: "m8",
    explanation: "La J sustituye a la G en 'agenda'; además, el programador debe detectar que el espacio forma parte del texto visible del mensaje.",
    difficulty: 2
  },
  { id: "prog4", type: "programming", context: "programming",
    label: "Función de autenticación",
    wrong: "function autenticarJsuario(credenciales) { return validarSesion(credenciales); }",
    correct: "function autenticarUsuario(credenciales) { return validarSesion(credenciales); }",
    ruleId: null,
    explanation: "La J sustituye a la G en 'Usuario' y cambia el identificador de una función vital: una llamada posterior produciría un error de referencia.",
    difficulty: 4
  },
  { id: "prog5", type: "programming", context: "programming",
    label: "Función de persistencia",
    wrong: "const guardarProgreso = datos => localStorage.setItem('progreso', JSON.strinjgify(datos));",
    correct: "const guardarProgreso = datos => localStorage.setItem('progreso', JSON.stringify(datos));",
    ruleId: null,
    explanation: "La errata J/G y la transposición de letras convierten 'JSON.stringify' en una llamada inexistente; la persistencia falla en tiempo de ejecución.",
    difficulty: 4
  },
  { id: "prog6", type: "programming", context: "programming",
    label: "Función de selección del DOM",
    wrong: "const panel = document.getElementByJd('challengePanel');",
    correct: "const panel = document.getElementById('challengePanel');",
    ruleId: null,
    explanation: "La J sustituye a la G en 'getElementById' y además altera la capitalización de Id; la API no encuentra el panel.",
    difficulty: 4
  },
  { id: "prog7", type: "programming", context: "programming",
    label: "Función de validación",
    wrong: "function validarRespuesta(respuesta) { return respuesta.lenjth > 0; }",
    correct: "function validarRespuesta(respuesta) { return respuesta.length > 0; }",
    ruleId: null,
    explanation: "La J sustituye a la G en 'length' y el nombre de propiedad deja de existir; la validación devuelve un resultado incorrecto.",
    difficulty: 4
  },

  // Web / SEO (Módulo 18)
  { id: "web1", type: "web", context: "web",
    label: "Título de artículo",
    wrong: "Guía de viaje: los mejores destinos para tu proximo biaje",
    correct: "Guía de viaje: los mejores destinos para tu próximo viaje",
    ruleId: "m9",
    explanation: "'Viaje' pertenece a -AJE y se escribe con J. Un título con errores afecta la percepción profesional del contenido.",
    difficulty: 1
  },
  { id: "web2", type: "web", context: "web",
    label: "Texto de portada",
    wrong: "Tegnología, inovación y desarrollo: todo lo que necesitas saber",
    correct: "Tecnología, innovación y desarrollo: todo lo que necesitas saber",
    ruleId: "m6",
    explanation: "'Tecnología' termina en -LOGÍA (estudio de algo) y se escribe con G.",
    difficulty: 2
  },
  { id: "web3", type: "web", context: "web",
    label: "Descripción de producto",
    wrong: "Diseño lijero y resistente, ideal para cualquier ocasión.",
    correct: "Diseño ligero y resistente, ideal para cualquier ocasión.",
    ruleId: "m9",
    explanation: "'Ligero' es la excepción trampa del grupo -JERO: se escribe con G, no con J.",
    difficulty: 3
  }
  ,{ id: "final1", type: "sentence", context: "final", text: "La heterojeneidad del corpus exige una jerarquización rigurosa antes de formular cualquier conjetura.", wrongWord: "heterojeneidad", correctWord: "heterogeneidad", ruleId: "m5", explanation: "La terminación culta -GENEIDAD se escribe con G: heterogeneidad.", difficulty: 4 }
  ,{ id: "final2", type: "sentence", context: "final", text: "La ajencia publicó un informe sobre la injerencia de factores externos en la transigencia institucional.", wrongWord: "ajencia", correctWord: "agencia", ruleId: "m3", explanation: "'Agencia' pertenece a la familia de GEN y se escribe con G.", difficulty: 4 }
  ,{ id: "final3", type: "sentence", context: "final", text: "Su argumentación no era una congetura, sino una hipótesis respaldada por evidencia verificable.", wrongWord: "congetura", correctWord: "conjetura", ruleId: "m13", explanation: "'Conjetura' se escribe con J y significa opinión sin pruebas concluyentes.", difficulty: 4 }
  ,{ id: "final4", type: "sentence", context: "final", text: "El comité consideró prodijiosa la precisión del análisis y rechazó toda simplificación del diagnóstico.", wrongWord: "prodijiosa", correctWord: "prodigiosa", ruleId: "m4", explanation: "La terminación -GIOSO/-GIOSA se escribe con G.", difficulty: 4 }
];

/* -------------------------------------------------------------------------
   5. UNE LA REGLA (emparejar patrón con letra o descripción)
   ------------------------------------------------------------------------- */
const MATCH_PAIRS = [
  { left: "-AJE / -EJE", right: "J", explanation: "coraje, viaje, garaje, hereje, despeje." },
  { left: "-JERÍA", right: "J", explanation: "relojería, brujería, cerrajería." },
  { left: "-JEAR", right: "J", explanation: "canjear, cojear, hojear, ojear." },
  { left: "GEST-", right: "G", explanation: "gestión, gestar, gesticular (excepción: majestuoso)." },
  { left: "GEO-", right: "G", explanation: "geografía, geología, geometría." },
  { left: "-GIÓN", right: "G", explanation: "región, religión." },
  { left: "-LOGÍA", right: "G", explanation: "biología, tecnología." },
  { left: "-ALGIA", right: "G", explanation: "neuralgia (relacionado con dolor)." },
  { left: "AJE- / EJE- inicial", right: "J", explanation: "ajedrez, ejemplo, ejercicio." },
  { left: "-GER / -GIR (infinitivo)", right: "G", explanation: "coger, proteger, dirigir, exigir." },
  { left: "GUE / GUI", right: "U muda", explanation: "guerra, guitarra: la U no se pronuncia." },
  { left: "GÜE / GÜI", right: "U con diéresis", explanation: "pingüino, cigüeña: la U sí se pronuncia." }
];

/* -------------------------------------------------------------------------
   6. VERBOS CAMBIANTES (desafío "verbo cambiante")
   ------------------------------------------------------------------------- */
const VERB_CHANGES = [
  { prompt: "Ayer yo ___ la verdad sobre lo ocurrido.", infinitive: "decir", answer: "dije", options: ["dige", "dije", "decí"], explanation: "'Decir' cambia su raíz en pretérito: dije, dijimos, dijeron. Se escribe con J." },
  { prompt: "Nosotros ___ el regalo escondido en el auto.", infinitive: "traer", answer: "trajimos", options: ["trajimos", "tragimos", "traímos"], explanation: "'Traer' → trajimos, con J, en el pretérito." },
  { prompt: "Ellos ___ el vehículo hasta la frontera.", infinitive: "conducir", answer: "condujeron", options: ["condujeron", "condugieron", "conducieron"], explanation: "Los verbos en -DUCIR forman su pretérito con J: condujeron." },
  { prompt: "Yo siempre ___ mis pertenencias con cuidado.", infinitive: "proteger", answer: "protejo", options: ["protejo", "protego", "protego"], explanation: "'Yo protejo': la G cambia a J delante de O para mantener el sonido fuerte." },
  { prompt: "Tú nunca ___ lo que realmente piensas.", infinitive: "exigir", answer: "exiges", options: ["exijes", "exiges", "exigies"], explanation: "Delante de E, 'exigir' conserva la G: tú exiges. El cambio a J solo ocurre ante A/O." },
  { prompt: "Yo ___ el camino más corto para llegar a tiempo.", infinitive: "dirigir", answer: "dirijo", options: ["dirijo", "dirigo", "dirigió"], explanation: "'Yo dirijo': la G cambia a J delante de O." },
  { prompt: "El año pasado se ___ nuevas leyes de tránsito.", infinitive: "producir", answer: "produjeron", options: ["produjeron", "produgieron", "producieron"], explanation: "'Producir' (verbo en -DUCIR) forma su pretérito con J: produjeron." },
  { prompt: "Nosotros ___ la fórmula correcta tras varios intentos.", infinitive: "deducir", answer: "dedujimos", options: ["dedugimos", "dedujimos", "deducimos"], explanation: "'Deducir' → dedujimos, con J, como todos los verbos en -DUCIR." }
];

/* -------------------------------------------------------------------------
   7. HOMÓFONAS / PARÓNIMAS — desafío de significado
   ------------------------------------------------------------------------- */
const MEANING_CHALLENGES = [
  { sentence: "Cada verano hacemos una ___ campestre junto al río.", options: [{ text: "gira", correct: false }, { text: "jira", correct: true }], explanation: "'Jira' significa merienda o banquete campestre. 'Gira' es una excursión o el verbo girar." },
  { sentence: "La banda anunció su próxima ___ por varias ciudades.", options: [{ text: "gira", correct: true }, { text: "jira", correct: false }], explanation: "'Gira' (excursión, recorrido) es lo correcto aquí; 'jira' es un pedazo de tela o una merienda campestre." },
  { sentence: "Es importante ___ suficiente agua durante el día.", options: [{ text: "ingerir", correct: true }, { text: "injerir", correct: false }], explanation: "'Ingerir' significa introducir alimentos o líquidos en el cuerpo. 'Injerir' es entrometerse." },
  { sentence: "Prefiere no ___ en los asuntos ajenos.", options: [{ text: "ingerir", correct: false }, { text: "injerir", correct: true }], explanation: "'Injerir(se)' significa entrometerse. 'Ingerir' es introducir alimentos en el cuerpo." },
  { sentence: "Las plantas del jardín empezaron a ___ tras la lluvia.", options: [{ text: "vegetar", correct: true }, { text: "vejetar", correct: false }], explanation: "'Vegetar' se refiere a crecer las plantas (o vivir de forma pasiva). 'Vejetar' no es la forma correcta: la palabra siempre se escribe con G." },
  { sentence: "El sofrito necesita solo un ___ picado.", options: [{ text: "agito", correct: false }, { text: "ajito", correct: true }], explanation: "'Ajito' es el diminutivo de 'ajo'. 'Agito' es una forma del verbo agitar." },
  { sentence: "Yo ___ la mezcla antes de servirla.", options: [{ text: "agito", correct: true }, { text: "ajito", correct: false }], explanation: "'Agito' es la forma verbal de 'agitar'. 'Ajito' es el diminutivo de 'ajo'." }
];

const FINAL_MEANING_CHALLENGES = [
  { sentence: "La auditoría detectó una ___ indebida del proveedor en las decisiones del comité.", options: [{ text: "injerencia", correct: true }, { text: "ingerencia", correct: false }], explanation: "'Injerencia' significa intromisión. La forma 'ingerencia' es incorrecta; 'ingerir' pertenece al campo de la alimentación." },
  { sentence: "El investigador presentó la hipótesis como una ___ provisional, no como una conclusión demostrada.", options: [{ text: "conjetura", correct: true }, { text: "congetura", correct: false }], explanation: "'Conjetura' se escribe con J y designa una opinión formada a partir de indicios, pero no plenamente demostrada." },
  { sentence: "La comisión reclamó mayor ___ para evitar que los criterios del informe resultaran incompatibles.", options: [{ text: "homogeneidad", correct: true }, { text: "homojeneidad", correct: false }], explanation: "'Homogeneidad' pertenece a la familia de homogéneo y conserva la G en la terminación culta." }
];

const FINAL_MATCH_PAIRS = [
  { left: "-GÉNEO / -GENEIDAD", right: "G", explanation: "homogéneo, heterogéneo, homogeneidad: terminología culta con G." },
  { left: "FAMILIA DE INJERIR", right: "J", explanation: "injerir, injerencia, injerido: intromisión, no alimentación." },
  { left: "-GIOSO/-GIOSA", right: "G", explanation: "prodigioso, contagiosa, religioso: la terminación se escribe con G." },
  { left: "FAMILIA DE JERARQUÍA", right: "J", explanation: "jerárquico, jerarquizar, jerarquización: la J se conserva." }
];

const FINAL_VERB_CHANGES = [
  { prompt: "Aunque el infinitivo es 'predecir', la analista afirmó que ayer ___ el resultado.", infinitive: "predecir", answer: "predije", options: ["predige", "predije", "predecí"], explanation: "Los derivados de decir forman el pretérito con J: predije, predijiste, predijo." },
  { prompt: "El equipo ___ la hipótesis después de contrastarla con los datos.", infinitive: "traducir", answer: "tradujo", options: ["tradugo", "tradujo", "tradució"], explanation: "Los verbos terminados en -ducir forman el pretérito con J: tradujo, condujo, produjo." }
];

/* -------------------------------------------------------------------------
   8. INSIGNIAS / LOGROS
   ------------------------------------------------------------------------- */
const BADGES = [
  { id: "b1", name: "Maestro de la G", desc: "Domina 20 palabras con G sin fallar.", icon: "G", condition: { type: "correctByLetter", letter: "G", count: 20 } },
  { id: "b2", name: "Experto en J", desc: "Domina 20 palabras con J sin fallar.", icon: "J", condition: { type: "correctByLetter", letter: "J", count: 20 } },
  { id: "b3", name: "Cazador de excepciones", desc: "Responde correctamente 10 palabras de excepción.", icon: "★", condition: { type: "exceptions", count: 10 } },
  { id: "b4", name: "Domador de verbos", desc: "Completa el Nivel 5 (verbos) con al menos 80% de precisión.", icon: "▶", condition: { type: "levelAccuracy", levelId: 5, min: 80 } },
  { id: "b5", name: "Detective de homófonas", desc: "Resuelve correctamente todos los desafíos de significado.", icon: "?", condition: { type: "meaningPerfect" } },
  { id: "b6", name: "Corrector profesional", desc: "Completa el Nivel 8 (contexto profesional).", icon: "✎", condition: { type: "levelComplete", levelId: 8 } },
  { id: "b7", name: "Programador ortográfico", desc: "Completa los desafíos de programación sin errores.", icon: "</>", condition: { type: "categoryPerfect", context: "programming" } },
  { id: "b8", name: "Analista digital", desc: "Completa los desafíos de ciberseguridad sin errores.", icon: "⚑", condition: { type: "categoryPerfect", context: "security" } },
  { id: "b9", name: "Maestro de la diéresis", desc: "Responde correctamente todas las palabras GÜE/GÜI.", icon: "¨", condition: { type: "gueGuiPerfect" } },
  { id: "b10", name: "Maestro G/J", desc: "Completa el Gran Desafío final.", icon: "♛", condition: { type: "finalBossComplete" } }
];

/* -------------------------------------------------------------------------
   9. NIVELES
   ------------------------------------------------------------------------- */
const LEVELS = [
  { id: 1, title: "Fundamentos", desc: "C1 · Analiza el conflicto entre G y J y justifica el sonido /x/.", modules: ["m1"], difficultyRange: [1, 3], questionCount: 8, cefr: "C1" },
  { id: 2, title: "La U especial", desc: "C1 · Distingue GUE, GUI, GÜE y GÜI con precisión fonológica.", modules: ["m2"], difficultyRange: [1, 3], questionCount: 8, cefr: "C1" },
  { id: 3, title: "Reglas de la G", desc: "C1 · Aplica GEST-, GEO-, LEG- y GEN a vocabulario académico.", modules: ["m3"], difficultyRange: [1, 3], questionCount: 10, cefr: "C1" },
  { id: 4, title: "Terminaciones", desc: "C1 · Contrasta terminaciones cultas y excepciones de G y J.", modules: ["m4", "m5", "m6", "m8", "m9"], difficultyRange: [2, 3], questionCount: 10, cefr: "C1" },
  { id: 5, title: "Verbos", desc: "C1 · Razona alternancias, pretéritos irregulares y derivaciones verbales.", modules: ["m7", "m10", "m12"], difficultyRange: [2, 3], questionCount: 10, cefr: "C1" },
  { id: 6, title: "Excepciones", desc: "C1+ · Resuelve palabras trampa y argumenta por qué se apartan de la regla.", modules: ["m3", "m4", "m7", "m8", "m9"], difficultyRange: [2, 3], questionCount: 8, onlyExceptions: true, cefr: "C1+" },
  { id: 7, title: "Significado", desc: "C1+ · Interpreta homófonas y parónimas dentro de contextos complejos.", modules: ["m13"], difficultyRange: [1, 3], questionCount: 7, type: "meaning", cefr: "C1+" },
  { id: 8, title: "Contexto profesional", desc: "C1+ · Edita correos formales con precisión léxica y ortotipográfica.", modules: ["m14"], difficultyRange: [2, 3], questionCount: 4, type: "text", contexts: ["professional"], cefr: "C1+" },
  { id: 9, title: "Tecnología", desc: "C1+ · Audita textos, mensajes y código antes de publicarlos.", modules: ["m15", "m16", "m17", "m18"], difficultyRange: [2, 4], questionCount: 8, type: "text", contexts: ["app", "security", "programming", "web"], cefr: "C1+" },
  { id: 10, title: "Desafío final", desc: "C2 · Defiende cada decisión ortográfica en un examen integral de alta exigencia.", modules: "all", difficultyRange: [3, 4], questionCount: 20, isFinal: true, cefr: "C2" }
];

/* -------------------------------------------------------------------------
   10. MODO EXPOSICIÓN — preguntas listas para presentar en vivo
   ------------------------------------------------------------------------- */
const EXPO_QUESTIONS = [
  { q: "C2 · ¿Qué grafía exige la familia léxica de 'ingenua'?", a: "G — ingenua, como ingenio e ingenuidad.", detail: "La familia léxica orienta la elección: la raíz ingen- conserva la G aunque el sonido pueda inducir a error." },
  { q: "C2 · ¿Qué valor tiene la diéresis en 'ambigüedad'?", a: "Indica que la U se articula en GÜE.", detail: "No es un adorno: distingue la secuencia pronunciada /gwe/ y evita interpretar la U como muda." },
  { q: "C2 · Justifica 'majestuoso' frente a 'gestación'.", a: "'Majestuoso' es una excepción; 'gestación' conserva GEST-.", detail: "La competencia ortográfica exige reconocer la regla y sus excepciones lexicalizadas." },
  { q: "C2 · Completa: 'El informe resulta homo___neo'.", a: "Homogéneo — con G.", detail: "-GÉNEO es una terminación culta de origen grecolatino: homogéneo, heterogéneo." },
  { q: "C2 · ¿Por qué 'proteges' y 'protejo' alternan G/J?", a: "La raíz cambia ante E/O para conservar el sonido fuerte.", detail: "Proteges mantiene G ante E; protejo usa J ante O. La alternancia responde a una regularidad fonográfica." },
  { q: "C2 · Distingue 'ingerir' e 'injerir' en un informe.", a: "Ingerir es incorporar; injerir(se) es intervenir indebidamente.", detail: "La elección depende del significado y del régimen semántico de cada verbo." },
  { q: "C2 · Corrige: 'La ajencia rejistró la injeniería'.", a: "La agencia registró la ingeniería.", detail: "Agencia pertenece a GEN; registrar e ingeniería conservan G por su familia y terminación culta." },
  { q: "C2 · ¿Qué grafía corresponde a la relación con la tierra?", a: "Geopolítica — con GEO- y G.", detail: "GEO- alude a la tierra y mantiene la G en geografía, geología y geopolítica." },
  { q: "C2 · Corrige la forma culta: 'El fenómeno es heterojéneo'.", a: "Heterogéneo — con G.", detail: "La terminación -GÉNEO se escribe con G; la forma exige reconocer una base culta, no solo el sonido." },
  { q: "C2 · ¿'Ligero' contradice la regla de -jero?", a: "Sí: es una excepción lexicalizada y se escribe con G.", detail: "El dominio C2 implica explicar por qué una terminación productiva no basta para resolver todas las palabras." }
];
