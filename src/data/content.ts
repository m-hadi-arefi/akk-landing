import {
  NavItem,
  ValueChainStep,
  IndustrialFacility,
  BrandInfo,
  CoreValue,
  ContactInfo,
  FactoryGalleryItem,
  ProductShowcaseItem,
} from "../types";

export const content = {
  fa: {
    meta: {
      title: "آریان خودرو خاورمیانه | زنجیره یکپارچه تأمین و تولید قطعات خودرو",
      description:
        "آریان خودرو خاورمیانه (AKK)؛ از تأمین و تولید تا توزیع؛ بیش از چهار دهه سابقه در قطعات پلیمری خودرو، رنگ‌آمیزی مکانیزه، گرانول‌سازی و پخش کشوری.",
    },
    brandMark: "آریان خودرو خاورمیانه",
    brandShort: "آریان خودرو خاورمیانه",
    acronym: "AKK",
    logoSrc: "/assets/official/logo-arian.png",
    nav: [
      { id: "about", label: "درباره ما" },
      { id: "factory-tour", label: "تصاویر کارخانه" },
      { id: "value-chain", label: "زنجیره ارزش" },
      { id: "products", label: "محصولات تولیدی" },
      { id: "brands", label: "برندها" },
      { id: "contact", label: "ارتباط با ما" },
    ] as NavItem[],
    hero: {
      tag: "مجموعه صنعتی و زنجیره‌ای قطعات خودرو",
      title: "آریان خودرو خاورمیانه",
      subtitle:
        "از تأمین و تولید تا توزیع؛ یک زنجیره یکپارچه در صنعت قطعات خودرو",
      description:
        "با سابقه فعالیت رسمی از سال ۱۳۶۴؛ پیوند پیوسته مهندسی پلیمر، بازرگانی بین‌المللی، فرآیندهای مدرن تولید، کنترل کیفیت آزمایشگاهی و شبکه گسترده توزیع کشوری در استان کرمان و سراسر ایران.",
      ctaPrimary: "آشنایی با آریان خودرو خاورمیانه",
      ctaSecondary: "بازدید از کارخانه",
      ctaContact: "ارتباط با ما",
      stats: [
        { value: "۱۳۶۴", label: "آغاز فعالیت صنعتی" },
        { value: "۶", label: "واحد عملیاتی" },
        { value: "۱۳,۰۰۰", label: "مترمربع واحد تولید" },
        { value: "۲۴,۰۰۰", label: "مترمربع واحد انبار" },
      ],
      heroImage: "/assets/official/banner-hero.jpg",
      factoryBanner: "/assets/official/banner-arian.jpg",
    },
    about: {
      kicker: "اصالت و توسعه مستمر",
      title: "بیش از چهار دهه در زنجیره قطعات خودرو",
      yearBadge: "۱۳۶۴",
      yearLabel: "شروع مسیر از سال ۱۳۶۴",
      paragraphs: [
        "آریان خودرو خاورمیانه مسیری پرفرازونشیب را از سال ۱۳۶۴ با تمرکز بر بازرگانی، تأمین و توزیع قطعات یدکی خودرو آغاز نمود. با درک عمیق از نیازمندی‌های صنعت خودرو و ضرورت خودکفایی، مجموعه با نگاهی راهبردی به سمت توسعه ظرفیت‌های صنعتی و تکمیل گام‌به‌گام زنجیره ارزش گام برداشت.",
        "امروز این مجموعه با راه‌اندازی خطوط پیشرفته تولید قطعات پلیمری و پلاستیکی در واحد تولید ۱۳,۰۰۰ مترمربعی، واحد گرانول‌سازی ۱,۵۰۰ مترمربعی، واحد مونتاژ ۲,۶۲۰ مترمربعی، ۴ خط رنگ‌آمیزی مکانیزه به مجموع طول ۴۰۰ متر، واحد انبار ۲۴,۰۰۰ مترمربعی، واحد اداری ۷۳۰ مترمربعی و واحد پرند ۱,۴۰۰ مترمربعی در دو طبقه، به یک ساختار صنعتی یکپارچه مبدل شده است که تمامی مراحل را تحت مدیریت کیفی خود دارد.",
      ],
      milestones: [
        {
          year: "۱۳۶۴",
          title: "تأسیس و آغاز فعالیت بازرگانی",
          desc: "شروع به کار در حوزه تأمین، خرید و توزیع قطعات یدکی خودرو در کشور.",
        },
        {
          year: "۱۳۹۰",
          title: "ثبت رسمی شرکت سهامی خاص",
          desc: "تثبیت ساختار حقوقی با نام تجاری آریان خودرو خاورمیانه (AKK) و آغاز توسعه زیرساخت‌ها.",
        },
        {
          year: "۱۳۹۳",
          title: "ورود به تولید پلیمری و گرانول‌سازی",
          desc: "راه‌اندازی سایت تولید ۱۳,۰۰۰ متری در شهرک صنعتی و خطوط تزریق پلاستیک قطعات بدنه.",
        },
        {
          year: "۱۴۰۰+",
          title: "تکمیل زنجیره ارزش و واحدهای عملیاتی",
          desc: "تجهیز ۴ خط رنگ‌آمیزی مکانیزه (مجموع ۴۰۰ متر)، سالن مونتاژ ۲,۶۲۰ متری، انبار ۲۴,۰۰۰ متری و کنترل کیفیت پیشرفته.",
        },
      ],
    },
    gallery: {
      kicker: "مستندات تصویری کارخانه و بازرگانی",
      title:
        "نگاهی به خطوط تولید، واردات و سالن‌های صنعتی آریان خودرو خاورمیانه",
      subtitle:
        "تصاویر مستند از خطوط تزریق سنگین، سالن‌های رنگ‌آمیزی مکانیزه، تأمین و واردات قطعات، واحد گرانول‌سازی و مونتاژ در شهرک صنعتی شماره ۲ کرمان",
      items: [
        {
          id: "prod-hall",
          title: "سالن اصلی تولید و تزریق قطعات پلیمری",
          subtitle: "واحد تولید به وسعت ۱۳,۰۰۰ مترمربع",
          category: "خطوط تولید",
          imageSrc: "/assets/official/factory-production.jpg",
          description:
            "دستگاه‌های تزریق پلاستیک تناژ بالا جهت تولید قطعات بزرگ و حساس خودرو از جمله انواع سپر و جلوپنجره.",
          badge: "واحد ۱۳,۰۰۰ مترمربع",
        },
        {
          id: "paint-lines",
          title: "خطوط رنگ‌آمیزی مکانیزه استاندارد",
          subtitle: "۴ خط رنگ با مجموع طول ۴۰۰ متر؛ واحد مونتاژ ۲,۶۲۰ مترمربع",
          category: "واحد رنگ‌آمیزی",
          imageSrc: "/assets/official/factory-paint-line.jpg",
          description:
            "دارای ۴ خط رنگ استاندارد صنعتی با مجموع طول ۴۰۰ متر برای رنگ‌آمیزی مکانیزه و یکنواخت قطعات.",
          badge: "۴ خط رنگ · ۴۰۰ متر",
        },
        {
          id: "import-logistics",
          title: "تأمین، بازرگانی و واردات قطعات خودرو",
          subtitle: "مرکز تدارکات بین‌المللی، انبارش و ترخیص تخصصی",
          category: "واردات و بازرگانی",
          imageSrc: "/assets/official/banner-arian.jpg",
          description:
            "تأمین و واردات مستقیم قطعات خودرویی استاندارد، قالب‌های صنعتی و مواد اولیه پلیمری با اتکا به ۴ دهه سابقه بازرگانی بین‌المللی و مدیریت تخصصی اسناد و ترخیص.",
          badge: "واردات و بازرگانی بین‌المللی",
        },
        {
          id: "granulation-unit",
          title: "واحد تخصصی گرانول‌سازی مواد اولیه",
          subtitle: "آماده‌سازی و کنترل کیفی مواد در مساحت ۱,۵۰۰ مترمربع",
          category: "واحد مواد اولیه",
          imageSrc: "/assets/official/factory-granulation.jpg",
          description:
            "تجهیزات و ماشین‌آلات پیشرفته فرآوری و ارتقای خواص فیزیکی و مکانیکی گرانول‌های پلیمری.",
          badge: "واحد ۱,۵۰۰ مترمربع",
        },
        {
          id: "assembly-hall",
          title: "ایستگاه‌های مونتاژ و مجموعه‌سازی",
          subtitle: "واحد مونتاژ به مساحت ۲,۶۲۰ مترمربع",
          category: "مونتاژ و پکینگ",
          imageSrc: "/assets/official/factory-assembly.jpg",
          description:
            "ایستگاه‌های بازرسی کیفی، مونتاژ متعلقات سپر، خارهای اتصالی و بسته‌بندی حفاظتی جهت ارسال.",
          badge: "واحد ۲,۶۲۰ مترمربع",
        },
        {
          id: "machinery",
          title: "ماشین‌آلات قالب‌گیری و تزریق صنعتی",
          subtitle: "فناوری و امکانات مهندسی دقیق",
          category: "ماشین‌آلات و تجهیزات",
          imageSrc: "/assets/official/factory-machinery.jpg",
          description:
            "قالب‌های صنعتی استاندارد خودروسازی با ضریب دقت بالا و سیستم‌های کنترل هیدرولیک مدرن.",
          badge: "تجهیزات مدرن تزریق",
        },
      ] as FactoryGalleryItem[],
    },
    valueChain: {
      kicker: "زنجیره ارزش، سایت‌ها و حوزه‌های فعالیت",
      title: "زنجیره یکپارچه ارزش در آریان خودرو خاورمیانه",
      subtitle:
        "۹ حلقه ارزش در ۶ واحد عملیاتی؛ از تأمین و واردات تا تولید، رنگ، بسته‌بندی و توزیع سراسری با کیفیت یکنواخت و تحویل به‌موقع",
      steps: [
        {
          id: "raw-materials",
          order: 1,
          title: "مواد اولیه",
          shortDesc: "تدارک و پالایش پلیمرها و کامپاندهای مهندسی",
          fullDesc:
            "مدیریت و مهندسی مواد اولیه پلیمری مناسب برای تولید قطعات مقاوم خودرویی (از جمله پلی‌پروپیلن، ABS و آلیاژهای پلیمری ضدضربه).",
          keyOutputs: [
            "فرمولاسیون ترکیبات مقاوم",
            "انطباق فیزیکی و حرارتی مواد",
            "ذخیره‌سازی بهینه مواد در شرایط کنترل‌شده",
          ],
          tags: ["گرانول‌سازی", "پلیمر مهندسی", "واحد ۱,۵۰۰ متری"],
          iconName: "Layers",
          siteId: "site-granulation",
        },
        {
          id: "manufacturing",
          order: 2,
          title: "تولید و آماده‌سازی",
          shortDesc: "تزریق پلاستیک، فرم‌دهی و پردازش قطعات پلیمری",
          fullDesc:
            "به‌کارگیری ماشین‌آلات مدرن قالب‌گیری تزریقی و خطوط تولید پیشرفته برای ساخت قطعات پلیمری و بدنه با دقت ابعادی بالا.",
          keyOutputs: [
            "تولید قطعات بدنه و تزئینی",
            "دقت بالا در قالب‌گیری",
            "کاهش ضایعات صنعتی",
          ],
          tags: ["تزریق پلاستیک", "سپر، جلوپنجره، قالپاق", "قالب‌سازی دقیق"],
          iconName: "Cpu",
          siteId: "site-production",
        },
        {
          id: "quality-control",
          order: 3,
          title: "کنترل کیفیت",
          shortDesc: "پایش و آزمون‌های سخت‌گیرانه در هر ایستگاه عملیاتی",
          fullDesc:
            "تست‌های مکانیکی، متالورژی و شیمیایی، سنجش دوام، مقاومت در برابر ضربه و UV و انطباق دقیق قطعات با استانداردهای رسمی.",
          keyOutputs: [
            "بررسی ابعادی و آزمون استحکام",
            "تست چسبندگی رنگ و مقاومت محیطی",
            "تأییدیه صفر نقص در خطوط",
          ],
          tags: ["آزمون ضربه", "انطباق ابعادی", "کنترل ایستگاهی"],
          iconName: "ShieldCheck",
          siteId: "site-production",
        },
        {
          id: "paint-assembly",
          order: 4,
          title: "رنگ و مونتاژ",
          shortDesc: "رنگ‌آمیزی مکانیزه و مونتاژ دقیق مجموعه‌ها",
          fullDesc:
            "سالن رنگ مجهز به ۴ خط پوشش‌دهی با مجموع طول ۴۰۰ متر و کدهای رنگ اصلی خودروسازان، به‌همراه ایستگاه‌های مونتاژ مجموعه‌های ترکیبی در واحد ۲,۶۲۰ مترمربعی.",
          keyOutputs: [
            "۴ خط رنگ صنعتی · مجموع ۴۰۰ متر",
            "پوشش نهایی شفاف و بادوام",
            "مجموعه‌سازی قطعات چندجزئی",
          ],
          tags: ["رنگ‌آمیزی مکانیزه", "مونتاژ مکانیکی", "تطبیق فام رنگ"],
          iconName: "Palette",
          siteId: "site-paint-pack",
        },
        {
          id: "packaging",
          order: 5,
          title: "بسته‌بندی",
          shortDesc: "بسته‌بندی ایمن، بارکدگذاری و حفاظت در ترابری",
          fullDesc:
            "طراحی جعبه‌ها و بسته‌بندی‌های مقاوم برای محافظت از سطح قطعات در برابر ضربه، سایش و عوامل محیطی به همراه هولوگرام اصالت.",
          keyOutputs: [
            "حفاظت فیزیکی در جابجایی",
            "ردیابی کالا با بارکدهای یکتا",
            "بسته‌بندی اختصاصی برندهای آریان خودرو خاورمیانه و میبا",
          ],
          tags: ["ایمنی حمل", "هولوگرام اصالت", "کد رهگیری فنی"],
          iconName: "PackageCheck",
          siteId: "site-paint-pack",
        },
        {
          id: "warehousing",
          order: 6,
          title: "انبار",
          shortDesc: "انبارش مکانیزه در واحد ۲۴,۰۰۰ مترمربعی",
          fullDesc:
            "سیستم منظم طبقه‌بندی و کدگذاری قطعات در انبار بزرگ مرکزی، کنترل شرایط نگهداری برای حفظ کامل کیفیت محصولات.",
          keyOutputs: [
            "کنترل موجودی هوشمند",
            "واحد ۲۴,۰۰۰ متری انبارش",
            "سرعت بالای پردازش سفارش‌ها",
          ],
          tags: ["انبار ۲۴,۰۰۰ متری", "کدینگ مکانیزه", "کنترل موجودی"],
          iconName: "Warehouse",
          siteId: "site-commercial-logistics",
        },
        {
          id: "sourcing",
          order: 7,
          title: "تأمین",
          shortDesc: "شناسایی و انتخاب منابع معتبر مواد و قطعات استاندارد",
          fullDesc:
            "ارزیابی مداوم تأمین‌کنندگان معتبر جهانی و داخلی بر مبنای استانداردهای صنعتی خودروسازی، با هدف ایجاد جریان پایدار مواد اولیه باکیفیت و ملزومات تولید.",
          keyOutputs: [
            "شناسایی تأمین‌کنندگان تراز اول",
            "اعتبارسنجی کیفی زنجیره ورودی",
            "قراردادهای پایداری تأمین",
          ],
          tags: ["تأمین پایدار", "روابط بازرگانی", "سورسینگ تخصصی"],
          iconName: "Network",
          siteId: "site-commercial-logistics",
        },
        {
          id: "procurement",
          order: 8,
          title: "واردات و خرید",
          shortDesc: "عملیات بازرگانی داخلی و بین‌المللی با اتکا به دانش تجاری",
          fullDesc:
            "تدارکات هدفمند انواع قطعات یدکی استاندارد، ماشین‌آلات تخصصی و تجهیزات صنعتی از بازارهای معتبر بین‌المللی و تولیدکنندگان پیشرو داخلی.",
          keyOutputs: [
            "تخصیص بهینه منابع بازرگانی",
            "مدیریت اسناد و ترخیص تخصصی",
            "پوشش نیازمندی‌های بازار قطعات خودرو",
          ],
          tags: ["قطعات اصلی", "استاندارد بین‌المللی", "زنجیره فرامرزی"],
          iconName: "Globe",
          siteId: "site-commercial-logistics",
        },
        {
          id: "distribution",
          order: 9,
          title: "توزیع و فروش",
          shortDesc: "توزیع مویرگی و سراسری به شبکه عاملیت‌ها در ایران",
          fullDesc:
            "لجستیک یکپارچه و تحویل ایمن قطعات به بازارهای استانی، فروشگاه‌های معتبر و شبکه مصرف‌کنندگان در سراسر کشور.",
          keyOutputs: [
            "پوشش کشوری شبکه پخش",
            "پاسخگویی سریع به بازار یدکی",
            "تضمین اصالت کالا تا مقصد",
          ],
          tags: ["توزیع مویرگی", "پوشش سراسری", "تحویل به‌موقع"],
          iconName: "Truck",
          siteId: "site-commercial-logistics",
        },
      ] as ValueChainStep[],
      sites: [
        {
          id: "site-production",
          title: "واحد تولید قطعات",
          category: "تولید پلیمری و پلاستیکی",
          scale: "۱۳,۰۰۰ مترمربع",
          specs: [
            { label: "مساحت واحد تولید", value: "۱۳,۰۰۰ مترمربع" },
            { label: "موقعیت", value: "شهرک صنعتی شماره ۲ کرمان" },
            {
              label: "محصولات اصلی",
              value: "سپر، جلوپنجره، قالپاق، قطعات پلیمری",
            },
            { label: "فناوری", value: "قالب‌گیری تزریقی مکانیزه" },
          ],
          iconName: "Factory",
          imageSrc: "/assets/official/factory-production.jpg",
          imageCaption: "نمایی از سالن اصلی تزریق پلاستیک در واحد ۱۳,۰۰۰ متری",
        },
        {
          id: "site-granulation",
          title: "واحد گرانول‌سازی مواد اولیه",
          category: "آماده‌سازی و کنترل کیفی مواد",
          scale: "۱,۵۰۰ مترمربع",
          specs: [
            { label: "مساحت واحد", value: "۱,۵۰۰ مترمربع" },
            { label: "مأموریت", value: "تأمین و کنترل کیفی مواد اولیه" },
            { label: "پلیمرهای هدف", value: "PP، ABS، آلیاژهای پلیمری مهندسی" },
            { label: "نتیجه فرآیند", value: "گرانول همگن و آزمون‌شده" },
          ],
          iconName: "Sparkles",
          imageSrc: "/assets/official/factory-granulation.jpg",
          imageCaption: "واحد گرانول‌سازی و فرآوری پلیمر خام کارخانه",
        },
        {
          id: "site-paint-pack",
          title: "واحد مونتاژ و رنگ‌آمیزی",
          category: "رنگ‌آمیزی مکانیزه و مجموعه‌سازی",
          scale: "۲,۶۲۰ مترمربع · ۴ خط رنگ",
          specs: [
            { label: "مساحت واحد مونتاژ", value: "۲,۶۲۰ مترمربع" },
            { label: "خطوط رنگ", value: "۴ خط · مجموع ۴۰۰ متر" },
            { label: "فرآیندها", value: "رنگ‌آمیزی مکانیزه، مونتاژ، پکینگ" },
            { label: "کنترل پایانی", value: "بازرسی و تست چسبندگی ۱۰۰٪" },
          ],
          iconName: "Palette",
          imageSrc: "/assets/official/factory-paint-line.jpg",
          imageCaption: "۴ خط رنگ‌آمیزی مکانیزه با مجموع طول ۴۰۰ متر",
        },
        {
          id: "site-commercial-logistics",
          title: "واحد انبار، بازرگانی و توزیع",
          category: "مدیریت لجستیک و انبارش",
          scale: "۲۴,۰۰۰ مترمربع انبار",
          specs: [
            { label: "مساحت انبار", value: "۲۴,۰۰۰ مترمربع" },
            { label: "سابقه سایت", value: "بیش از ۳۰ سال فعالیت" },
            { label: "حوزه عملیات", value: "تأمین کالا، انبارش و شبکه توزیع" },
            { label: "گستره پوشش", value: "سراسری در تمامی استان‌های کشور" },
          ],
          iconName: "Warehouse",
          imageSrc: "/assets/official/factory-assembly.jpg",
          imageCaption:
            "بخش لجستیک، مجموعه‌سازی و آماده‌سازی بسته‌ها برای توزیع",
        },
        {
          id: "site-admin",
          title: "واحد اداری",
          category: "مدیریت و پشتیبانی سازمانی",
          scale: "۷۳۰ مترمربع",
          specs: [
            { label: "مساحت واحد اداری", value: "۷۳۰ مترمربع" },
            { label: "کاربری", value: "مدیریت، بازرگانی و پشتیبانی" },
            { label: "موقعیت", value: "مجتمع صنعتی آریان خودرو خاورمیانه" },
            { label: "نقش", value: "هماهنگی عملیات و خدمات سازمانی" },
          ],
          iconName: "Building2",
          imageSrc: "/assets/official/banner-arian.jpg",
          imageCaption: "واحد اداری مجتمع صنعتی آریان خودرو خاورمیانه",
        },
        {
          id: "site-parand",
          title: "واحد پرند",
          category: "سایت عملیاتی دو طبقه",
          scale: "۱,۴۰۰ مترمربع در دو طبقه",
          specs: [
            { label: "مساحت واحد", value: "۱,۴۰۰ مترمربع" },
            { label: "ساختار", value: "دو طبقه" },
            { label: "موقعیت", value: "پرند" },
            { label: "کاربری", value: "عملیات صنعتی و پشتیبانی" },
          ],
          iconName: "MapPin",
          imageSrc: "/assets/official/factory-assembly.jpg",
          imageCaption: "واحد پرند با مساحت ۱,۴۰۰ مترمربع در دو طبقه",
        },
      ] as IndustrialFacility[],
    },
    products: {
      kicker: "نمونه تولیدات شاخص",
      title: "بخشی از سبد قطعات تولیدی آریان خودرو خاورمیانه",
      subtitle:
        "تولید انواع سپر، جلوپنجره، ابرویی و قالپاق خودروهای پرمصرف با متریال باکیفیت و رنگ‌آمیزی شرکتی",
      items: [
        {
          id: "p-1",
          name: "سپر عقب پژو پارس",
          carModel: "پژو پارس",
          category: "قطعات بدنه پلیمری",
          imageSrc: "/assets/official/product-bumper-pars.png",
          code: "AKK-BUMP-PARS",
        },
        {
          id: "p-2",
          name: "سپر جلو پژو ۲۰۶",
          carModel: "پژو ۲۰۶",
          category: "قطعات پلیمری رنگی",
          imageSrc: "/assets/official/product-bumper-206.png",
          code: "AKK-BUMP-206",
        },
        {
          id: "p-3",
          name: "سپر جلو ساینا",
          carModel: "ساینا / ساینا S",
          category: "قطعات پلیمری تزریقی",
          imageSrc: "/assets/official/product-bumper-saina.png",
          code: "AKK-BUMP-SAINA",
        },
        {
          id: "p-4",
          name: "جلو پنجره پژو پارس",
          carModel: "پژو پارس",
          category: "قطعات تزئینی و هوارسانی",
          imageSrc: "/assets/official/product-grille.png",
          code: "AKK-GRL-PARS",
        },
      ] as ProductShowcaseItem[],
    },
    brands: {
      kicker: "هویت تجاری",
      title: "برندهای زیرمجموعه آریان خودرو خاورمیانه",
      subtitle:
        "دو نام تجاری شناخته‌شده با مأموریت‌های مشخص در تولید و بازرگانی قطعات خودرو",
      brandsList: [
        {
          id: "arian-khodro",
          name: "آریان خودرو خاورمیانه",
          tagline: "برند اختصاصی تولیدات قطعات خودرویی",
          description:
            "برند اصلی مجموعه در زمینه عرضه قطعات تولیدی، به ویژه قطعات پلیمری بدنه، سپر، جلوپنجره، قالپاق و متعلقات وابسته که با تکیه بر خطوط تولید داخلی و کنترل کیفیت سخت‌گیرانه عرضه می‌شوند.",
          scope: [
            "سپرها و متعلقات بدنه پلیمری خودروها",
            "انواع جلوپنجره و شبکه‌های هوارسانی موتور",
            "انواع قالپاق چرخ خودروهای سواری",
            "قطعات تریم داخلی و بیرونی با کیفیت شرکتی",
          ],
          badge: "تولیدات صنعتی داخلی",
        },
        {
          id: "miba",
          name: "میبا (MIBA)",
          tagline: "برند مرتبط با قطعات وارداتی و بازرگانی",
          description:
            "برند تجاری متعلق به مجموعه آریان خودرو خاورمیانه که جهت تأمین و عرضه مطمئن قطعات وارداتی و بازرگانی با بالاترین انطباق فنی و استانداردهای کیفی در بازار قطعات یدکی طراحی شده است.",
          scope: [
            "قطعات وارداتی استاندارد خودرویی",
            "اقلام بازرگانی با تأییدیه تست‌های دوام",
            "تأمین ملزومات یدکی خودروهای پرمصرف",
            "بسته‌بندی ایمن و اصالت‌سنجی تجاری",
          ],
          badge: "تأمین و بازرگانی بین‌المللی",
        },
      ] as BrandInfo[],
    },
    values: {
      kicker: "اصول بنیادی",
      title: "رویکرد و ارزش‌های سازمانی",
      subtitle:
        "شش اصل بنیادین که جهت‌گیری تصمیمات و استانداردهای رفتاری مجموعه آریان خودرو خاورمیانه را تعیین می‌کنند",
      list: [
        {
          id: "sustainable-supply",
          title: "تأمین پایدار",
          description:
            "پاسخگویی مستمر به زنجیره قطعات با مدیریت هوشمند ریسک و تدارکات.",
          iconName: "RefreshCw",
        },
        {
          id: "industrial-dev",
          title: "توسعه صنعتی",
          description:
            "گسترش پیوسته خطوط تولید، نوسازی ماشین‌آلات و تکمیل حلقه‌های زنجیره.",
          iconName: "TrendingUp",
        },
        {
          id: "qc",
          title: "کنترل کیفیت",
          description:
            "نظارت در مبدأ، حین فرآیند و در پایان خط برای اطمینان از محصول بی‌نقص.",
          iconName: "ShieldCheck",
        },
        {
          id: "customer-focus",
          title: "مشتری‌محوری",
          description:
            "درک دقیق نیازمندی‌های بازار قطعات و ارائه خدمات پشتیبانی قابل اعتماد.",
          iconName: "Users",
        },
        {
          id: "innovation",
          title: "نوآوری",
          description:
            "بهبود فرآیندهای فرمولاسیون پلیمر، قالب‌سازی و ارتقای متدهای تولید.",
          iconName: "Lightbulb",
        },
        {
          id: "responsibility",
          title: "مسئولیت‌پذیری",
          description:
            "ایفای تعهدات در برابر مشتریان، کارکنان، جامعه صنعتی و محیط‌زیست.",
          iconName: "HeartHandshake",
        },
      ] as CoreValue[],
    },
    finalCta: {
      title: "برای همکاری با آریان خودرو خاورمیانه آماده‌ایم.",
      subtitle:
        "جهت ارتباط با بخش‌های تأمین، تولید، بازرگانی، فروش سازمانی یا دریافت اطلاعات تکمیلی با کارشناسان ما در تماس باشید.",
      buttonText: "ارتباط با ما",
      contactQuick: "تلفن مستقیم: ۳۱۶۲۲۶۰۰-۰۳۴ | ایمیل: info@arian-int.com",
    },
    contact: {
      kicker: "راه‌های ارتباطی رسمی",
      title: "ارتباط با آریان خودرو خاورمیانه",
      subtitle: "آدرس، سایت‌های صنعتی کارخانه و درگاه‌های رسمی ارتباطی شرکت",
      formTitle: "ارسال پیام / انتقاد و پیشنهاد",
      formDesc:
        "پیام، انتقاد یا پیشنهاد شما مستقیماً توسط واحدهای ذی‌ربط بررسی خواهد شد.",
      nameLabel: "نام و نام خانوادگی",
      phoneLabel: "شماره تماس",
      emailLabel: "پست الکترونیکی",
      subjectLabel: "موضوع پیام",
      subjectOptions: [
        "تأمین و بازرگانی قطعات",
        "تولید و سفارش قطعات پلیمری",
        "فروش عمده و عاملیت توزیع",
        "انتقاد و پیشنهاد",
        "سایر موارد",
      ],
      messageLabel: "متن پیام یا توضیحات",
      submitBtn: "ثبت و ارسال پیام",
      sendingText: "در حال ثبت پیام...",
      successMsg:
        "پیام شما با موفقیت ثبت شد. کارشناسان آریان خودرو خاورمیانه به زودی با شما تماس خواهند گرفت.",
      info: {
        centralOffice: {
          title: "آدرس",
          address: "کرمان، بلوار جمهوری، خیابان زینهاری، کوچه شماره ۲",
          city: "کرمان، ایران",
        },
        factory: {
          title: "کارخانه و سایت‌های صنعتی",
          address: "کرمان، شهرک صنعتی شماره ۲، بلوار شقایق، نبش شقایق ۲۵",
          city: "کرمان، ایران",
        },
        phoneNumbers: ["۰۳۴-۳۱۶۲۲۶۰۰", "۰۳۴-۳۲۶۵۸۲۷۸"],
        supportPhone: "۰۳۴-۳۱۶۲۲۶۰۰",
        email: "info@arian-int.com",
        website: "akk.ir",
        workingHours:
          "شنبه تا چهارشنبه: ۷:۳۰ الی ۱۶:۳۰ | پنج‌شنبه: ۷:۳۰ الی ۱۲:۳۰",
      } as ContactInfo,
    },
    footer: {
      companyName: "شرکت تولیدی و بازرگانی آریان خودرو خاورمیانه (سهامی خاص)",
      tagline:
        "از تأمین و تولید تا توزیع؛ زنجیره یکپارچه ارزش در صنعت قطعات خودرو",
      copyright:
        "تمامی حقوق مادی و معنوی متعلق به شرکت آریان خودرو خاورمیانه (AKK) می‌باشد.",
      websiteNote: "مرجع رسمی اطلاع‌رسانی و ثبت سفارشات: akk.ir",
    },
  },
  en: {
    meta: {
      title:
        "Arian Khodro Middle East | Integrated Automotive Parts Supply & Manufacturing",
      description:
        "Arian Khodro Middle East (AKK); over four decades of excellence in automotive parts supply, polymer manufacturing, automated paint lines, and nationwide distribution.",
    },
    brandMark: "Arian Khodro Middle East",
    brandShort: "Arian Khodro Middle East",
    acronym: "AKK",
    logoSrc: "/assets/official/logo-arian.png",
    nav: [
      { id: "about", label: "About Us" },
      { id: "factory-tour", label: "Factory Tour" },
      { id: "value-chain", label: "Value Chain" },
      { id: "products", label: "Products" },
      { id: "brands", label: "Brands" },
      { id: "contact", label: "Contact Us" },
    ] as NavItem[],
    hero: {
      tag: "Integrated Automotive Parts Manufacturer & Supplier",
      title: "Arian Khodro Middle East",
      subtitle:
        "From Supply and Manufacturing to Distribution: An Integrated Chain in the Automotive Parts Industry",
      description:
        "Operating since 1985; uniting polymer engineering, international procurement, precision injection molding, laboratory quality assurance, and an extensive nationwide distribution network headquartered in Kerman, Iran.",
      ctaPrimary: "Discover Arian Khodro Middle East",
      ctaSecondary: "Factory Tour",
      ctaContact: "Contact Us",
      stats: [
        { value: "1985", label: "Founded" },
        { value: "6", label: "Operational Units" },
        { value: "13,000", label: "m² Production Unit" },
        { value: "24,000", label: "m² Warehouse" },
      ],
      heroImage: "/assets/official/banner-hero.jpg",
      factoryBanner: "/assets/official/banner-arian.jpg",
    },
    about: {
      kicker: "Heritage & Continuous Growth",
      title: "Over Four Decades in the Automotive Parts Supply Chain",
      yearBadge: "1985",
      yearLabel: "Established in 1985",
      paragraphs: [
        "Arian Khodro Middle East began its journey in 1985 with a focus on automotive spare parts trade, procurement, and commercial distribution. Guided by an in-depth understanding of the automotive market and strategic foresight, the organization transitioned from trading to industrial self-reliance and complete value-chain integration.",
        "Today, operating a 13,000 m² production unit, a 1,500 m² granulation unit, a 2,620 m² assembly hall, four mechanized paint lines totaling 400 meters, a 24,000 m² warehouse, a 730 m² administrative unit, and a 1,400 m² two-floor Parand unit, Arian Khodro Middle East stands as a unified industrial corporation managing every step with rigorous quality standards.",
      ],
      milestones: [
        {
          year: "1985",
          title: "Inception & Commercial Trading",
          desc: "Commenced procurement, sourcing, and distribution of vehicle spare parts across the nation.",
        },
        {
          year: "2012",
          title: "Corporate Registration as Joint-Stock Co.",
          desc: "Formalized corporate governance under the trademark Arian Khodro Middle East (AKK).",
        },
        {
          year: "2014",
          title: "Polymer Manufacturing & Compounding",
          desc: "Entered polymer production and granulation with a 13,000 m² manufacturing plant in Industrial City No. 2.",
        },
        {
          year: "2021+",
          title: "End-to-End Value Chain Integration",
          desc: "Commissioned four automated paint lines (400 m total), a 2,620 m² assembly hall, 24,000 m² warehouse, and precision QC testing.",
        },
      ],
    },
    gallery: {
      kicker: "Visual Factory & Operations Archive",
      title:
        "Inside Arian Khodro Middle East Manufacturing Lines, Imports & Facilities",
      subtitle:
        "Authentic photography from our heavy injection halls, automated coating conveyors, international imports & logistics hub, polymer compounding lab, and sub-assembly stations in Kerman Industrial City No. 2",
      items: [
        {
          id: "prod-hall",
          title: "Main Polymer Injection Plant",
          subtitle: "Production unit spanning 13,000 m²",
          category: "Injection Lines",
          imageSrc: "/assets/official/factory-production.jpg",
          description:
            "High-tonnage automated injection molding systems producing structural exterior automotive parts like bumpers and grilles.",
          badge: "13,000 m² Unit",
        },
        {
          id: "paint-lines",
          title: "Automated Industrial Paint Lines",
          subtitle: "Four paint lines totaling 400 m; 2,620 m² assembly unit",
          category: "Coating Hall",
          imageSrc: "/assets/official/factory-paint-line.jpg",
          description:
            "Equipped with four standard industrial paint lines totaling 400 meters, applying durable OEM-calibrated finishes.",
          badge: "4 Paint Lines · 400 m",
        },
        {
          id: "import-logistics",
          title: "Automotive Parts Sourcing, Trade & Imports",
          subtitle:
            "International procurement center, customs clearance & logistics hub",
          category: "Imports & Commerce",
          imageSrc: "/assets/official/banner-arian.jpg",
          description:
            "Direct import of OEM-grade automotive components, industrial molds, and engineering polymers backed by four decades of international trade and supply chain management.",
          badge: "International Imports",
        },
        {
          id: "granulation-unit",
          title: "Polymer Granulation & Compounding Unit",
          subtitle: "Raw material preparation across 1,500 m²",
          category: "Raw Materials",
          imageSrc: "/assets/official/factory-granulation.jpg",
          description:
            "Specialized formulation and property enhancement of engineering polymer resins for high impact resistance.",
          badge: "1,500 m² Unit",
        },
        {
          id: "assembly-hall",
          title: "Sub-Assembly & Packaging Stations",
          subtitle: "Assembly unit spanning 2,620 m²",
          category: "Assembly & Kitting",
          imageSrc: "/assets/official/factory-assembly.jpg",
          description:
            "Precise installation of clips, brackets, and protective impact wrapping prior to warehouse transfer.",
          badge: "2,620 m² Unit",
        },
        {
          id: "machinery",
          title: "Precision Tooling & Molding Machinery",
          subtitle: "Modern hydraulic and robotic infrastructure",
          category: "Equipment",
          imageSrc: "/assets/official/factory-machinery.jpg",
          description:
            "High-precision dies and industrial molds maintaining strict automotive dimensional tolerances.",
          badge: "High Precision Dies",
        },
      ] as FactoryGalleryItem[],
    },
    valueChain: {
      kicker: "Value Chain, Sites & Capabilities",
      title: "Integrated Value Chain at Arian Khodro Middle East",
      subtitle:
        "9 value stages across 6 operational units, from sourcing and import to molding, painting, packaging and nationwide distribution, with uniform quality and dependable delivery",
      steps: [
        {
          id: "sourcing",
          order: 1,
          title: "Supply",
          shortDesc: "Strategic sourcing of certified materials and components",
          fullDesc:
            "Continuous appraisal and auditing of world-class domestic and global suppliers based on automotive standards to ensure an uninterrupted, premium input stream.",
          keyOutputs: [
            "Tier-1 supplier qualification",
            "Stringent input quality audits",
            "Long-term supply stability",
          ],
          tags: [
            "Sustainable Supply",
            "Strategic Alliances",
            "Industrial Sourcing",
          ],
          iconName: "Network",
          siteId: "site-commercial-logistics",
        },
        {
          id: "procurement",
          order: 2,
          title: "Import & Sourcing",
          shortDesc:
            "International trading and domestic procurement operations",
          fullDesc:
            "Targeted sourcing of OEM spare parts, precision industrial tooling, and advanced machinery through established global supply channels.",
          keyOutputs: [
            "Optimized commercial logistics",
            "Compliant customs clearance",
            "Automotive aftermarket fulfillment",
          ],
          tags: ["OEM Standards", "Global Supply Chain", "Customs Compliance"],
          iconName: "Globe",
          siteId: "site-commercial-logistics",
        },
        {
          id: "raw-materials",
          order: 3,
          title: "Raw Materials",
          shortDesc: "Compounding and engineering thermoplastic polymers",
          fullDesc:
            "Specialized formulation of automotive polymers (PP, ABS, and engineering polymer alloys) engineered for superior structural integrity, impact resistance, and thermal tolerance.",
          keyOutputs: [
            "High-impact polymer formulas",
            "Thermal & mechanical compliance",
            "Climate-controlled warehouse storage",
          ],
          tags: ["Granulation", "Engineering Polymers", "1,500 m² Unit"],
          iconName: "Layers",
          siteId: "site-granulation",
        },
        {
          id: "manufacturing",
          order: 4,
          title: "Manufacturing",
          shortDesc: "Precision injection molding and polymer shaping",
          fullDesc:
            "Operating high-tonnage automated injection molding machines and specialized tooling lines to produce exterior and interior automotive parts with tight tolerances.",
          keyOutputs: [
            "Exterior body & styling parts",
            "Micron-level tooling accuracy",
            "Optimized lean production cycle",
          ],
          tags: [
            "Plastic Injection",
            "Bumpers, Grilles, Wheel Covers",
            "Precision Tooling",
          ],
          iconName: "Cpu",
          siteId: "site-production",
        },
        {
          id: "quality-control",
          order: 5,
          title: "Quality Assurance",
          shortDesc: "Rigorous laboratory testing at every production node",
          fullDesc:
            "Comprehensive mechanical, tensile, and chemical evaluation, UV weathering resistance testing, and computerized dimensional inspection.",
          keyOutputs: [
            "Impact and load resistance testing",
            "Coating adhesion & salt-spray tests",
            "Zero-defect gate compliance",
          ],
          tags: ["Impact Analysis", "Dimensional Precision", "Station Audits"],
          iconName: "ShieldCheck",
          siteId: "site-production",
        },
        {
          id: "paint-assembly",
          order: 6,
          title: "Painting & Assembly",
          shortDesc: "Mechanized painting and precise multi-component assembly",
          fullDesc:
            "Four automated paint lines totaling 400 meters applying durable automotive finishes calibrated to OEM color codes, paired with precision multi-component assembly stations in a 2,620 m² hall.",
          keyOutputs: [
            "4 paint lines · 400 m total",
            "Exact OEM color calibration",
            "Multi-part mechanical kitting",
          ],
          tags: [
            "Mechanized Painting",
            "Modular Assembly",
            "Color-Match Precision",
          ],
          iconName: "Palette",
          siteId: "site-paint-pack",
        },
        {
          id: "packaging",
          order: 7,
          title: "Packaging",
          shortDesc: "Protective casing, technical labeling, and serialization",
          fullDesc:
            "Engineered protective packaging to shield delicate automotive surfaces from transit abrasion, complete with holographic authentication marks.",
          keyOutputs: [
            "Anti-impact protective materials",
            "Unique QR and barcode trackability",
            "Distinctive Arian Khodro Middle East & MIBA branding",
          ],
          tags: [
            "Transit Security",
            "Authentication Marks",
            "Serial Barcoding",
          ],
          iconName: "PackageCheck",
          siteId: "site-paint-pack",
        },
        {
          id: "warehousing",
          order: 8,
          title: "Warehousing",
          shortDesc: "Organized storage in a 24,000 m² central warehouse",
          fullDesc:
            "Automated inventory indexing, climate-regulated storage, and rapid pick-pack operations ensuring product integrity and immediate dispatch.",
          keyOutputs: [
            "Smart warehouse management system",
            "24,000 m² central storage capacity",
            "Rapid fulfillment processing",
          ],
          tags: [
            "24,000 m² Facility",
            "Automated Indexing",
            "Inventory Control",
          ],
          iconName: "Warehouse",
          siteId: "site-commercial-logistics",
        },
        {
          id: "distribution",
          order: 9,
          title: "Distribution & Sales",
          shortDesc: "Nationwide logistics network serving provincial hubs",
          fullDesc:
            "End-to-end transport and delivery network supplying certified automotive parts to regional dealers, commercial partners, and authorized retailers nationwide.",
          keyOutputs: [
            "Countrywide logistics footprint",
            "Rapid market responsiveness",
            "Guaranteed product provenance",
          ],
          tags: [
            "Nationwide Logistics",
            "Provincial Hubs",
            "Timely Fulfillment",
          ],
          iconName: "Truck",
          siteId: "site-commercial-logistics",
        },
      ] as ValueChainStep[],
      sites: [
        {
          id: "site-production",
          title: "Production Unit",
          category: "Automotive Polymer Production",
          scale: "13,000 m²",
          specs: [
            { label: "Production Footprint", value: "13,000 m²" },
            { label: "Location", value: "Industrial City No. 2, Kerman" },
            {
              label: "Primary Output",
              value: "Bumpers, Grilles, Wheel Covers",
            },
            { label: "Key Technology", value: "Automated Injection Molding" },
          ],
          iconName: "Factory",
          imageSrc: "/assets/official/factory-production.jpg",
          imageCaption:
            "Heavy injection molding production hall in 13,000 m² facility",
        },
        {
          id: "site-granulation",
          title: "Granulation & Compounding Unit",
          category: "Raw Material Preparation",
          scale: "1,500 m²",
          specs: [
            { label: "Facility Footprint", value: "1,500 m²" },
            {
              label: "Primary Mission",
              value: "Polymer Raw Material Preparation",
            },
            {
              label: "Materials",
              value: "PP, ABS, engineering polymer alloys",
            },
            {
              label: "Output Form",
              value: "Standardized Homogeneous Granules",
            },
          ],
          iconName: "Sparkles",
          imageSrc: "/assets/official/factory-granulation.jpg",
          imageCaption:
            "Raw material compounding and polymer pelletizing equipment",
        },
        {
          id: "site-paint-pack",
          title: "Assembly & Painting Unit",
          category: "Mechanized Painting & Sub-Assembly",
          scale: "2,620 m² · 4 Paint Lines",
          specs: [
            { label: "Assembly Area", value: "2,620 m²" },
            { label: "Paint Lines", value: "4 lines · 400 m total" },
            { label: "Color Matching", value: "Calibrated OEM Color Codes" },
            {
              label: "Operations",
              value: "Mechanized Painting, Assembly & Packing",
            },
          ],
          iconName: "Palette",
          imageSrc: "/assets/official/factory-paint-line.jpg",
          imageCaption: "Four mechanized paint lines totaling 400 meters",
        },
        {
          id: "site-commercial-logistics",
          title: "Warehouse, Trading & Distribution",
          category: "Commercial Hub & Logistics",
          scale: "24,000 m² Warehouse",
          specs: [
            { label: "Warehouse Area", value: "24,000 m²" },
            { label: "Site Heritage", value: "Over 30 Years Experience" },
            {
              label: "Functional Scope",
              value: "Procurement, Storage & Logistics",
            },
            { label: "Reach", value: "Nationwide Network Coverage" },
          ],
          iconName: "Warehouse",
          imageSrc: "/assets/official/factory-assembly.jpg",
          imageCaption:
            "Logistics coordination and finished goods dispatch zone",
        },
        {
          id: "site-admin",
          title: "Administrative Unit",
          category: "Management & Organizational Support",
          scale: "730 m²",
          specs: [
            { label: "Admin Footprint", value: "730 m²" },
            { label: "Function", value: "Management, trade & support" },
            {
              label: "Location",
              value: "Arian Khodro Middle East industrial complex",
            },
            {
              label: "Role",
              value: "Operations coordination & corporate services",
            },
          ],
          iconName: "Building2",
          imageSrc: "/assets/official/banner-arian.jpg",
          imageCaption:
            "Administrative unit at the Arian Khodro Middle East industrial complex",
        },
        {
          id: "site-parand",
          title: "Parand Unit",
          category: "Two-Floor Operational Site",
          scale: "1,400 m² across two floors",
          specs: [
            { label: "Unit Area", value: "1,400 m²" },
            { label: "Structure", value: "Two floors" },
            { label: "Location", value: "Parand" },
            { label: "Use", value: "Industrial operations & support" },
          ],
          iconName: "MapPin",
          imageSrc: "/assets/official/factory-assembly.jpg",
          imageCaption: "Parand unit spanning 1,400 m² across two floors",
        },
      ] as IndustrialFacility[],
    },
    products: {
      kicker: "Key Manufactured Components",
      title: "Featured Automotive Parts Portfolio",
      subtitle:
        "High-precision polymer bumpers, front grilles, and aerodynamic trims produced with certified OEM coatings",
      items: [
        {
          id: "p-1",
          name: "Peugeot Pars Rear Bumper",
          carModel: "Peugeot Pars",
          category: "Polymer Body Components",
          imageSrc: "/assets/official/product-bumper-pars.png",
          code: "AKK-BUMP-PARS",
        },
        {
          id: "p-2",
          name: "Peugeot 206 Front Bumper",
          carModel: "Peugeot 206",
          category: "Coated Polymer Parts",
          imageSrc: "/assets/official/product-bumper-206.png",
          code: "AKK-BUMP-206",
        },
        {
          id: "p-3",
          name: "Saina Front Bumper",
          carModel: "Saina / Saina S",
          category: "Injected Polymer Parts",
          imageSrc: "/assets/official/product-bumper-saina.png",
          code: "AKK-BUMP-SAINA",
        },
        {
          id: "p-4",
          name: "Peugeot Pars Radiator Grille",
          carModel: "Peugeot Pars",
          category: "Grille & Airflow Trim",
          imageSrc: "/assets/official/product-grille.png",
          code: "AKK-GRL-PARS",
        },
      ] as ProductShowcaseItem[],
    },
    brands: {
      kicker: "Brand Portfolio",
      title: "Our Core Brands",
      subtitle:
        "Two recognized automotive trademarks engineered for production and commercial excellence",
      brandsList: [
        {
          id: "arian-khodro",
          name: "Arian Khodro Middle East",
          tagline: "Dedicated Automotive Component Manufacturing",
          description:
            "The flagship industrial brand representing in-house manufactured vehicle parts, primarily polymer body components such as front and rear bumpers, grilles, and wheel covers backed by strict quality protocols.",
          scope: [
            "Automotive bumpers and body components",
            "Radiator grilles and airflow assemblies",
            "Passenger vehicle wheel covers",
            "Internal and external polymer trim parts",
          ],
          badge: "In-House Industrial Manufacturing",
        },
        {
          id: "miba",
          name: "MIBA",
          tagline: "Imported & Commercial Automotive Parts",
          description:
            "The proprietary brand of Arian Khodro Middle East established to deliver certified, high-grade imported spare parts and commercial automotive products with stringent technical standards.",
          scope: [
            "Certified international automotive replacement parts",
            "Commercially tested and validated components",
            "Comprehensive coverage for high-demand passenger cars",
            "Tamper-evident packaging and certified quality marks",
          ],
          badge: "International Sourcing & Trade",
        },
      ] as BrandInfo[],
    },
    values: {
      kicker: "Guiding Principles",
      title: "Core Values & Approach",
      subtitle:
        "Six foundational principles governing industrial operations and strategic decisions at Arian Khodro Middle East",
      list: [
        {
          id: "sustainable-supply",
          title: "Sustainable Supply",
          description:
            "Dependable, uninterrupted component availability through strategic supply-chain resilience.",
          iconName: "RefreshCw",
        },
        {
          id: "industrial-dev",
          title: "Industrial Growth",
          description:
            "Continuous plant modernization, technological expansion, and deeper value-chain integration.",
          iconName: "TrendingUp",
        },
        {
          id: "qc",
          title: "Quality Assurance",
          description:
            "Multi-stage inspection protocols from incoming resin testing to finished component verification.",
          iconName: "ShieldCheck",
        },
        {
          id: "customer-focus",
          title: "Customer Centricity",
          description:
            "Responsive partnerships, on-time logistics, and steadfast commercial support.",
          iconName: "Users",
        },
        {
          id: "innovation",
          title: "Innovation",
          description:
            "Advancing polymer formulations, tooling accuracy, and production methodologies.",
          iconName: "Lightbulb",
        },
        {
          id: "responsibility",
          title: "Responsibility",
          description:
            "Upholding responsibilities toward automotive partners, employees, and industrial integrity.",
          iconName: "HeartHandshake",
        },
      ] as CoreValue[],
    },
    finalCta: {
      title: "Ready to Collaborate with Arian Khodro Middle East.",
      subtitle:
        "Connect with our procurement, manufacturing, trade, or institutional sales departments for partnerships and supply inquiries.",
      buttonText: "Contact Our Team",
      contactQuick: "Direct Phone: +98-34-31622600 | Email: info@arian-int.com",
    },
    contact: {
      kicker: "Direct Communications",
      title: "Contact Arian Khodro Middle East",
      subtitle: "Address, manufacturing sites, and official corporate channels",
      formTitle: "Send a Message / Feedback & Suggestions",
      formDesc:
        "Your message, feedback, or suggestion will be routed directly to the relevant teams.",
      nameLabel: "Full Name",
      phoneLabel: "Phone Number",
      emailLabel: "Email Address",
      subjectLabel: "Inquiry Category",
      subjectOptions: [
        "Automotive Parts Procurement",
        "Polymer Parts Manufacturing Orders",
        "Wholesale & Distribution Agency",
        "Feedback & Suggestions",
        "Other Inquiries",
      ],
      messageLabel: "Message Details",
      submitBtn: "Submit Inquiry",
      sendingText: "Submitting Inquiry...",
      successMsg:
        "Your message has been successfully received. Our representatives will get in touch shortly.",
      info: {
        centralOffice: {
          title: "Address",
          address: "Kerman, Jomhouri Blvd, Zinehari St, Alley No. 2",
          city: "Kerman, Iran",
        },
        factory: {
          title: "Manufacturing & Industrial Sites",
          address:
            "Corner of Shaghayegh 25, Shaghayegh Blvd, Industrial City No. 2",
          city: "Kerman, Iran",
        },
        phoneNumbers: ["+98-34-31622600", "+98-34-32658278"],
        supportPhone: "+98-34-31622600",
        email: "info@arian-int.com",
        website: "akk.ir",
        workingHours:
          "Saturday to Wednesday: 07:30 - 16:30 | Thursday: 07:30 - 12:30",
      } as ContactInfo,
    },
    footer: {
      companyName:
        "Arian Khodro Middle East Manufacturing & Trading Co. (P.J.S)",
      tagline:
        "From Supply and Manufacturing to Distribution: Integrated Value Chain in Automotive Components",
      copyright: "All rights reserved © Arian Khodro Middle East (AKK).",
      websiteNote: "Official corporate and order portal: akk.ir",
    },
  },
};
