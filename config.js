// ===================================================================
// EYAL-9000 — קובץ הגדרות מרכזי
// כל מה שצריך לשנות נמצא כאן. אין צורך לגעת בקבצים אחרים.
// ===================================================================

window.CONFIG = {
  // --- מיתוג ---
  companyName: "אגף הביקורת הפנימית",      // לדוגמה: "ICL Audit Intelligence" — מלא מאוחר יותר
  productName: "Onboarding Process",
  productTagline: "AUDIT INTELLIGENCE PLATFORM",
  targetName: "משה דנה",
  yearsOfService: 27,

  // --- מעקב טלגרם ---
  // השאר ריק כדי לכבות מעקב (האתר יעבוד רגיל). מלא מאוחר יותר.
  telegram: {
    botToken: "",   // לדוגמה: "123456789:AAQ..."  (מ-@BotFather)
    chatId: "",     // ה-chat id שלך
  },

  // --- תמונות (placeholder עד שתשלח תמונות אמיתיות של משה) ---
  // אפשר לשים נתיב לקובץ ב-assets/ במקום אימוג'י הקוף.
  photos: {
    reveal: "assets/moshe-reveal.jpg",     // ריק = אימוג'י קוף 🐒
  },
};
