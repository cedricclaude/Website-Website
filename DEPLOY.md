# Vitrine — Deploy zu Vercel

Das Git-Repo ist bereits fertig committet (Branch `main`). Es fehlt nur noch das
Verbinden mit GitHub + Vercel — das braucht deinen Browser-Login und dauert ~2 Min.

## Empfohlen: GitHub → Vercel (danach deployt jeder Push automatisch)

1. Leeres Repo anlegen: https://github.com/new  → Name z. B. `vitrine`
   (KEIN README/gitignore hinzufügen, es ist schon alles da).

2. Im Terminal (Git ist installiert):
   ```
   cd "C:\Users\cedri\OneDrive\Claude Code\Vitrine"
   git remote add origin https://github.com/<dein-github-name>/vitrine.git
   git push -u origin main
   ```
   (Beim ersten Push öffnet sich einmalig das GitHub-Login im Browser.)

3. https://vercel.com → **Add New → Project** → Repo `vitrine` importieren → **Deploy**.
   Vercel erkennt die statische Seite automatisch (kein Framework, keine Config nötig).
   Nach ~20 s bekommst du die Live-URL.

## Alternative: Vercel CLI (ohne GitHub, aber Node nötig)

1. Node.js installieren: https://nodejs.org
2. ```
   npm i -g vercel
   cd "C:\Users\cedri\OneDrive\Claude Code\Vitrine"
   vercel login
   vercel --prod
   ```

## Hinweis
`assets/hero.mp4` ist ~9,8 MB (das Hero-Scroll-Video). Lädt problemlos, ist aber der
grösste Brocken — bei Bedarf komprimieren.
