import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { endpoints } from "./api-catalog.mjs";
import { locales, localeDirectory, localeRoute } from "./locales.mjs";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
function write(path, text) {
  const file = resolve(root, path);
  if (check) {
    if (readFileSync(file, "utf8") !== text)
      throw new Error(`Generated file is stale: ${path}`);
  } else {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, text);
  }
}
const groups = {
  meta: ["Service operations", "تشغيل الخدمة"],
  surah: ["Surah metadata", "بيانات السور"],
  ayat: ["Quran text", "نص القرآن"],
  reciters: ["Reciters and audio", "القراء والصوت"],
  tafsir: ["Tafsir", "التفسير"],
  azkar: ["Azkar", "الأذكار"],
  hadith: ["Hadith", "الحديث"],
  prayer: ["Prayer times", "مواقيت الصلاة"],
  hijri: ["Hijri calendar", "التقويم الهجري"],
  qibla: ["Qibla", "القبلة"],
};
const returns = {
  getCatalogue: "BonyanRouteCatalogue",
  getHealth: "HealthStatus",
  getReady: "ReadyStatus",
  getMetrics: "string",
  listSurahs: "Surah[]",
  getSurah: "Surah",
  searchSurahs: "Surah[]",
  listAyat: "SurahWithAyat[]",
  getAyaByNumber: "AyaWithSurah",
  getAyaBySurah: "AyaWithSurah",
  searchAyat: "AyatSearchResult",
  listReciters: "Reciter[]",
  getReciter: "Reciter",
  searchReciters: "Reciter[]",
  getReciterAudio: "ReciterAudio",
  listTafsirEditions: "TafsirEdition[]",
  getSurahTafsir: "TafsirItem[] | TafsirItem",
  getAyaTafsir: "TafsirItem",
  listAzkarCategories: "AzkarCategorySummary[]",
  getAzkarCategory: "AzkarCategory",
  searchAzkar: "AzkarSearchResult",
  getRandomZekr: "{ category: string; item: AzkarItem }",
  listHadithBooks: "HadithBook[]",
  getHadithBook: "HadithBookContent",
  getHadith: "HadithItem",
  getRandomHadith: "HadithRandomResult",
  getPrayerTimes: "PrayerTimings",
  getToday: "HijriDate",
  fromGregorian: "HijriDate",
  toGregorian: "HijriDate",
  getQibla: "QiblaInfo",
};
const signatures = {
  getCatalogue: "routes()",
  getHealth: "health()",
  getReady: "ready()",
  getMetrics: "metrics()",
  listSurahs: "surah.list()",
  getSurah: "surah.getById(id)",
  searchSurahs: "surah.search(name)",
  listAyat: "ayat.list()",
  getAyaByNumber: "ayat.getById(id)",
  getAyaBySurah: "ayat.getBySurah(surah, aya)",
  searchAyat: "ayat.search(text, { limit? }?)",
  listReciters: "reciters.list()",
  getReciter: "reciters.getById(id)",
  searchReciters: "reciters.search(name)",
  getReciterAudio: "reciters.getSurah(reciterId, surah)",
  listTafsirEditions: "tafsir.listEditions()",
  getSurahTafsir: "tafsir.forSurah(edition, surah, { aya? }?)",
  getAyaTafsir: "tafsir.forAya(edition, surah, aya)",
  listAzkarCategories: "azkar.listCategories()",
  getAzkarCategory: "azkar.getByCategory(category)",
  searchAzkar: "azkar.search(text, { limit? }?)",
  getRandomZekr: "azkar.random()",
  listHadithBooks: "hadith.listBooks()",
  getHadithBook: "hadith.getBook(bookId, { from?, to? }?)",
  getHadith: "hadith.getByNumber(bookId, number)",
  getRandomHadith: "hadith.random({ book? }?)",
  getPrayerTimes: "prayer.getTimes(options)",
  getToday: "hijri.today()",
  fromGregorian: "hijri.fromGregorian(date?)",
  toGregorian: "hijri.toGregorian(date)",
  getQibla: "qibla.getDirection(latitude, longitude)",
};
for (const lang of locales) {
  const ar = lang === "ar",
    i = ar ? 1 : 0;
  const front = (title, desc) =>
    `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(desc)}\n---\n\n`;
  const link = (e) =>
    `[${e.title[lang]}](${localeRoute(lang, `/api-reference/${e.slug}`)})`;
  let index = front(
    ar ? "مرجع API" : "API reference",
    ar
      ? "جميع مسارات HTTP ومعاملاتها واستجاباتها."
      : "Every HTTP route with parameters and response schemas.",
  );
  index += ar
    ? "الرابط الأساسي `https://api.bonyanoss.org`. جميع المسارات التالية تستخدم GET. لا تحتاج مفتاح API في التنفيذ الحالي. افتح صفحة المسار لتجربة الطلب ورؤية المعاملات وحقول الاستجابة.\n"
    : "Base URL: `https://api.bonyanoss.org`. Every route below uses GET. No API key is required by the current implementation. Open an endpoint to try a request and inspect parameters and response fields.\n";
  index += `\n[${ar ? "تنزيل OpenAPI بالعربية" : "Download English OpenAPI"}](${localeRoute(lang, "/openapi.yaml")}) · [${ar ? "دليل الأخطاء" : "Error guide"}](${localeRoute(lang, "/concepts/errors")})\n`;
  let sdk = front(
    ar ? "مرجع دوال SDK" : "SDK method reference",
    ar
      ? "دوال الموارد والتواقيع والأنواع المعادة."
      : "Resource methods, signatures and return types.",
  );
  sdk += ar
    ? "جميع الدوال أدناه تُستدعى على `client` وتعيد Promise بالنوع المذكور. يشير `?` إلى معامل أو خيار اختياري؛ التواقيع في الجدول مختصرة وليست كودًا للنسخ.\n"
    : "Every method below is called on `client` and returns a Promise of the listed type. `?` denotes an optional argument or option; table signatures are shorthand, not copyable code.\n";
  sdk += ar
    ? "\nالأرقام أعداد JavaScript؛ الأسماء والنصوص ومعرّفات الكتب والنسخ نصوص. التاريخ بصيغة `DD-MM-YYYY`. تقبل prayer.getTimes زوج إحداثيات أو مدينة ودولة، مع date وmethod اختياريين.\n"
    : "\nNumeric arguments are JavaScript numbers; names, queries, book IDs and edition IDs are strings. Dates use `DD-MM-YYYY`. prayer.getTimes accepts coordinates or city/country, plus optional date and method.\n";
  sdk += `\n<Warning>\n${ar ? "بحث ayat وazkar في الإصدار 1.0.2 لا يطابق غلاف API الحالي. لا تعتمد على النوع المعلن دون استخدام الدالة البديلة." : "The ayat and azkar search methods in 1.0.2 do not match the current API envelope. Their declared types do not make their runtime result valid."} [${ar ? "بديل البحث" : "Search adapter"}](${localeRoute(lang, "/sdk/search")}).\n</Warning>\n`;
  for (const [group, titles] of Object.entries(groups)) {
    const members = endpoints.filter((e) => e.slug.startsWith(group + "/"));
    const table =
      `| ${ar ? "المسار" : "Route"} | ${ar ? "المرجع" : "Reference"} |\n| --- | --- |\n` +
      members.map((e) => `| \`GET ${e.path}\` | ${link(e)} |`).join("\n") +
      "\n";
    index += `\n## ${titles[i]}\n\n${table}`;
    const desc = ar
      ? `مسارات ${titles[i]} ومعاملاتها وأمثلتها.`
      : `Routes, parameters and examples for ${titles[0].toLowerCase()}.`;
    let overview = front(titles[i], desc) + desc + "\n\n" + table;
    overview += `\n[${ar ? "سلوك المصادر البديلة" : "Provider fallback"}](${localeRoute(lang, "/concepts/fallback")}) · [${ar ? "مدد الكاش" : "Cache lifetimes"}](${localeRoute(lang, "/concepts/caching")})\n`;
    write(`${localeDirectory(lang)}/api-reference/${group}/overview.mdx`, overview);
    sdk += `\n## ${titles[i]}\n\n| ${ar ? "الدالة" : "Method"} | ${ar ? "نوع النتيجة" : "Result type"} | HTTP |\n| --- | --- | --- |\n`;
    sdk +=
      members
        .map(
          (e) =>
            `| \`${signatures[e.id]}\` | \`${returns[e.id].replaceAll("|", "\\|")}\` | [\`GET ${e.path}\`](${localeRoute(lang, `/api-reference/${e.slug}`)}) |`,
        )
        .join("\n") + "\n";
  }
  sdk += ar
    ? `\nتعيد forSurah في هذا API مصفوفة دائمًا؛ تعريف SDK أوسع. تعيد دوال القوائم المصفوفة المستخرجة من الغلاف، وتعاد بيانات التشغيل مباشرة. استخدم [مرجع المسار](${localeRoute(lang, "/api-reference/overview")}) لمعرفة الحدود وحالات الفشل.\n`
    : `\nThis API always returns an array for forSurah; the SDK declaration is broader. List methods return extracted arrays, and operational methods return raw data. Consult the [HTTP reference](${localeRoute(lang, "/api-reference/overview")}) for limits and failure cases.\n`;
  write(`${localeDirectory(lang)}/api-reference/overview.mdx`, index);
  write(`${localeDirectory(lang)}/sdk/resources.mdx`, sdk);
}
console.log(
  `${check ? "Checked" : "Generated"} API indexes and SDK method tables.`,
);
