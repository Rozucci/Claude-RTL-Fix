import { fixBidi } from '../claude-code-mod/rtl-fix/hooks/bidi'
import { mkdirSync, writeFileSync } from 'node:fs'

// Writes one HTML page per language and state into the folder given as the
// first argument; scripts/make-demo.sh turns them into the demo GIF and MP4.
const out = process.argv[2] ?? 'demo-frames'
mkdirSync(out, { recursive: true })

const langs: { id: string; name: string; text: string }[] = [
  {
    id: 'fa',
    name: 'Persian · فارسی',
    text: `Astro یک فریم‌ورک برای ساخت سایت است.

- نصب با \`npm install\` انجام می‌شود.
- React و TypeScript هم پشتیبانی می‌شوند.

قیمت 12.5 USD، دمای 25°C و سرعت 100 km/h است.`,
  },
  {
    id: 'ar',
    name: 'Arabic · العربية',
    text: `Python لغة برمجة شائعة.

- التثبيت عبر \`pip install requests\`.
- Django و Flask إطاران مشهوران.

السعر 12.5 USD، والحرارة 25°C، والسرعة 100 km/h.`,
  },
  {
    id: 'he',
    name: 'Hebrew · עברית',
    text: `React היא ספרייה פופולרית לבניית ממשקים.

- התקנה עם \`npm install react\`.
- Next.js ו-Vite עובדים איתה מצוין.

המחיר 12.5 USD, הטמפרטורה 25°C והמהירות 100 km/h.`,
  },
]

const page = (name: string, state: 'off' | 'on', md: string) => `<!doctype html><html><head><meta charset="utf-8">
<script src="https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js"></script>
<style>
*{box-sizing:border-box}
body{margin:0;background:#f4f2ee;font:18px/1.75 -apple-system,system-ui,sans-serif;color:#1d1b18}
.win{width:860px;margin:0 auto;padding:22px 28px 16px}
.top{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.title{font-weight:600;font-size:17px;color:#57524a}
.pill{font:600 15px/1 -apple-system,system-ui,sans-serif;padding:9px 16px;border-radius:999px}
.pill.off{background:#f6dcd6;color:#8a2a1c}.pill.on{background:#d9ecd9;color:#21612b}
.card{background:#fff;border:1px solid #e2ddd4;border-radius:14px;padding:12px 28px;height:330px}
.card p,.card li{margin:10px 0}
.card ul{padding-inline-start:24px;margin:6px 0}
code{background:#f0ece4;padding:1px 5px;border-radius:4px;font:16px ui-monospace,Menlo,monospace}
.note{margin-top:12px;font-size:13px;color:#7a746a;text-align:center}
</style></head><body><div class="win">
<div class="top"><div class="title">${name}</div><div class="pill ${state}">rtl-fix: ${state}</div></div>
<div class="card" id="c"></div>
<div class="note">Drawn by Chromium with per-paragraph auto direction, as the Claude desktop app does. &ldquo;On&rdquo; is the exact text rtl-fix draws.</div>
</div><script>
c.innerHTML=marked.parse(${JSON.stringify(md)});
c.querySelectorAll('p,li').forEach(e=>e.setAttribute('dir','auto'));
</script></body></html>`

for (const l of langs) {
  writeFileSync(`${out}/${l.id}-off.html`, page(l.name, 'off', l.text))
  writeFileSync(`${out}/${l.id}-on.html`, page(l.name, 'on', fixBidi(l.text)))
}
