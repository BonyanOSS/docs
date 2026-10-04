// Reviewed source contracts are recorded in sources.lock.json.
export const baseUrl = "https://api.bonyanoss.org";
export const pair = (en, ar) => ({ en, ar });
export const endpoints = [
  {
    path: "/",
    slug: "meta/catalogue",
    id: "getCatalogue",
    title: {
      en: "Route catalogue",
      ar: "فهرس المسارات",
    },
    description: {
      en: "Lists registered content routes and project metadata. The four operational routes are excluded from the catalogue.",
      ar: "يعرض مسارات المحتوى المسجّلة وبيانات المشروع. لا يدرج مسارات التشغيل الأربعة.",
    },
    schema: "Catalogue",
    params: [],
    sdk: "client.routes()",
    errors: [],
    notes: null,
  },
  {
    path: "/health",
    slug: "meta/health",
    id: "getHealth",
    title: {
      en: "Liveness",
      ar: "فحص الحياة",
    },
    description: {
      en: "Confirms the HTTP process responds. It does not contact content providers.",
      ar: "يتحقق من استجابة عملية HTTP. لا يتصل بمصادر المحتوى.",
    },
    schema: "Health",
    params: [],
    sdk: "client.health()",
    errors: [],
    notes: null,
  },
  {
    path: "/ready",
    slug: "meta/ready",
    id: "getReady",
    title: {
      en: "Readiness and cache",
      ar: "الجاهزية والكاش",
    },
    description: {
      en: "Returns process readiness and current cache counts. This is not an upstream availability check.",
      ar: "يعيد جاهزية العملية وأعداد عناصر الكاش الحالية. لا يفحص توفر المصادر الخارجية.",
    },
    schema: "Ready",
    params: [],
    sdk: "client.ready()",
    errors: [],
    notes: null,
  },
  {
    path: "/metrics",
    slug: "meta/metrics",
    id: "getMetrics",
    title: {
      en: "Prometheus metrics",
      ar: "مقاييس Prometheus",
    },
    description: {
      en: "Returns uptime, cache gauges and upstream request counters as text.",
      ar: "يعيد مدة التشغيل ومقاييس الكاش وعدادات طلبات المصادر كنص.",
    },
    schema: "Metrics",
    params: [],
    sdk: "client.metrics()",
    errors: [],
    notes: null,
  },
  {
    path: "/surah",
    slug: "surah/list",
    id: "listSurahs",
    title: {
      en: "List surahs",
      ar: "قائمة السور",
    },
    description: {
      en: "Returns the complete canonical 114-surah catalogue, with stable Arabic names and required makkia.",
      ar: "يعيد فهرس السور الـ114 كاملًا بأسماء عربية ثابتة وحقل makkia مطلوب.",
    },
    schema: "SurahListResponse",
    params: [],
    sdk: "client.surah.list()",
    errors: [503],
    notes: null,
  },
  {
    path: "/surah/{id}",
    slug: "surah/get",
    id: "getSurah",
    title: {
      en: "Get a surah",
      ar: "بيانات سورة",
    },
    description: {
      en: "Returns metadata for one surah.",
      ar: "يعيد بيانات سورة واحدة.",
    },
    schema: "SurahResponse",
    params: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 114,
        },
        example: 1,
        description: {
          en: "Surah number, 1 through 114.",
          ar: "رقم السورة من 1 إلى 114.",
        },
      },
    ],
    sdk: "client.surah.getById(1)",
    errors: [400, 404, 503],
    notes: null,
  },
  {
    path: "/surah/search",
    slug: "surah/search",
    id: "searchSurahs",
    title: {
      en: "Search surah names",
      ar: "البحث في أسماء السور",
    },
    description: {
      en: "Matches a normalized Arabic substring and returns an array. No matches returns 404.",
      ar: "يطابق جزءًا من الاسم بعد تطبيع العربية ويعيد مصفوفة. تعاد 404 عند غياب النتائج.",
    },
    schema: "SurahSearchResponse",
    params: [
      {
        name: "name",
        in: "query",
        required: true,
        schema: {
          type: "string",
          minLength: 1,
        },
        example: "الفاتحة",
        description: {
          en: "Arabic name or substring. Use Arabic input; Latin-only input is not a supported search.",
          ar: "الاسم العربي أو جزء منه. استخدم العربية؛ البحث بحروف لاتينية فقط غير مدعوم.",
        },
      },
    ],
    sdk: "client.surah.search('الفاتحة')",
    errors: [400, 404, 503],
    notes: null,
  },
  {
    path: "/ayat",
    slug: "ayat/all",
    id: "listAyat",
    title: {
      en: "Full Quran text",
      ar: "نص القرآن كاملًا",
    },
    description: {
      en: "Returns all available surahs and verses in data.surahs. This is a large response without pagination.",
      ar: "يعيد السور والآيات المتاحة داخل data.surahs. الاستجابة كبيرة ولا تدعم ترقيم الصفحات.",
    },
    schema: "AyatCorpusResponse",
    params: [],
    sdk: "client.ayat.list()",
    errors: [503],
    notes: null,
  },
  {
    path: "/ayat/{id}",
    slug: "ayat/get-by-number",
    id: "getAyaByNumber",
    title: {
      en: "Aya by global number",
      ar: "آية برقمها العام",
    },
    description: {
      en: "Looks up a verse by its global Quran number, rather than its position within a surah.",
      ar: "يبحث عن آية برقمها العام في القرآن، وليس ترتيبها داخل السورة.",
    },
    schema: "AyaLookupResponse",
    params: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 6236,
        },
        example: 1,
        description: {
          en: "Global verse number, 1 through 6236.",
          ar: "رقم الآية العام من 1 إلى 6236.",
        },
      },
    ],
    sdk: "client.ayat.getById(1)",
    errors: [400, 404, 503],
    notes: null,
  },
  {
    path: "/ayat/{surah}/aya/{id}",
    slug: "ayat/get-by-surah-aya",
    id: "getAyaBySurah",
    title: {
      en: "Aya within a surah",
      ar: "آية داخل سورة",
    },
    description: {
      en: "Returns one verse with its surah number and name.",
      ar: "يعيد آية واحدة مع رقم السورة واسمها.",
    },
    schema: "AyaLookupResponse",
    params: [
      {
        name: "surah",
        in: "path",
        required: true,
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 114,
        },
        example: 1,
        description: {
          en: "Surah number, 1 through 114.",
          ar: "رقم السورة من 1 إلى 114.",
        },
      },
      {
        name: "id",
        in: "path",
        required: true,
        schema: {
          type: "integer",
          minimum: 1,
        },
        example: 1,
        description: {
          en: "Positive verse number within the surah. A nonexistent verse returns 404.",
          ar: "رقم آية موجب داخل السورة. الآية غير الموجودة تعيد 404.",
        },
      },
    ],
    sdk: "client.ayat.getBySurah(1, 1)",
    errors: [400, 404, 503],
    notes: null,
  },
  {
    path: "/ayat/search",
    slug: "ayat/search",
    id: "searchAyat",
    title: {
      en: "Search Quran text",
      ar: "البحث في نص القرآن",
    },
    description: {
      en: "Returns {success, total, data: [...]}. total counts returned matches after limit. Each hit includes apiName.",
      ar: "يعيد {success, total, data: [...]}؛ total هو عدد النتائج المعادة بعد limit. كل نتيجة تحتوي apiName.",
    },
    schema: "AyaSearchResponse",
    params: [
      {
        name: "text",
        in: "query",
        required: true,
        schema: {
          type: "string",
          minLength: 1,
        },
        example: "الرحمن",
        description: {
          en: "Arabic substring, URL-encoded. Blank input returns 400.",
          ar: "جزء من نص عربي مع ترميز URL. الإدخال الفارغ يعيد 400.",
        },
      },
      {
        name: "limit",
        in: "query",
        required: false,
        schema: {
          type: "integer",
          default: 50,
          minimum: 1,
          maximum: 500,
        },
        example: 10,
        description: {
          en: "Maximum returned matches. Omitted uses 50; invalid values return 400.",
          ar: "الحد الأقصى للنتائج. القيمة الافتراضية 50؛ القيم غير الصالحة تعيد 400.",
        },
      },
    ],
    sdk: "client.ayat.search('الرحمن', { limit: 10 })",
    errors: [400, 404, 503],
    notes: null,
  },
  {
    path: "/reciters",
    slug: "reciters/list",
    id: "listReciters",
    title: {
      en: "List reciters",
      ar: "قائمة القراء",
    },
    description: {
      en: "Returns normalized reciters in data.reciters. Each reciter has moshaf recordings with surahList, rewayaId and type. The local snapshot preserves IDs and recordings on failover.",
      ar: "يعيد القراء داخل data.reciters. لكل قارئ مصاحف moshaf تحتوي surahList وrewayaId وtype. تحافظ النسخة المحلية على المعرّفات والمصاحف عند تعذر المصدر.",
    },
    schema: "ReciterCollectionResponse",
    params: [],
    sdk: "client.reciters.list()",
    errors: [503],
    notes: null,
  },
  {
    path: "/reciters/{id}",
    slug: "reciters/get",
    id: "getReciter",
    title: {
      en: "Get a reciter",
      ar: "بيانات قارئ",
    },
    description: {
      en: "Looks up a stable mp3quran reciter ID in the current catalogue or local snapshot.",
      ar: "يبحث بمعرّف قارئ ثابت من mp3quran في الفهرس الحالي أو النسخة المحلية.",
    },
    schema: "ReciterResponse",
    params: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: {
          type: "integer",
          minimum: 1,
        },
        example: 1,
        description: {
          en: "Stable mp3quran reciter ID, preserved in the local snapshot.",
          ar: "معرّف القارئ من mp3quran، محفوظ في النسخة المحلية.",
        },
      },
    ],
    sdk: "client.reciters.getById(1)",
    errors: [400, 404, 503],
    notes: null,
  },
  {
    path: "/reciters/search",
    slug: "reciters/search",
    id: "searchReciters",
    title: {
      en: "Search reciter names",
      ar: "البحث في أسماء القراء",
    },
    description: {
      en: "Returns matching reciters using Arabic substring matching. This is not fuzzy or English-language search.",
      ar: "يعيد القراء المطابقين لجزء من الاسم العربي. لا يدعم البحث التقريبي أو البحث الإنجليزي.",
    },
    schema: "ReciterSearchResponse",
    params: [
      {
        name: "name",
        in: "query",
        required: true,
        schema: {
          type: "string",
          minLength: 1,
        },
        example: "العفاسي",
        description: {
          en: "Arabic name or substring. Use Arabic input; Latin-only input is not a supported search.",
          ar: "الاسم العربي أو جزء منه. استخدم العربية؛ البحث بحروف لاتينية فقط غير مدعوم.",
        },
      },
    ],
    sdk: "client.reciters.search('العفاسي')",
    errors: [400, 404, 503],
    notes: null,
  },
  {
    path: "/reciters/{id}/surah/{surah}",
    slug: "reciters/audio",
    id: "getReciterAudio",
    title: {
      en: "Surah audio URL",
      ar: "رابط صوت السورة",
    },
    description: {
      en: "Selects a recording covering the surah, preferring Hafs murattal when moshaf is omitted. Verifies the audio with HEAD before returning a JSON URL and recording metadata.",
      ar: "يختار مصحفًا يغطي السورة، مع تفضيل حفص المرتل عند حذف moshaf. يفحص الصوت بطلب HEAD قبل إعادة رابط JSON وبيانات المصحف.",
    },
    schema: "ReciterAudioResponse",
    params: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: {
          type: "integer",
          minimum: 1,
        },
        example: 123,
        description: {
          en: "Stable mp3quran reciter ID, preserved in the local snapshot.",
          ar: "معرّف القارئ من mp3quran، محفوظ في النسخة المحلية.",
        },
      },
      {
        name: "surah",
        in: "path",
        required: true,
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 114,
        },
        example: 1,
        description: {
          en: "Surah number, 1 through 114.",
          ar: "رقم السورة من 1 إلى 114.",
        },
      },
      {
        name: "moshaf",
        in: "query",
        required: false,
        schema: {
          type: "integer",
          minimum: 1,
        },
        example: 7,
        description: {
          en: "Optional recording ID owned by this reciter.",
          ar: "معرّف مصحف اختياري تابع لهذا القارئ.",
        },
      },
    ],
    sdk: "client.reciters.getSurah(123, 1, { moshaf: 7 })",
    errors: [400, 404, 503],
    notes: {
      en: "moshaf is a recording ID from the reciter catalogue. Missing recording coverage returns 404; failure of all eligible audio providers returns 503. Quran.com fallback is restricted to verified matching Hafs murattal recordings.",
      ar: "moshaf هو معرّف مصحف من فهرس القارئ. عدم تغطية السورة يعيد 404؛ فشل مصادر الصوت المتاحة يعيد 503. يقتصر بديل Quran.com على مصاحف حفص المرتلة ذات المطابقة الموثقة.",
    },
  },
  {
    path: "/tafsir",
    slug: "tafsir/editions",
    id: "listTafsirEditions",
    title: {
      en: "Tafsir editions",
      ar: "نسخ التفسير",
    },
    description: {
      en: "Lists the two supported public edition IDs: muyassar and saadi. The local catalogue does not test provider availability.",
      ar: "يعرض معرّفي التفسير المدعومين: muyassar وsaadi. الفهرس محلي ولا يفحص توفر المصادر.",
    },
    schema: "TafsirEditionListResponse",
    params: [],
    sdk: "client.tafsir.listEditions()",
    errors: [],
    notes: null,
  },
  {
    path: "/tafsir/{edition}/{surah}",
    slug: "tafsir/surah",
    id: "getSurahTafsir",
    title: {
      en: "Tafsir for a surah",
      ar: "تفسير سورة",
    },
    description: {
      en: "Returns a TafsirItem array, even with the optional aya filter. edition is the public ID muyassar or saadi across all sources.",
      ar: "يعيد مصفوفة TafsirItem حتى مع مرشح aya الاختياري. حقل edition هو المعرّف العام muyassar أوsaadi في جميع المصادر.",
    },
    schema: "TafsirListResponse",
    params: [
      {
        name: "edition",
        in: "path",
        required: true,
        schema: {
          type: "string",
          enum: ["muyassar", "saadi"],
        },
        example: "muyassar",
        description: {
          en: "Public edition ID from GET /tafsir. Use muyassar, not ar.muyassar.",
          ar: "معرّف النسخة من GET /tafsir. استخدم muyassar وليس ar.muyassar.",
        },
      },
      {
        name: "surah",
        in: "path",
        required: true,
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 114,
        },
        example: 1,
        description: {
          en: "Surah number, 1 through 114.",
          ar: "رقم السورة من 1 إلى 114.",
        },
      },
      {
        name: "aya",
        in: "query",
        required: false,
        schema: {
          type: "integer",
          minimum: 1,
        },
        example: 1,
        description: {
          en: "Positive verse number within the surah. A nonexistent verse returns 404.",
          ar: "رقم آية موجب داخل السورة. الآية غير الموجودة تعيد 404.",
        },
      },
    ],
    sdk: "client.tafsir.forSurah('muyassar', 1)",
    errors: [400, 404, 503],
    notes: null,
  },
  {
    path: "/tafsir/{edition}/{surah}/{aya}",
    slug: "tafsir/aya",
    id: "getAyaTafsir",
    title: {
      en: "Tafsir for an aya",
      ar: "تفسير آية",
    },
    description: {
      en: "Returns one tafsir item. Only muyassar and saadi are supported; unavailable editions return 400 before any provider request.",
      ar: "يعيد عنصر تفسير واحدًا. يدعم muyassar وsaadi فقط؛ النسخ غير المدعومة تعيد 400 قبل طلب المصدر.",
    },
    schema: "TafsirItemResponse",
    params: [
      {
        name: "edition",
        in: "path",
        required: true,
        schema: {
          type: "string",
          enum: ["muyassar", "saadi"],
        },
        example: "muyassar",
        description: {
          en: "Public edition ID from GET /tafsir. Use muyassar, not ar.muyassar.",
          ar: "معرّف النسخة من GET /tafsir. استخدم muyassar وليس ar.muyassar.",
        },
      },
      {
        name: "surah",
        in: "path",
        required: true,
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 114,
        },
        example: 1,
        description: {
          en: "Surah number, 1 through 114.",
          ar: "رقم السورة من 1 إلى 114.",
        },
      },
      {
        name: "aya",
        in: "path",
        required: true,
        schema: {
          type: "integer",
          minimum: 1,
        },
        example: 1,
        description: {
          en: "Positive verse number within the surah. A nonexistent verse returns 404.",
          ar: "رقم آية موجب داخل السورة. الآية غير الموجودة تعيد 404.",
        },
      },
    ],
    sdk: "client.tafsir.forAya('muyassar', 1, 1)",
    errors: [400, 404, 503],
    notes: null,
  },
  {
    path: "/azkar",
    slug: "azkar/categories",
    id: "listAzkarCategories",
    title: {
      en: "Azkar categories",
      ar: "تصنيفات الأذكار",
    },
    description: {
      en: "Lists category names, item counts and sources in data.categories.",
      ar: "يعرض أسماء التصنيفات وأعداد الأذكار ومصادرها داخل data.categories.",
    },
    schema: "AzkarCategorySummaryResponse",
    params: [],
    sdk: "client.azkar.listCategories()",
    errors: [503],
    notes: null,
  },
  {
    path: "/azkar/{category}",
    slug: "azkar/category",
    id: "getAzkarCategory",
    title: {
      en: "Azkar in a category",
      ar: "أذكار تصنيف",
    },
    description: {
      en: "Returns the first category whose normalized Arabic name contains the supplied value. Use the full name from the catalogue to avoid ambiguous matches.",
      ar: "يعيد أول تصنيف يحتوي اسمه العربي المطبع على القيمة المدخلة. استخدم الاسم الكامل من الفهرس لتجنب التطابق الغامض.",
    },
    schema: "AzkarCategoryResponse",
    params: [
      {
        name: "category",
        in: "path",
        required: true,
        schema: {
          type: "string",
          minLength: 1,
        },
        example: "أذكار الصباح",
        description: {
          en: "Arabic category name, URL-encoded as one path segment.",
          ar: "اسم التصنيف العربي، مرمّز كمقطع واحد من المسار.",
        },
      },
    ],
    sdk: "client.azkar.getByCategory('أذكار الصباح')",
    errors: [400, 404, 503],
    notes: null,
  },
  {
    path: "/azkar/search",
    slug: "azkar/search",
    id: "searchAzkar",
    title: {
      en: "Search azkar text",
      ar: "البحث في الأذكار",
    },
    description: {
      en: "Returns {success, total, data: [...]}; each hit includes category, item and apiName. No matches returns 404.",
      ar: "يعيد {success, total, data: [...]}؛ كل نتيجة تحتوي category وitem وapiName. عدم وجود نتائج يعيد 404.",
    },
    schema: "AzkarSearchResponse",
    params: [
      {
        name: "text",
        in: "query",
        required: true,
        schema: {
          type: "string",
          minLength: 1,
        },
        example: "الله",
        description: {
          en: "Arabic substring, URL-encoded. Blank input returns 400.",
          ar: "جزء من نص عربي مع ترميز URL. الإدخال الفارغ يعيد 400.",
        },
      },
      {
        name: "limit",
        in: "query",
        required: false,
        schema: {
          type: "integer",
          default: 50,
          minimum: 1,
          maximum: 200,
        },
        example: 10,
        description: {
          en: "Maximum returned matches. Omitted uses 50; invalid values return 400.",
          ar: "الحد الأقصى للنتائج. القيمة الافتراضية 50؛ القيم غير الصالحة تعيد 400.",
        },
      },
    ],
    sdk: "client.azkar.search('الله', { limit: 10 })",
    errors: [400, 404, 503],
    notes: null,
  },
  {
    path: "/azkar/random",
    slug: "azkar/random",
    id: "getRandomZekr",
    title: {
      en: "Random zekr",
      ar: "ذكر عشوائي",
    },
    description: {
      en: "Chooses one item from all cached categories. Random selection happens per request.",
      ar: "يختار ذكرًا من جميع التصنيفات المخزّنة. يتم الاختيار العشوائي عند كل طلب.",
    },
    schema: "AzkarPickResponse",
    params: [],
    sdk: "client.azkar.random()",
    errors: [404, 503],
    notes: null,
  },
  {
    path: "/hadith",
    slug: "hadith/books",
    id: "listHadithBooks",
    title: {
      en: "Hadith books",
      ar: "كتب الحديث",
    },
    description: {
      en: "Lists nine supported books from verified local metadata. available counts actual stored narrations, not the maximum hadith number.",
      ar: "يعرض الكتب التسعة المدعومة من بيانات محلية موثقة. يحسب available الأحاديث المخزنة فعليًا، ولا يمثل أكبر رقم حديث.",
    },
    schema: "HadithBookListResponse",
    params: [],
    sdk: "client.hadith.listBooks()",
    errors: [503],
    notes: null,
  },
  {
    path: "/hadith/{book}",
    slug: "hadith/book",
    id: "getHadithBook",
    title: {
      en: "Hadith range",
      ar: "نطاق أحاديث",
    },
    description: {
      en: "Returns book, available and hadiths inside data. Inclusive range defaults to from=1 and to=from+29; at most 300 requested numbers are accepted.",
      ar: "يعيد book وavailable وhadiths داخل data. النطاق شامل طرفيه؛ from الافتراضي 1 وto الافتراضي from+29. يقبل 300 رقم حديث كحد أقصى.",
    },
    schema: "HadithListResponse",
    params: [
      {
        name: "book",
        in: "path",
        required: true,
        schema: {
          type: "string",
          minLength: 1,
        },
        example: "bukhari",
        description: {
          en: "Book ID from GET /hadith. Unknown IDs return 404.",
          ar: "معرّف الكتاب من GET /hadith. المعرّف المجهول يعيد 404.",
        },
      },
      {
        name: "from",
        in: "query",
        required: false,
        schema: {
          type: "integer",
          minimum: 1,
          default: 1,
        },
        example: 1,
        description: {
          en: "First hadith number, inclusive.",
          ar: "رقم أول حديث، وهو مشمول.",
        },
      },
      {
        name: "to",
        in: "query",
        required: false,
        schema: {
          type: "integer",
          minimum: 1,
        },
        example: 30,
        description: {
          en: "Last hadith number, inclusive. Use at most 300 items: to = from + 299.",
          ar: "رقم آخر حديث، وهو مشمول. استخدم 300 حديث كحد أقصى: to = from + 299.",
        },
      },
    ],
    sdk: "client.hadith.getBook('bukhari', { from: 1, to: 30 })",
    errors: [400, 404, 503],
    notes: {
      en: "Numbering may contain gaps. A range can return fewer narrations or an empty array. available is the count of stored narrations, so it is not a bound for lookup numbers. Unknown books return 404.",
      ar: "قد تحتوي الأرقام على فجوات. قد يعيد النطاق أحاديث أقل أو مصفوفة فارغة. available هو عدد الأحاديث المخزنة، فلا تستخدمه حدًا أعلى لأرقام البحث. الكتب المجهولة تعيد 404.",
    },
  },
  {
    path: "/hadith/{book}/{number}",
    slug: "hadith/get",
    id: "getHadith",
    title: {
      en: "Get a hadith",
      ar: "حديث برقم",
    },
    description: {
      en: "Returns a narration by its book-local number. The response has no grading or chain-of-transmission fields.",
      ar: "يعيد الحديث برقم داخل الكتاب. الاستجابة لا تحتوي حقول الحكم على الحديث أو الإسناد.",
    },
    schema: "HadithResponse",
    params: [
      {
        name: "book",
        in: "path",
        required: true,
        schema: {
          type: "string",
          minLength: 1,
        },
        example: "bukhari",
        description: {
          en: "Book ID from GET /hadith. Unknown IDs return 404.",
          ar: "معرّف الكتاب من GET /hadith. المعرّف المجهول يعيد 404.",
        },
      },
      {
        name: "number",
        in: "path",
        required: true,
        schema: {
          type: "integer",
          minimum: 1,
        },
        example: 1,
        description: {
          en: "Positive hadith number within the book.",
          ar: "رقم حديث موجب داخل الكتاب.",
        },
      },
    ],
    sdk: "client.hadith.getByNumber('bukhari', 1)",
    errors: [400, 404, 503],
    notes: null,
  },
  {
    path: "/hadith/random",
    slug: "hadith/random",
    id: "getRandomHadith",
    title: {
      en: "Random hadith",
      ar: "حديث عشوائي",
    },
    description: {
      en: "Samples an actual stored narration from a selected book, so numbering gaps cannot produce an empty random result. Optionally restrict by book ID.",
      ar: "يختار حديثًا مخزنًا فعليًا من الكتاب المختار، فلا تؤدي فجوات الترقيم إلى نتيجة عشوائية فارغة. يمكن تقييد الاختيار بمعرّف كتاب.",
    },
    schema: "RandomHadithResponse",
    params: [
      {
        name: "book",
        in: "query",
        required: false,
        schema: {
          type: "string",
        },
        example: "bukhari",
        description: {
          en: "Book ID from GET /hadith. Unknown IDs return 404.",
          ar: "معرّف الكتاب من GET /hadith. المعرّف المجهول يعيد 404.",
        },
      },
    ],
    sdk: "client.hadith.random({ book: 'bukhari' })",
    errors: [404, 503],
    notes: null,
  },
  {
    path: "/prayer/times",
    slug: "prayer/times",
    id: "getPrayerTimes",
    title: {
      en: "Prayer times",
      ar: "مواقيت الصلاة",
    },
    description: {
      en: "Provide latitude+longitude or city+country. Coordinates take precedence when both are supplied. Uses method 4 and timezone UTC by default and returns seven HH:mm timings.",
      ar: "أرسل latitude وlongitude أوcity وcountry. الإحداثيات لها الأولوية عند إرسال الاثنين. طريقة الحساب الافتراضية 4 والمنطقة الزمنية UTC، وتعيد سبعة أوقات بصيغة HH:mm.",
    },
    schema: "PrayerTimesResponse",
    params: [
      {
        name: "date",
        in: "query",
        required: false,
        schema: {
          type: "string",
          pattern: "^\\d{2}-\\d{2}-\\d{4}$",
        },
        example: "01-01-2026",
        description: {
          en: "Date in DD-MM-YYYY. Must be a real Gregorian date with year at least 1000. Omitted or blank uses the API server date.",
          ar: "تاريخ بصيغة DD-MM-YYYY. يجب أن يكون تاريخًا ميلاديًا صحيحًا بسنة لا تقل عن 1000. عند حذفه أو تركه فارغًا يستخدم تاريخ خادم API.",
        },
      },
      {
        name: "latitude",
        in: "query",
        required: false,
        schema: {
          type: "number",
          minimum: -90,
          maximum: 90,
        },
        example: 21.4225,
        description: {
          en: "Latitude in decimal degrees; provide it together with longitude.",
          ar: "خط العرض بالدرجات العشرية؛ أرسله مع خط الطول.",
        },
      },
      {
        name: "longitude",
        in: "query",
        required: false,
        schema: {
          type: "number",
          minimum: -180,
          maximum: 180,
        },
        example: 39.8262,
        description: {
          en: "Longitude in decimal degrees; provide it together with latitude.",
          ar: "خط الطول بالدرجات العشرية؛ أرسله مع خط العرض.",
        },
      },
      {
        name: "city",
        in: "query",
        required: false,
        schema: {
          type: "string",
        },
        example: "Mecca",
        description: {
          en: "Required with country when coordinates are not supplied.",
          ar: "مطلوب مع country عند عدم إرسال الإحداثيات.",
        },
      },
      {
        name: "country",
        in: "query",
        required: false,
        schema: {
          type: "string",
        },
        example: "SA",
        description: {
          en: "Country for city lookup. Send together with city.",
          ar: "الدولة للبحث عن المدينة. أرسلها مع city.",
        },
      },
      {
        name: "method",
        in: "query",
        required: false,
        schema: {
          type: "integer",
          enum: [1, 2, 3, 4, 5, 9, 10, 11],
          default: 4,
        },
        example: 4,
        description: {
          en: "Supported calculation method. Default 4 is Umm al-Qura.",
          ar: "طريقة الحساب المدعومة. القيمة الافتراضية 4 هي أم القرى.",
        },
      },
      {
        name: "timezone",
        in: "query",
        required: false,
        schema: {
          type: "string",
          default: "UTC",
        },
        example: "Asia/Riyadh",
        description: {
          en: "IANA timezone for HH:mm output.",
          ar: "منطقة زمنية من IANA لتنسيق الأوقات بصيغة HH:mm.",
        },
      },
    ],
    sdk: "client.prayer.getTimes({ latitude: 21.4225, longitude: 39.8262, method: 4, timezone: 'Asia/Riyadh' })",
    errors: [400, 503],
    notes: {
      en: "Supported methods: 1, 2, 3, 4, 5, 9, 10, 11. The local adhan fallback requires coordinates and preserves the date, method and timezone. City-only requests have no local geocoder; unavailable providers return 503. hijri may be absent in local results.",
      ar: "طرق الحساب المدعومة: 1 و2 و3 و4 و5 و9 و10 و11. يتطلب بديل adhan المحلي إحداثيات ويحافظ على التاريخ والطريقة والمنطقة الزمنية. لا يوجد تحويل محلي لأسماء المدن إلى إحداثيات؛ تعذر المصدر يعيد 503. قد يغيب hijri في النتيجة المحلية.",
    },
  },
  {
    path: "/hijri/today",
    slug: "hijri/today",
    id: "getToday",
    title: {
      en: "Today in both calendars",
      ar: "تاريخ اليوم بالتقويمين",
    },
    description: {
      en: "Converts the API server date using the fixed islamic-umalqura calendar. It does not use the browser timezone.",
      ar: "يحوّل تاريخ خادم API بتقويم islamic-umalqura الثابت. لا يستخدم منطقة المتصفح الزمنية.",
    },
    schema: "HijriResponse",
    params: [],
    sdk: "client.hijri.today()",
    errors: [503],
    notes: null,
  },
  {
    path: "/hijri/from-gregorian",
    slug: "hijri/from-gregorian",
    id: "fromGregorian",
    title: {
      en: "Gregorian to Hijri",
      ar: "من الميلادي إلى الهجري",
    },
    description: {
      en: "Returns both calendars and calendar=islamic-umalqura. Aladhan UAQ is validated against the local Intl conversion; local conversion is the fallback.",
      ar: "يعيد التقويمين وحقل calendar=islamic-umalqura. تُطابق نتيجة Aladhan UAQ مع تحويل Intl المحلي، الذي يُستخدم أيضًا مصدرًا بديلًا.",
    },
    schema: "HijriResponse",
    params: [
      {
        name: "date",
        in: "query",
        required: false,
        schema: {
          type: "string",
          pattern: "^\\d{2}-\\d{2}-\\d{4}$",
        },
        example: "01-01-2026",
        description: {
          en: "Date in DD-MM-YYYY. Must be a real Gregorian date with year at least 1000. Omitted or blank uses the API server date.",
          ar: "تاريخ بصيغة DD-MM-YYYY. يجب أن يكون تاريخًا ميلاديًا صحيحًا بسنة لا تقل عن 1000. عند حذفه أو تركه فارغًا يستخدم تاريخ خادم API.",
        },
      },
    ],
    sdk: "client.hijri.fromGregorian('01-01-2026')",
    errors: [400, 503],
    notes: null,
  },
  {
    path: "/hijri/to-gregorian",
    slug: "hijri/to-gregorian",
    id: "toGregorian",
    title: {
      en: "Hijri to Gregorian",
      ar: "من الهجري إلى الميلادي",
    },
    description: {
      en: "Converts a required Hijri date using islamic-umalqura. Validates day 1..30, month 1..12 and year 1..2400 before fetching.",
      ar: "يحوّل تاريخًا هجريًا مطلوبًا بتقويم islamic-umalqura. يتحقق من اليوم 1..30 والشهر 1..12 والسنة 1..2400 قبل طلب المصدر.",
    },
    schema: "HijriResponse",
    params: [
      {
        name: "date",
        in: "query",
        required: true,
        schema: {
          type: "string",
          pattern: "^\\d{2}-\\d{2}-\\d{4}$",
        },
        example: "01-09-1447",
        description: {
          en: "Date in DD-MM-YYYY. Hijri day 1..30, month 1..12, year 1..2400.",
          ar: "تاريخ بصيغة DD-MM-YYYY. اليوم الهجري 1..30 والشهر 1..12 والسنة 1..2400.",
        },
      },
    ],
    sdk: "client.hijri.toGregorian('01-09-1447')",
    errors: [400, 503],
    notes: null,
  },
  {
    path: "/qibla",
    slug: "qibla/direction",
    id: "getQibla",
    title: {
      en: "Qibla direction",
      ar: "اتجاه القبلة",
    },
    description: {
      en: "Returns degrees clockwise from true north. Tries Aladhan, then calculates the great-circle bearing locally.",
      ar: "يعيد الزاوية بالدرجات باتجاه عقارب الساعة من الشمال الحقيقي. يجرّب Aladhan ثم يحسب الاتجاه محليًا على الدائرة العظمى.",
    },
    schema: "QiblaResponse",
    params: [
      {
        name: "latitude",
        in: "query",
        required: true,
        schema: {
          type: "number",
          minimum: -90,
          maximum: 90,
        },
        example: 21.4225,
        description: {
          en: "Latitude in decimal degrees; provide it together with longitude.",
          ar: "خط العرض بالدرجات العشرية؛ أرسله مع خط الطول.",
        },
      },
      {
        name: "longitude",
        in: "query",
        required: true,
        schema: {
          type: "number",
          minimum: -180,
          maximum: 180,
        },
        example: 39.8262,
        description: {
          en: "Longitude in decimal degrees; provide it together with latitude.",
          ar: "خط الطول بالدرجات العشرية؛ أرسله مع خط العرض.",
        },
      },
    ],
    sdk: "client.qibla.getDirection(21.4225, 39.8262)",
    errors: [400, 503],
    notes: {
      en: "This is a geographic bearing, not a device compass reading. Magnetic declination and device orientation are outside this endpoint.",
      ar: "هذه زاوية جغرافية وليست قراءة بوصلة الجهاز. الانحراف المغناطيسي واتجاه الجهاز خارج وظيفة هذا المسار.",
    },
  },
];
