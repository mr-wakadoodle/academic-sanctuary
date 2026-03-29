# The Academic Sanctuary

A financial planning platform for Indian STEM students pursuing MS in Finance (Quantitative Finance Track) at Boston College.

Built with React + Vite + Tailwind CSS.

## Local Development

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages

### One-time setup:

1. Create a new repo on GitHub named `academic-sanctuary`
2. Push this code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/academic-sanctuary.git
   git push -u origin main
   ```
3. Go to your repo → **Settings** → **Pages**
4. Under **Source**, select **GitHub Actions**
5. The workflow will auto-deploy on every push to `main`

### Your site will be live at:
```
https://YOUR_USERNAME.github.io/academic-sanctuary/
```

> **Important:** If your repo name is different from `academic-sanctuary`, update the `base` path in `vite.config.js` to match.
