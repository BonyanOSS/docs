import { pair } from "./api-catalog.mjs";
const field = (type, en, ar, extra = {}) => ({
  type,
  description: pair(en, ar),
  ...extra,
});
const str = (en, ar, extra) => field("string", en, ar, extra);
const int = (en, ar, extra) => field("integer", en, ar, extra);
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const arr = (items) => ({
  type: "array",
  items: typeof items === "string" ? ref(items) : items,
});
const obj = (properties, required = Object.keys(properties)) => ({
  type: "object",
  required,
  properties,
});
const wrap = (data) =>
  obj({
    success: { type: "boolean", const: true },
    data: typeof data === "string" ? ref(data) : data,
  });
const source = (values) =>
  str(
    "Provider that supplied this result. Optional fields may vary by provider.",
    "المصدر الذي أعاد هذه النتيجة. قد تختلف الحقول الاختيارية حسب المصدر.",
    { enum: values },
  );
const text = () =>
  str(
    "Source text as returned by the API. Documentation language does not translate content.",
    "نص المصدر كما يعيده API. لغة التوثيق لا تترجم المحتوى.",
  );
const quranSources = [
  "alquran.cloud",
  "cdn.jsdelivr.net/fawazahmed0/quran-api",
];
const hadithSources = [
  "hadith.gading.dev",
  "cdn.jsdelivr.net/sutanlab/hadith-api",
];
export const schemas = {
  Catalogue: obj({
    name: str("Service name.", "اسم الخدمة."),
    description: str("Service description.", "وصف الخدمة."),
    routes: arr(
      obj(
        {
          method: { oneOf: [{ type: "string" }, arr({ type: "string" })] },
          url: str(
            "Registered route; path parameters use :name syntax.",
            "المسار المسجّل؛ تستخدم معاملات المسار صيغة :name.",
          ),
          schema: {},
        },
        ["method", "url"],
      ),
    ),
  }),
  Health: obj({
    status: { type: "string", const: "ok" },
    code: { type: "integer", const: 200 },
    timestamp: str(
      "Current server time in ISO 8601.",
      "وقت الخادم الحالي بصيغة ISO 8601.",
      { format: "date-time" },
    ),
  }),
  Cache: obj({
    entries: int(
      "Stored cache entries, including entries not yet evicted.",
      "عناصر الكاش المخزّنة، بما فيها العناصر التي لم تُزل بعد.",
    ),
    inflight: int(
      "Cache loads currently in flight.",
      "عمليات تحميل الكاش الجارية.",
    ),
  }),
  Ready: obj({
    status: { type: "string", const: "ready" },
    code: { type: "integer", const: 200 },
    timestamp: str("Current server time.", "وقت الخادم الحالي.", {
      format: "date-time",
    }),
    cache: ref("Cache"),
  }),
  Metrics: { type: "string" },
  Error: obj({
    success: { type: "boolean", const: false },
    message: str(
      "Human-readable error. Do not parse it for control flow.",
      "رسالة خطأ مقروءة. لا تعتمد على نصها للتحكم بالبرنامج.",
    ),
    error: obj({
      code: str(
        "Machine-readable code. Explicit 503 failures can use INTERNAL_SERVER_ERROR; exhausted sources use ALL_SOURCES_FAILED.",
        "رمز قابل للمعالجة. قد تستخدم أخطاء 503 المباشرة INTERNAL_SERVER_ERROR؛ ويستخدم فشل المصادر ALL_SOURCES_FAILED.",
        {
          enum: [
            "BAD_REQUEST",
            "NOT_FOUND",
            "RATE_LIMITED",
            "ALL_SOURCES_FAILED",
            "INTERNAL_SERVER_ERROR",
          ],
        },
      ),
      message: str("Error message.", "رسالة الخطأ."),
      requestId: str(
        "Request identifier for troubleshooting.",
        "معرّف الطلب لتتبع المشكلة.",
      ),
    }),
  }),
  Surah: obj(
    {
      id: int("Surah number.", "رقم السورة.", { minimum: 1, maximum: 114 }),
      name: str("Surah name from the provider.", "اسم السورة من المصدر."),
      makkia: field(
        "boolean",
        "Whether the surah is Meccan, when supplied.",
        "هل السورة مكية، إذا وفر المصدر القيمة.",
      ),
      apiName: source(["mp3quran.net", "alquran.cloud", "quran.com"]),
    },
    ["id", "name", "apiName"],
  ),
  Aya: obj({
    number: int("Global verse number.", "رقم الآية العام."),
    text: text(),
    numberInSurah: int(
      "Verse number within its surah.",
      "رقم الآية داخل سورتها.",
    ),
  }),
  SurahWithAyat: obj({
    number: int("Surah number.", "رقم السورة."),
    name: str("Surah name.", "اسم السورة."),
    ayat: arr("Aya"),
    apiName: source(quranSources),
  }),
  AyaLookup: obj({
    surahNumber: int("Surah number.", "رقم السورة."),
    surahName: str("Surah name.", "اسم السورة."),
    aya: ref("Aya"),
  }),
  Moshaf: obj({
    id: int("Provider moshaf ID.", "معرّف المصحف لدى المصدر."),
    name: str("Moshaf name.", "اسم المصحف."),
    server: str("Base audio-server URL.", "الرابط الأساسي لخادم الصوت.", {
      format: "uri",
    }),
  }),
  Reciter: obj(
    {
      id: int("Provider-specific reciter ID.", "معرّف القارئ لدى المصدر."),
      name: str("Reciter name.", "اسم القارئ."),
      date: str("Provider date metadata.", "بيانات التاريخ من المصدر."),
      moshaf: arr("Moshaf"),
      style: {
        type: ["string", "null"],
        description: pair(
          "Recitation style, when provided.",
          "أسلوب التلاوة إذا توفر.",
        ),
      },
      apiName: source(["mp3quran.net", "quran.com"]),
    },
    ["id", "name", "apiName"],
  ),
  ReciterAudio: obj({
    reciter: str("Reciter name.", "اسم القارئ."),
    surah: int("Surah number.", "رقم السورة."),
    audio: str(
      "Constructed MP3 URL; file availability is not checked.",
      "رابط MP3 منشأ؛ لا يجري التحقق من وجود الملف.",
      { format: "uri" },
    ),
  }),
  TafsirEdition: obj({
    id: str(
      "Public edition key accepted in paths.",
      "معرّف النسخة العام المقبول في المسار.",
      { enum: ["muyassar", "jalalayn", "saadi", "waseet", "qurtubi"] },
    ),
    label: str("Arabic edition name.", "اسم النسخة بالعربية."),
  }),
  TafsirItem: obj({
    surah: int("Surah number.", "رقم السورة."),
    aya: int("Verse number within the surah.", "رقم الآية داخل السورة."),
    text: text(),
    edition: str(
      "Provider edition ID, for example ar.muyassar or arabic_moyassar. This differs from the public path ID.",
      "معرّف النسخة لدى المصدر مثل ar.muyassar أو arabic_moyassar. يختلف عن المعرّف العام في المسار.",
    ),
    apiName: source(["alquran.cloud", "quranenc.com"]),
  }),
  AzkarCategorySummary: obj({
    name: str("Category name.", "اسم التصنيف."),
    count: int("Number of items in this category.", "عدد الأذكار في التصنيف."),
    apiName: source(["github.com/nawafalqari", "hisnmuslim.com"]),
  }),
  AzkarItem: obj(
    {
      id: int(
        "Item ID within its source/category; not a global ID.",
        "معرّف الذكر داخل المصدر أو التصنيف، وليس معرّفًا عامًا.",
      ),
      text: text(),
      count: int(
        "Suggested repetitions, when supplied.",
        "عدد التكرارات عند توفره.",
      ),
      reference: str(
        "Source reference, when supplied.",
        "مرجع الذكر عند توفره.",
      ),
      description: str(
        "Additional source description.",
        "وصف إضافي من المصدر.",
      ),
      content: str("Additional source content.", "محتوى إضافي من المصدر."),
    },
    ["id", "text"],
  ),
  AzkarCategory: obj({
    category: str("Category name.", "اسم التصنيف."),
    items: arr("AzkarItem"),
    apiName: source(["github.com/nawafalqari", "hisnmuslim.com"]),
  }),
  AzkarPick: obj({
    category: str("Category name.", "اسم التصنيف."),
    item: ref("AzkarItem"),
  }),
  HadithBook: obj({
    id: str("Book ID used in requests.", "معرّف الكتاب المستخدم في الطلبات."),
    name: str("Book name.", "اسم الكتاب."),
    available: int(
      "Provider-reported number of narrations.",
      "عدد الأحاديث الذي يذكره المصدر.",
    ),
    apiName: source(hadithSources),
  }),
  Hadith: obj({
    number: int("Hadith number within the book.", "رقم الحديث داخل الكتاب."),
    text: text(),
    book: str(
      "Book name returned by the provider.",
      "اسم الكتاب الذي يعيده المصدر.",
    ),
    apiName: source(hadithSources),
  }),
  HadithRange: obj({
    book: str("Book name.", "اسم الكتاب."),
    available: int(
      "Available count for the whole book, not the returned slice.",
      "العدد المتاح للكتاب كاملًا وليس للنطاق المعاد.",
    ),
    hadiths: arr("Hadith"),
  }),
  PrayerTimings: obj(
    Object.fromEntries(
      [
        "Fajr",
        "Sunrise",
        "Dhuhr",
        "Asr",
        "Sunset",
        "Maghrib",
        "Isha",
        "Imsak",
        "Midnight",
      ].map((key) => [
        key,
        str(
          "Provider-formatted local time. It may include a timezone suffix; do not assume an ISO timestamp.",
          "وقت محلي بصيغة المصدر. قد يحتوي لاحقة منطقة زمنية؛ ليس بالضرورة طابعًا زمنيًا بصيغة ISO.",
        ),
      ]),
    ),
    ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"],
  ),
  Coordinates: obj({
    latitude: field("number", "Latitude in degrees.", "خط العرض بالدرجات."),
    longitude: field("number", "Longitude in degrees.", "خط الطول بالدرجات."),
  }),
  PrayerTimes: obj(
    {
      date: str(
        "Gregorian date in the provider’s format.",
        "التاريخ الميلادي بصيغة المصدر.",
      ),
      hijri: str(
        "Hijri date in the provider’s format.",
        "التاريخ الهجري بصيغة المصدر.",
      ),
      timings: ref("PrayerTimings"),
      method: str(
        "Calculation method name, if supplied.",
        "اسم طريقة الحساب إذا توفر.",
      ),
      coordinates: ref("Coordinates"),
      apiName: source(["aladhan.com", "pray.zone"]),
    },
    ["date", "timings", "apiName"],
  ),
  HijriDate: obj({
    hijri: obj({
      date: str("Hijri date.", "التاريخ الهجري."),
      day: str("Day as a string.", "اليوم كنص."),
      month: str("Month name.", "اسم الشهر."),
      monthAr: str("Arabic month name.", "اسم الشهر بالعربية."),
      year: str("Year as a string.", "السنة كنص."),
      weekday: str("Weekday name.", "اسم يوم الأسبوع."),
      weekdayAr: str("Arabic weekday name.", "اسم يوم الأسبوع بالعربية."),
    }),
    gregorian: obj({
      date: str("Gregorian date.", "التاريخ الميلادي."),
      day: str("Day as a string.", "اليوم كنص."),
      month: str("Month name.", "اسم الشهر."),
      year: str("Year as a string.", "السنة كنص."),
    }),
    apiName: source(["aladhan.com"]),
  }),
  Qibla: obj({
    latitude: field("number", "Latitude in degrees.", "خط العرض بالدرجات."),
    longitude: field("number", "Longitude in degrees.", "خط الطول بالدرجات."),
    direction: field(
      "number",
      "Degrees clockwise from true north toward the Kaaba.",
      "درجات باتجاه عقارب الساعة من الشمال الحقيقي نحو الكعبة.",
    ),
    apiName: source(["aladhan.com", "local"]),
  }),
};
Object.assign(schemas, {
  SurahListResponse: wrap(obj({ surah: arr("Surah") })),
  SurahResponse: wrap("Surah"),
  SurahSearchResponse: wrap(arr("Surah")),
  AyatCorpusResponse: wrap(obj({ surahs: arr("SurahWithAyat") })),
  AyaLookupResponse: wrap("AyaLookup"),
  ReciterCollectionResponse: wrap(obj({ reciters: arr("Reciter") })),
  ReciterResponse: wrap("Reciter"),
  ReciterSearchResponse: wrap(arr("Reciter")),
  ReciterAudioResponse: wrap("ReciterAudio"),
  TafsirEditionListResponse: wrap(arr("TafsirEdition")),
  TafsirListResponse: wrap(arr("TafsirItem")),
  TafsirItemResponse: wrap("TafsirItem"),
  AzkarCategorySummaryResponse: wrap(
    obj({ categories: arr("AzkarCategorySummary") }),
  ),
  AzkarCategoryResponse: wrap("AzkarCategory"),
  AzkarPickResponse: wrap("AzkarPick"),
  HadithBookListResponse: wrap(arr("HadithBook")),
  HadithResponse: wrap("Hadith"),
  RandomHadithResponse: wrap(
    obj({ book: str("Book name.", "اسم الكتاب."), hadith: ref("Hadith") }),
  ),
  HadithListResponse: wrap("HadithRange"),
  PrayerTimesResponse: wrap("PrayerTimes"),
  HijriResponse: wrap("HijriDate"),
  QiblaResponse: wrap("Qibla"),
});
for (const [key, item] of [
  ["AyaSearchResponse", "AyaLookup"],
  ["AzkarSearchResponse", "AzkarPick"],
])
  schemas[key] = obj({
    success: { type: "boolean", const: true },
    total: int(
      "Returned count after the limit.",
      "عدد النتائج المعادة بعد الحد.",
    ),
    data: arr(item),
  });
export function localize(value, lang) {
  if (Array.isArray(value)) return value.map((v) => localize(v, lang));
  if (value && typeof value === "object") {
    if (typeof value.en === "string" && typeof value.ar === "string")
      return value[lang];
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, localize(v, lang)]),
    );
  }
  return value;
}
