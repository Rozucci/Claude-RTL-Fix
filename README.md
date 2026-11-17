# Claude-RTL-Fix

Fixes mixed Persian/English (RTL/LTR) text in Claude's interfaces.
رفع قاطی‌شدن متن فارسی و انگلیسی در رابط‌های Claude.

[English](#english) · [فارسی](#فارسی)

---

## English

### The problem

When a Persian (or Arabic) reply contains English words, code, numbers or
links, Claude's interfaces often draw it in the wrong order: a line that starts
with an English word is laid out left to right, punctuation jumps to the wrong
end, and `Claude Code (v2)` style runs pull brackets and dots across the line.

### What this does

`rtl-fix` is a Claude Code mod. It changes **only what is drawn**: the stored
message, what the model reads and what you copy stay exactly as written.

It adds invisible Unicode direction marks to each message before it is drawn:

| Where | What it adds |
| --- | --- |
| A line that is mostly Persian/Arabic | `RLM` + `RLI` … `PDI` around its content |
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
/plugin install rtl-fix --marketplace ShayanTheCreator/Claude-RTL-Fix
```

Answer `y` to add the marketplace, then pick a scope (user scope is first).

From a shell:

```bash
claude plugin install rtl-fix --marketplace ShayanTheCreator/Claude-RTL-Fix
```

In the desktop app, where `/plugin` does not run: click **+** next to the prompt
box, then **Plugins**, **Add marketplace** with `ShayanTheCreator/Claude-RTL-Fix`,
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

### Known limits

- **Alignment.** Persian lines read right to left but are not flush right: the
  Claude Code mod API offers `dir="rtl"` only on plain `Text`, not on a rendered
  Markdown reply.
- **Table columns** keep left-to-right order in the terminal; only the text
  inside each cell is fixed.
- A terminal that reorders text by itself may draw the result differently.
- Indented (4-space) code blocks outside lists are not detected; fenced blocks are.

### Roadmap

1. Claude Code mod (this repository) — v0.2.0.
2. Browser extension for claude.ai, reusing the same engine.
3. A companion writing skill for the model.
4. Test corpus, before/after video and an issue report to Anthropic.

### License

[MIT](LICENSE)

---

<div dir="rtl">

## فارسی

### مشکل

وقتی پاسخ فارسی Claude کلمهٔ انگلیسی، کد، عدد یا لینک دارد، رابط‌های Claude
اغلب آن را به ترتیب غلط نشان می‌دهند: سطری که با یک کلمهٔ انگلیسی شروع شود
چپ‌به‌راست چیده می‌شود، علامت‌های نگارشی به سر دیگر سطر می‌پرند و پرانتز و نقطه
جابه‌جا می‌شوند.

### این افزونه چه می‌کند

‏`rtl-fix` یک mod برای Claude Code است و **فقط نمایش** را عوض می‌کند. پیام
ذخیره‌شده، چیزی که مدل می‌خواند و چیزی که کپی می‌کنید دقیقاً همان می‌ماند که
نوشته شده.

پیش از نمایش هر پیام، نشانه‌های نامرئی جهت یونیکد اضافه می‌کند:

- دور هر سطری که بیشترش فارسی است: ‏`RLM` + `RLI` … `PDI`
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
/plugin install rtl-fix --marketplace ShayanTheCreator/Claude-RTL-Fix
```

<div dir="rtl">

برای افزودن marketplace حرف `y` را بزنید و بعد محدوده را انتخاب کنید (اولی،
یعنی user، پیشنهاد می‌شود).

از shell:

</div>

```bash
claude plugin install rtl-fix --marketplace ShayanTheCreator/Claude-RTL-Fix
```

<div dir="rtl">

در اپ دسکتاپ، که `/plugin` در آن اجرا نمی‌شود: روی **+** کنار جعبهٔ پیام بزنید،
بعد **Plugins**، بعد **Add marketplace** با `ShayanTheCreator/Claude-RTL-Fix` و
در آخر **Add plugin**. افزونه‌ای که از ترمینال در محدودهٔ user نصب شود، در تب
Code اپ دسکتاپ هم بار می‌شود.

### استفاده

بعد از نصب خودش کار می‌کند. با `/rtl` خاموش و دوباره روشنش کنید.

### محدودیت‌های فعلی

- **چینش راست:** سطرهای فارسی درست از راست به چپ خوانده می‌شوند ولی به لبهٔ
  راست نمی‌چسبند، چون API افزونه‌های Claude Code فعلاً `dir="rtl"` را فقط برای
  متن ساده دارد، نه برای پاسخ Markdown.
- **ستون‌های جدول** در ترمینال همچنان از چپ به راست چیده می‌شوند؛ فقط متن داخل
  هر خانه درست می‌شود.
- ترمینالی که خودش متن را بازچینی می‌کند ممکن است نتیجه را متفاوت نشان دهد.
- بلوک کد تورفته (چهار فاصله) بیرون از فهرست‌ها تشخیص داده نمی‌شود؛ بلوک‌های
  ` ``` ` تشخیص داده می‌شوند.

### نقشهٔ راه

1. افزونهٔ Claude Code (همین مخزن) — نسخهٔ 0.2.0
2. افزونهٔ مرورگر برای claude.ai با همین موتور
3. یک skill نوشتاری همراه برای مدل
4. مجموعهٔ نمونه‌های آزمون، ویدیوی قبل و بعد، و گزارش مشکل به Anthropic

### مجوز

‏[MIT](LICENSE)

</div>
