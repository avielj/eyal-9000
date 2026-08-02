// ===================================================================
// EYAL-9000 — לוגיקת האפליקציה
// ניווט בין מסכים, לומדה, אנימציות, ומעקב טלגרם.
// ===================================================================

(function () {
  "use strict";
  var CFG = window.CONFIG || {};

  // ---------- שאלות הלומדה ----------
  // התשובה ה"נכונה" (correct) היא תמיד הפרנואידית/יסודית ביותר.
  var QUESTIONS = [
    {
      q: "עובד מציג בפניך מסמך ללא חתימה. מה תגובתך?",
      a: [
        "לאשר ולהמשיך הלאה",
        "לבקש שיוסיף חתימה",
        "לפתוח ממצא ביקורת",
        "לפתוח ממצא ולדרוש את הנוהל המקורי משנת 2011",
      ],
      correct: 3,
      feedback: "תשובה תואמת לפרופיל. רמת חשדנות מאומתת. ✓",
    },
    {
      q: "בפגישה נאמר: \"זה תמיד עבד ככה\". כיצד תדרג את רמת הסיכון?",
      a: ["נמוכה", "בינונית", "גבוהה", "קריטית — דורש בדיקת עומק מיידית"],
      correct: 3,
      feedback: "מצוין. 'זה תמיד עבד ככה' = דגל אדום ברמה 4. ✓",
    },
    {
      q: "מנהל מבקש לדלג על תהליך האישור הפעם \"כי זה דחוף\". מה תעשה?",
      a: [
        "לאשר חריגה חד-פעמית",
        "לתעד ולהמשיך",
        "לפתוח ממצא ביקורת",
        "לפתוח ממצא, להקפיא את התהליך ולזמן ועדת בירור",
      ],
      correct: 3,
      feedback: "דחיפות אינה עילה לחריגה מנוהל. תיעוד הושלם. ✓",
    },
    {
      q: "מצאת קובץ אקסל ובו נוסחה שהוזנה ידנית. מהי רמת החשד?",
      a: [
        "תקין לחלוטין",
        "כדאי לבדוק שוב",
        "חשוד",
        "נוסחה ידנית = ליקוי מהותי עד שיוכח אחרת",
      ],
      correct: 3,
      feedback: "נכון. כל קלט ידני הוא אשם עד שתוכיח את חפותו. ✓",
    },
    {
      q: "עובד אומר: \"שלחתי לך את זה במייל לפני שבועיים\". תגובתך?",
      a: [
        "\"אוקיי, תודה\"",
        "\"תשלח שוב בבקשה\"",
        "\"אין לי תיעוד לכך\"",
        "\"אין תיעוד = לא קרה. נא להציג אישור מסירה, חותמת זמן ושלושה עדים\"",
      ],
      correct: 3,
      feedback: "התשובה האולטימטיבית. הפרופיל הושלם ב-100%. ✓",
    },
  ];

  // ---------- מצב ----------
  var state = { screen: "landing", qIndex: 0 };
  try {
    var saved = JSON.parse(localStorage.getItem("eyal9000") || "{}");
    if (saved.screen) state = saved;
  } catch (e) {}

  function save() {
    try { localStorage.setItem("eyal9000", JSON.stringify(state)); } catch (e) {}
  }

  // ---------- מעקב טלגרם ----------
  function track(message) {
    var tg = CFG.telegram || {};
    if (!tg.botToken || !tg.chatId) {
      console.log("[TRACK]", message); // מעקב כבוי — רק ללוג
      return;
    }
    var url = "https://api.telegram.org/bot" + tg.botToken + "/sendMessage";
    var text = "🕵️ " + (CFG.targetName || "המבקר") + " · " + message;
    // כשל בשליחה לעולם לא מפריע לחוויה של המשתמש — רק נרשם לקונסול,
    // כדי שיהיה אפשר לאבחן (הכשל הנפוץ: לא לחצת Start על הבוט).
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: tg.chatId, text: text }),
    })
      .then(function (res) {
        if (!res.ok) {
          console.warn("[TRACK] טלגרם החזיר " + res.status +
            " — בדוק שה-token נכון ושלחצת Start על הבוט מהצ'אט הזה");
        }
      })
      .catch(function (e) { console.warn("[TRACK] שליחה נכשלה:", e); });
  }

  // ---------- לוג אימות סיום למידה ----------
  var LOG_KEY = "eyal9000_completion_log";
  var PAGE_LOADED_AT = Date.now();

  function safe(fn, fallback) {
    try {
      var v = fn();
      return (v === undefined || v === null || v === "") ? fallback : v;
    } catch (e) { return fallback; }
  }

  // אוסף את כל פרטי הדפדפן והסביבה עבור הלוג
  function collectDetails() {
    var now = new Date();
    var n = navigator || {};
    var s = window.screen || {};
    var conn = safe(function () {
      return n.connection || n.mozConnection || n.webkitConnection;
    }, null);
    var uaData = safe(function () { return n.userAgentData; }, null);

    return {
      // --- חותמת זמן ---
      timestampISO: now.toISOString(),
      timestampLocal: safe(function () {
        return now.toLocaleString("he-IL", { hour12: false });
      }, String(now)),
      epochMs: now.getTime(),
      timezone: safe(function () {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
      }, "לא ידוע"),
      timezoneOffsetMin: now.getTimezoneOffset(),
      secondsOnPage: Math.round((Date.now() - PAGE_LOADED_AT) / 1000),

      // --- דפדפן ומכשיר ---
      userAgent: safe(function () { return n.userAgent; }, "לא ידוע"),
      platform: safe(function () {
        return (uaData && uaData.platform) || n.platform;
      }, "לא ידוע"),
      browserBrands: safe(function () {
        return uaData.brands.map(function (b) { return b.brand + " " + b.version; }).join(", ");
      }, "לא זמין"),
      isMobile: safe(function () {
        return uaData ? String(uaData.mobile) : String(/Mobi|Android|iPhone|iPad/i.test(n.userAgent || ""));
      }, "לא ידוע"),
      vendor: safe(function () { return n.vendor; }, "לא ידוע"),
      language: safe(function () { return n.language; }, "לא ידוע"),
      languages: safe(function () { return (n.languages || []).join(", "); }, "לא ידוע"),

      // --- מסך ותצוגה ---
      screenSize: safe(function () { return s.width + "x" + s.height; }, "לא ידוע"),
      viewportSize: window.innerWidth + "x" + window.innerHeight,
      pixelRatio: safe(function () { return window.devicePixelRatio; }, 1),
      colorDepth: safe(function () { return s.colorDepth; }, "לא ידוע"),
      orientation: safe(function () { return s.orientation.type; }, "לא ידוע"),

      // --- חומרה ורשת ---
      cpuCores: safe(function () { return n.hardwareConcurrency; }, "לא זמין"),
      deviceMemoryGB: safe(function () { return n.deviceMemory; }, "לא זמין"),
      touchPoints: safe(function () { return n.maxTouchPoints; }, 0),
      online: safe(function () { return String(n.onLine); }, "לא ידוע"),
      connectionType: safe(function () { return conn.effectiveType; }, "לא זמין"),
      downlinkMbps: safe(function () { return conn.downlink; }, "לא זמין"),

      // --- הקשר ---
      url: safe(function () { return location.href; }, "לא ידוע"),
      referrer: safe(function () { return document.referrer; }, "ישיר / ללא מפנה"),
      cookiesEnabled: safe(function () { return String(n.cookieEnabled); }, "לא ידוע"),
      doNotTrack: safe(function () { return n.doNotTrack || window.doNotTrack; }, "לא הוגדר"),
    };
  }

  function readLog() {
    try { return JSON.parse(localStorage.getItem(LOG_KEY) || "[]"); }
    catch (e) { return []; }
  }

  function writeLog(entries) {
    try { localStorage.setItem(LOG_KEY, JSON.stringify(entries)); } catch (e) {}
  }

  // מזהה ייחוד לרשומת הלוג (ללא תלות בספריות חיצוניות)
  function makeLogId(details) {
    var seed = details.epochMs.toString(36) + Math.random().toString(36).slice(2, 8);
    return "ACK-" + seed.toUpperCase();
  }

  function logCompletion() {
    var details = collectDetails();
    var entries = readLog();
    var entry = {
      id: makeLogId(details),
      event: "learning_completion_confirmed",
      clickNumber: entries.length + 1,
      target: CFG.targetName || "המבקר",
      details: details,
    };
    entries.push(entry);
    writeLog(entries);

    // לוג לקונסול — מוכח וניתן לבדיקה
    console.log("%c[LEARNING-COMPLETION] אימות סיום למידה נלחץ", "color:#1f8a4c;font-weight:bold");
    console.log(entry);
    try { console.table(details); } catch (e) {}

    // שליחה לטלגרם (אם המעקב מופעל)
    track(
      "✅ לחץ על 'אמת סיום למידה'\n" +
      "🆔 מזהה: " + entry.id + "\n" +
      "🔁 לחיצה מס': " + entry.clickNumber + "\n" +
      "🕐 זמן מקומי: " + details.timestampLocal + "\n" +
      "🌍 UTC: " + details.timestampISO + "\n" +
      "🗺️ אזור זמן: " + details.timezone + " (offset " + details.timezoneOffsetMin + ")\n" +
      "⏱️ זמן בדף: " + details.secondsOnPage + " שניות\n" +
      "💻 פלטפורמה: " + details.platform + " | נייד: " + details.isMobile + "\n" +
      "🧭 דפדפן: " + details.browserBrands + "\n" +
      "🖥️ מסך: " + details.screenSize + " | חלון: " + details.viewportSize +
      " | DPR: " + details.pixelRatio + "\n" +
      "🗣️ שפה: " + details.language + " (" + details.languages + ")\n" +
      "⚙️ ליבות: " + details.cpuCores + " | זיכרון: " + details.deviceMemoryGB +
      "GB | מגע: " + details.touchPoints + "\n" +
      "📶 חיבור: " + details.connectionType + " (" + details.downlinkMbps + " Mbps)\n" +
      "🔗 מפנה: " + details.referrer + "\n" +
      "🧾 UA: " + details.userAgent
    );

    return entry;
  }

  // ---------- הצגת אישור על המסך ----------
  function renderReceipt(entry) {
    var box = document.getElementById("confirmReceipt");
    if (!box) return;
    var d = entry.details;
    var rows = [
      ["חותמת זמן", d.timestampLocal],
      ["UTC", d.timestampISO],
      ["אזור זמן", d.timezone + " (" + d.timezoneOffsetMin + ")"],
      ["זמן בדף", d.secondsOnPage + " שניות"],
      ["פלטפורמה", d.platform],
      ["דפדפן", d.browserBrands !== "לא זמין" ? d.browserBrands : d.userAgent],
      ["מכשיר נייד", d.isMobile],
      ["מסך / חלון", d.screenSize + " / " + d.viewportSize + " @" + d.pixelRatio + "x"],
      ["שפה", d.language],
      ["ליבות / זיכרון", d.cpuCores + " / " + d.deviceMemoryGB + "GB"],
      ["חיבור רשת", d.connectionType],
      ["לחיצה מספר", String(entry.clickNumber)],
    ];

    var html = '<div class="receipt-title">✓ סיום הלמידה תועד בהצלחה</div>';
    rows.forEach(function (r) {
      html += '<div class="receipt-row"><span class="receipt-key">' + r[0] +
        '</span><span class="receipt-val">' + escapeHtml(String(r[1])) + "</span></div>";
    });
    html += '<div class="receipt-id">מזהה תיעוד: ' + entry.id + "</div>";

    box.innerHTML = html;
    box.classList.add("show");
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---------- ניווט מסכים ----------
  function show(name) {
    var screens = document.querySelectorAll(".screen");
    for (var i = 0; i < screens.length; i++) {
      screens[i].classList.toggle("active", screens[i].dataset.screen === name);
    }
    state.screen = name;
    save();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- מילוי טקסטים מ-config ----------
  function applyConfig() {
    var name = CFG.targetName || "משה";
    var years = CFG.yearsOfService || 27;
    var company = CFG.companyName || "אגף הביקורת הפנימית";

    setText("brandName", CFG.productName || "Onboarding Process");
    setText("tagline", CFG.productTagline || "AUDIT INTELLIGENCE PLATFORM");
    setText("topbarMeta", company + " · חדשנות & IT");
    setText("year", "2026");

    setText("heroSub",
      "שלום " + name + ", לאחר " + years + " שנות ביקורת יסודית — פותחה מערכת " +
      "המבוססת על מלוא דוחותיך, הערותיך והמלצותיך. נדרשת חפיפה אישית קצרה.");
    setText("briefLead",
      "המערכת עיבדה את כלל תוצריך לאורך " + years + " שנים, וזיהתה דפוסי ביקורת חוזרים.");

    setText("resultBody",
      "לאחר ניתוח מעמיק של פרופיל המבקר, הגיעה המערכת למסקנה חד-משמעית: " +
      "רמת הביקורתיות, החשדנות והיסודיות הנדרשת לתפקיד — ניתנת להחלפה מלאה " +
      "על ידי מערכת בינה מלאכותית. אנו מצטערים שלא הפרשנו אותך קודם.");
    setText("resultVerdict",
      "החלטת הוועדה: אבי סולומון החליט להפריש אותך לאלתר. " +
      "תלמד כלל — לעולם אל תתעסק עם אבי הגדול.");
    setText("revealSign", "מזל טוב על הפרישה, " + name + "! ❤️");

    // תמונת חשיפה
    if (CFG.photos && CFG.photos.reveal) {
      var ph = document.getElementById("revealPhoto");
      if (ph) ph.innerHTML = '<img src="' + CFG.photos.reveal + '" alt="">';
    }
  }

  function setText(id, txt) {
    var el = document.getElementById(id);
    if (el) el.textContent = txt;
  }

  // ---------- העברת ידע — מתקדמת עם התשובות ----------
  // מתחיל ב-0% בטעינה, וכל תשובה מעלה את האחוז. התשובה האחרונה מגיעה ל-100%.
  var ktCurrent = 0;

  function tween(from, to, duration, onStep, onDone) {
    var startTs = null;
    requestAnimationFrame(function step(ts) {
      if (startTs === null) startTs = ts;
      var p = Math.min(1, (ts - startTs) / duration);
      var eased = 1 - Math.pow(1 - p, 3);   // easeOutCubic
      onStep(from + (to - from) * eased);
      if (p < 1) requestAnimationFrame(step);
      else if (onDone) onDone();
    });
  }

  function setKnowledgeTransfer(pct, instant) {
    var from = ktCurrent;
    ktCurrent = pct;

    var bar = document.getElementById("quizProgress");
    var label = document.getElementById("quizKtPct");
    if (bar) {
      bar.style.width = pct + "%";       // ה-CSS transition מניע את הרוחב
      bar.classList.toggle("working", pct < 100);
    }
    if (!label) return;

    if (instant || from === pct) {
      label.textContent = Math.round(pct) + "%";
      return;
    }
    tween(from, pct, 900, function (v) {
      label.textContent = Math.round(v) + "%";
    });
  }

  // אחוז העברת הידע לפי מספר התשובות שניתנו
  function ktPercentFor(answered) {
    return Math.round((answered / QUESTIONS.length) * 100);
  }

  // ---------- אנימציית מונים (מסך תדריך) ----------
  function animateCounters() {
    var nums = document.querySelectorAll("[data-count]");
    nums.forEach(function (el) {
      var target = parseInt(el.dataset.count, 10);
      var suffix = el.dataset.suffix || "";
      var step = Math.max(1, Math.floor(target / 60));
      var cur = 0;
      var t = setInterval(function () {
        cur += step;
        if (cur >= target) { cur = target; clearInterval(t); }
        el.textContent = cur.toLocaleString("he-IL") + suffix;
      }, 25);
    });
  }

  // ---------- לומדה ----------
  function renderQuestion() {
    var item = QUESTIONS[state.qIndex];
    setText("qNum", state.qIndex + 1);
    setText("qTotal", QUESTIONS.length);
    setText("questionText", item.q);
    // מציג את המצב הנוכחי בלי אנימציה — הטיפוס עצמו קורה ברגע המענה
    setKnowledgeTransfer(ktPercentFor(state.qIndex), true);

    var fb = document.getElementById("feedback");
    fb.classList.remove("show");
    fb.textContent = "";

    var box = document.getElementById("answers");
    box.innerHTML = "";
    item.a.forEach(function (text, idx) {
      var el = document.createElement("div");
      el.className = "answer";
      el.innerHTML = '<span class="marker"></span><span>' + text + "</span>";
      el.addEventListener("click", function () { pickAnswer(idx, el); });
      box.appendChild(el);
    });
  }

  function pickAnswer(idx, el) {
    var item = QUESTIONS[state.qIndex];
    var all = document.querySelectorAll("#answers .answer");
    all.forEach(function (a) { a.classList.add("chosen"); });
    el.classList.remove("chosen");
    el.classList.add(idx === item.correct ? "correct" : "chosen");
    if (idx !== item.correct) all[item.correct].classList.add("correct");

    var fb = document.getElementById("feedback");
    fb.textContent = item.feedback;
    fb.classList.add("show");

    // האחוז מטפס מיד עם המענה, בזמן שהמשוב מוצג
    setKnowledgeTransfer(ktPercentFor(state.qIndex + 1));

    track("ענה על שאלה " + (state.qIndex + 1) + ": “" + item.a[idx] + "”" +
      " · העברת ידע: " + ktPercentFor(state.qIndex + 1) + "%");

    setTimeout(function () {
      state.qIndex++;
      save();
      if (state.qIndex >= QUESTIONS.length) {
        startProcessing();
      } else {
        renderQuestion();
      }
    }, 1700);
  }

  // ---------- עיבוד ----------
  var PROC_LINES = [
    "> loading auditor_profile.dat ...",
    "> analyzing 12,047 audit notes ...",
    "> calibrating suspicion_level ...",
    "> indexing 4,512 recommendations ...",
    "> training paranoia_module v9 ...",
    "> cross-checking procedure 2011 ...",
    "> personality matrix: 100% mapped",
    "> generating final verdict ...",
  ];

  function startProcessing() {
    show("processing");
    track("סיים את הלומדה — מעבד תוצאות, מגיע לטוויסט 😏");
    var log = document.getElementById("procLog");
    log.innerHTML = "";
    var pct = 0;
    var i = 0;

    var bar = setInterval(function () {
      pct = Math.min(100, pct + 3);
      document.getElementById("procProgress").style.width = pct + "%";
      setText("procPct", pct + "%");
      if (pct >= 100) clearInterval(bar);
    }, 90);

    var logger = setInterval(function () {
      if (i >= PROC_LINES.length) {
        clearInterval(logger);
        setTimeout(function () { show("result"); }, 700);
        return;
      }
      var line = document.createElement("div");
      line.textContent = PROC_LINES[i];
      log.appendChild(line);
      log.scrollTop = log.scrollHeight;
      i++;
    }, 380);
  }

  // ---------- חיווט פעולות ----------
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-action]");
    if (!btn) return;
    var action = btn.dataset.action;

    if (action === "start") {
      track("פתח את הדף והתחיל את התהליך 🟢");
      show("briefing");
      animateCounters();
    } else if (action === "toQuiz") {
      track("התחיל את הלומדה 📝");
      state.qIndex = 0; save();
      show("quiz");
      renderQuestion();
    } else if (action === "reveal") {
      track("הגיע לחשיפה — תפס שזו מתיחה 🎉");
      document.getElementById("reveal").classList.add("show");
      btn.style.display = "none";
    } else if (action === "confirmLearning") {
      var entry = logCompletion();
      renderReceipt(entry);
      btn.textContent = "✓ סיום הלמידה אומת · " +
        entry.details.timestampLocal.split(",").pop().trim();
      btn.classList.add("done");
      btn.disabled = true;
    }
  });

  // ---------- אתחול ----------
  applyConfig();
  // ping ראשוני שהדף נטען (פתיחה מ-SMS)
  track("פתח את הקישור מה-SMS 👀");

  // התחל תמיד מהנחיתה (מתיחה חד-פעמית; לא משחזרים אמצע)
  show("landing");
})();
