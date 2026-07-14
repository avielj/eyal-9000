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
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: tg.chatId, text: text }),
    }).catch(function () { /* שקט — לא מפריע לחוויה */ });
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
    document.getElementById("quizProgress").style.width =
      Math.round((state.qIndex / QUESTIONS.length) * 100) + "%";

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

    track("ענה על שאלה " + (state.qIndex + 1) + ": “" + item.a[idx] + "”");

    setTimeout(function () {
      state.qIndex++;
      save();
      if (state.qIndex >= QUESTIONS.length) {
        document.getElementById("quizProgress").style.width = "100%";
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
    }
  });

  // ---------- אתחול ----------
  applyConfig();
  // ping ראשוני שהדף נטען (פתיחה מ-SMS)
  track("פתח את הקישור מה-SMS 👀");

  // התחל תמיד מהנחיתה (מתיחה חד-פעמית; לא משחזרים אמצע)
  show("landing");
})();
