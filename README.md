# Claude-RTL-Fix

Fixes mixed right-to-left and English text in Claude's interfaces: Persian,
Arabic, Hebrew, Urdu and every other language written right to left.

رفع به‌هم‌ریختگی متن راست‌به‌چپ و انگلیسی در رابط‌های Claude، برای فارسی، عربی، عبری، اردو و هر زبان راست‌به‌چپ دیگر.

![The same Persian, Arabic and Hebrew replies with rtl-fix off and on](docs/demo%20rtl-fix%20off%20and%20on.gif)

[English](#english) · [فارسی](#فارسی) · [العربية](#العربية) · [עברית](#עברית)

---

## English

### The problem

Right-to-left languages are usually written with English words, code, numbers
and units mixed in. Claude's interfaces lay such text out with the plain Unicode
bidi algorithm, and it breaks in the same ways in every right-to-left language:

- A line that starts with an English word is laid out left to right, so its
  period jumps to the wrong end and the line sits on the wrong side.
- A number with a unit is reversed: `12.5 USD` shows as `USD 12.5`, `25°C` as
  `C°25`, `100 km/h` as `km/h 100`.
- Brackets and dots next to English words move across the line.

The Claude desktop app already picks each paragraph's direction from its first
letter, so lines that start with a right-to-left word mostly look fine. The
cases above still break. The same text, drawn three ways:

![Raw text, raw text with dir=auto, and text through rtl-fix](docs/comparison%20raw%20vs%20dir-auto%20vs%20rtl-fix.jpg)

### Languages

It works on the letters, not on a list of languages, so every right-to-left
script is covered:

| Script | Languages | A line it fixes |
| --- | --- | --- |
| Arabic | Persian, Arabic, Urdu, Pashto, Kurdish (Sorani), Sindhi, Uyghur … | `Astro یک فریم‌ورک است.` · `Python لغة برمجة شائعة.` · `یہ منصوبہ Claude Code سے بنایا گیا۔` |
| Hebrew | Hebrew, Yiddish | `React היא ספרייה של JavaScript.` |
| Syriac, Thaana, N'Ko, Adlam, Samaritan, Mandaic, Hanifi Rohingya | Syriac, Dhivehi, Manding, Fula, Rohingya … | detected as right to left |

Western (`0-9`), Arabic-Indic (`٠-٩`) and Persian (`۰-۹`) digits are all
handled. The Persian, Arabic, Hebrew and Urdu cases are in the test suite; the
other scripts are tested for detection.

### What this does

`rtl-fix` is a Claude Code mod. It changes **only what is drawn**: the stored
message, what the model reads and what you copy stay exactly as written.

It adds invisible Unicode direction marks to each message before it is drawn:

| Where | What it adds |
| --- | --- |
| A line that is mostly right-to-left (at least as many right-to-left words as English ones, or a right-to-left first letter) | `RLM` + `RLI` … `PDI` around its content |
| A Latin run inside it (`Claude Code`, `12.5 USD`, `f(x)`) | `LRI` … `PDI` |
| Inline code, `<autolinks>` | `LRI` … `PDI` around the whole span |
| A table row | the same, cell by cell; pipes and the delimiter row stay |

Left exactly as written: fenced code blocks, HTML lines, link targets, bare
URLs and emails (so they still become links), and lines that are mostly English.
List markers, quote markers, heading hashes, task boxes and hard line breaks stay
where Markdown expects them.

### Install

At the prompt of a Claude Code terminal session:

```
/plugin install rtl-fix --marketplace Rozucci/Claude-RTL-Fix
```

Answer `y` to add the marketplace, then pick a scope (user scope is first).

From a shell:

```bash
claude plugin install rtl-fix --marketplace Rozucci/Claude-RTL-Fix
```

In the desktop app, where `/plugin` does not run: click **+** next to the prompt
box, then **Plugins**, **Add marketplace** with `Rozucci/Claude-RTL-Fix`,
then **Add plugin**. A mod installed from a terminal at the user scope also loads
in the desktop app's Code tab.

### Use

It works on its own once installed. Type `/rtl` to turn it off or on again.

### Develop

```bash
claude plugin validate claude-code-mod/rtl-fix
```

```bash
claude plugin test claude-code-mod/rtl-fix
```

To run it from this folder: `claude --plugin-dir claude-code-mod/rtl-fix`.
The engine is one file, [`hooks/bidi.ts`](claude-code-mod/rtl-fix/hooks/bidi.ts),
with no dependencies, so it can be reused in a browser extension or anywhere
else that draws Markdown.

The demo above is made from the engine's real output:
`scripts/make-demo.sh` (macOS, needs Google Chrome, bun and ffmpeg).

### Known limits

- **Terminal.** Not checked by eye yet. The marks are standard Unicode, so how
  they look depends on your terminal's own bidi support. Lines stay flush left
  there: the mod API offers `dir="rtl"` only on plain `Text`, not on a rendered
  Markdown reply.
- **Desktop app alignment** is right, lines that start with English included
  (checked by eye with `/rtl` off and on).
- **Table columns** keep left-to-right order; only the text inside each cell is
  fixed.
- **Fonts** can't be changed by a mod: the theme API sets colors and a backdrop
  only.
- A line with more English words than right-to-left ones is treated as English
  and left alone, for example `Say שלום to the new build`.
- Indented (4-space) code blocks outside lists are not detected; fenced blocks are.

### Roadmap

1. Claude Code mod (this repository) — v0.2.0.
2. Browser extension for claude.ai, reusing the same engine. In a browser it can
   also give right-to-left text its own font (CSS `unicode-range`), which a mod
   can't.
3. A companion writing skill for the model.
4. An issue report to Anthropic with this test corpus.

### Contributing

A line in your language that still draws wrong is the most useful thing you can
send: open an issue with the text as Claude wrote it and a screenshot.

### License

[MIT](LICENSE)

---

<div dir="rtl">

## فارسی

### مشکل

متن زبان‌های راست‌به‌چپ معمولاً پر از کلمهٔ انگلیسی، کد، عدد و واحد است.
رابط‌های Claude این متن را با الگوریتم سادهٔ bidi یونیکد می‌چینند و در همهٔ
زبان‌های راست‌به‌چپ به یک شکل خراب می‌شود:

- سطری که با کلمهٔ انگلیسی شروع شود چپ‌به‌راست چیده می‌شود؛ نقطه‌اش به سر دیگر
  سطر می‌پرد و سطر سمت اشتباه می‌نشیند.
- عدد و واحد برعکس می‌شوند: ‏`12.5 USD` به شکل ‏`USD 12.5` و ‏`25°C` به شکل ‏`C°25`.
- پرانتز و نقطه کنار کلمه‌های انگلیسی جابه‌جا می‌شوند.

اپ دسکتاپ Claude خودش جهت هر پاراگراف را از اولین حرفش تشخیص می‌دهد، برای همین
سطری که با کلمهٔ فارسی شروع شود معمولاً درست دیده می‌شود. ولی موارد بالا هنوز
خراب‌اند. ویدیو و تصویر مقایسه بالای صفحه و در بخش انگلیسی هست.

### زبان‌ها

افزونه روی حروف کار می‌کند، نه روی فهرست زبان‌ها؛ پس همهٔ خط‌های راست‌به‌چپ را
پوشش می‌دهد:

- **خط عربی:** فارسی، عربی، اردو، پشتو، کردی سورانی، سندی، اویغوری و …
- **خط عبری:** عبری و ییدیش
- **خط‌های دیگر:** سریانی، ثانا (دیوهی/مالدیوی)، اِن‌کو، ادلام، سامری، مندایی و حنیفی روهینگیا

رقم‌های لاتین، عربی (٠-٩) و فارسی (۰-۹) هر سه پشتیبانی می‌شوند.

### این افزونه چه می‌کند

‏`rtl-fix` یک mod برای Claude Code است و **فقط نمایش** را عوض می‌کند. پیام
ذخیره‌شده، چیزی که مدل می‌خواند و چیزی که کپی می‌کنید دقیقاً همان می‌ماند که
نوشته شده.

پیش از نمایش هر پیام، نشانه‌های نامرئی جهت یونیکد اضافه می‌کند:

- دور هر سطری که بیشترش راست‌به‌چپ است: ‏`RLM` + `RLI` … `PDI`
- دور هر تکهٔ لاتین داخل آن (مثل ‏`Claude Code`، ‏`12.5 USD`، ‏`f(x)`): ‏`LRI` … `PDI`
- دور کد درون‌خطی و لینک‌های `<…>`: ‏`LRI` … `PDI` روی کل تکه
- در جدول‌ها همین کار خانه‌به‌خانه انجام می‌شود و خط‌های `|` دست نمی‌خورند.

بلوک‌های کد، سطرهای HTML، مقصد لینک‌ها، آدرس‌های اینترنتی و ایمیل‌ها (تا
همچنان لینک شوند) و سطرهایی که بیشترشان انگلیسی است، دست‌نخورده می‌مانند.
نشانهٔ فهرست، نقل‌قول، تیتر، چک‌باکس و شکستن سطر سر جای خودشان می‌مانند.

### نصب

در خط فرمان یک جلسهٔ Claude Code در ترمینال:

</div>

```
/plugin install rtl-fix --marketplace Rozucci/Claude-RTL-Fix
```

<div dir="rtl">

برای افزودن marketplace حرف `y` را بزنید و بعد محدوده را انتخاب کنید (اولی،
یعنی user، پیشنهاد می‌شود).

از shell:

</div>

```bash
claude plugin install rtl-fix --marketplace Rozucci/Claude-RTL-Fix
```

<div dir="rtl">

در اپ دسکتاپ، که `/plugin` در آن اجرا نمی‌شود: روی **+** کنار جعبهٔ پیام بزنید،
بعد **Plugins**، بعد **Add marketplace** با `Rozucci/Claude-RTL-Fix` و
در آخر **Add plugin**. افزونه‌ای که از ترمینال در محدودهٔ user نصب شود، در تب
Code اپ دسکتاپ هم بار می‌شود.

### استفاده

بعد از نصب خودش کار می‌کند. با `/rtl` خاموش و دوباره روشنش کنید.

### محدودیت‌های فعلی

- **ترمینال:** هنوز با چشم بررسی نشده. نشانه‌ها یونیکد استاندارد هستند و نتیجه
  به پشتیبانی خود ترمینال از متن دوجهته بستگی دارد. سطرها آنجا چپ‌چین می‌مانند،
  چون API افزونه‌ها `dir="rtl"` را فقط برای متن ساده دارد، نه برای پاسخ Markdown.
- **چینش در اپ دسکتاپ** درست و راست‌چین است، حتی سطری که با انگلیسی شروع می‌شود
  (با چشم و با خاموش و روشن کردن `/rtl` بررسی شد).
- **ستون‌های جدول** همچنان از چپ به راست چیده می‌شوند؛ فقط متن داخل هر خانه
  درست می‌شود.
- **فونت** را افزونه نمی‌تواند عوض کند؛ API ظاهر فقط رنگ و پس‌زمینه را می‌گیرد.
- سطری که کلمه‌های انگلیسی‌اش بیشتر از کلمه‌های راست‌به‌چپ باشد، انگلیسی حساب
  می‌شود و دست نمی‌خورد.
- بلوک کد تورفته (چهار فاصله) بیرون از فهرست‌ها تشخیص داده نمی‌شود؛ بلوک‌های
  ` ``` ` تشخیص داده می‌شوند.

### نقشهٔ راه

1. افزونهٔ Claude Code (همین مخزن) — نسخهٔ 0.2.0
2. افزونهٔ مرورگر برای claude.ai با همین موتور؛ در مرورگر می‌تواند برای متن
   راست‌به‌چپ فونت جدا هم بگذارد (با `unicode-range` در CSS)، کاری که از mod
   برنمی‌آید.
3. یک skill نوشتاری همراه برای مدل
4. گزارش مشکل به Anthropic همراه با همین نمونه‌های آزمون

### مشارکت

اگر سطری به زبان شما هنوز خراب نمایش داده می‌شود، یک issue باز کنید و متن را
همان‌طور که Claude نوشته، همراه با یک اسکرین‌شات بفرستید.

### مجوز

‏[MIT](LICENSE)

</div>

---

<div dir="rtl">

## العربية

عندما يحتوي ردّ Claude بالعربية على كلمات إنجليزية أو شيفرة أو أرقام مع وحدات،
تظهر الأسطر بترتيب خاطئ: السطر الذي يبدأ بكلمة إنجليزية يُعرض من اليسار إلى
اليمين، وتنقلب الأرقام مع وحداتها (‏`12.5 USD` تظهر ‏`USD 12.5`).

‏`rtl-fix` إضافة (mod) لـ Claude Code تضيف علامات اتجاه يونيكود غير مرئية قبل عرض
كل رسالة. **العرض فقط هو ما يتغيّر**: الرسالة المحفوظة وما يقرؤه النموذج وما
تنسخه يبقى كما كُتب. تعمل مع العربية والفارسية والأردية والعبرية وكل لغة تُكتب
من اليمين إلى اليسار، ومع الأرقام الهندية (٠-٩).

**التثبيت** في جلسة Claude Code في الطرفية:

</div>

```
/plugin install rtl-fix --marketplace Rozucci/Claude-RTL-Fix
```

<div dir="rtl">

اكتب `/rtl` لإيقافها أو تشغيلها. التفاصيل الكاملة في [القسم الإنجليزي](#english).

</div>

---

<div dir="rtl">

## עברית

כשתשובה של Claude בעברית כוללת מילים באנגלית, קוד או מספרים עם יחידות, השורות
מוצגות בסדר שגוי: שורה שמתחילה במילה באנגלית מוצגת משמאל לימין, ומספרים עם
יחידות מתהפכים (‏`12.5 USD` מוצג כ־‏`USD 12.5`).

‏`rtl-fix` הוא מוד (mod) ל־Claude Code שמוסיף סימני כיווניות בלתי נראים של Unicode
לפני שכל הודעה מוצגת. **רק התצוגה משתנה**: ההודעה השמורה, מה שהמודל קורא ומה
שאתם מעתיקים נשארים בדיוק כפי שנכתבו. הוא עובד עם עברית, ערבית, פרסית, אורדו
וכל שפה שנכתבת מימין לשמאל.

**התקנה** בסשן של Claude Code בטרמינל:

</div>

```
/plugin install rtl-fix --marketplace Rozucci/Claude-RTL-Fix
```

<div dir="rtl">

הקלידו `/rtl` כדי לכבות או להדליק אותו. הפרטים המלאים ב[חלק האנגלי](#english).

</div>
