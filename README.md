# 10500.com — Numbers · Luck · Prosperity (一万零五百)

This is a static website with no dependencies, built for **GitHub Pages (free plan)**. It offers Chinese-number tools, guides, videos, an expert-concierge lead desk, donations, contests, careers, and advertising and sponsorship pages.

- Live (GitHub Pages): https://webworksa1.github.io/10500-com/
- Planned domain: https://10500.com

## How publishing works
Edit sources on `main`. The GitHub Actions workflow `.github/workflows/pages.yml` runs `python3 _build/build.py` on every push and publishes the generated site to the `gh-pages` branch, which GitHub Pages serves.

## Structure
```
_src/pages/*.html     page sources (META JSON header + body)
_src/blog/*.html      article sources
_build/build.py       builder → writes root *.html, /blog, sitemap.xml, search index
assets/css/style.css  design system (light/dark)
assets/js/config.js   ← EDIT ME: AdSense ID, GA4, donation links, YouTube channel
assets/js/main.js     nav, theme, forms, ads, consent, modal, share, search
assets/js/numbers.js  Chinese number engine (小写/大写/traditional/pinyin/reverse)
assets/js/tools.js    analyzer, converter, hongbao, zodiac, salary, quiz, lead form, donate, contest
project-docs/         research, competitor audit, phase-wise build prompt
```

## Build locally
```bash
python3 _build/build.py
```
Edit files in `_src/`. Generated HTML is rebuilt automatically by the workflow.

## Go-live checklist
1. **Forms (FormSubmit):** the first form submission triggers a one-time activation email to the site inbox. Click *Activate*. Optionally paste the random alias FormSubmit gives you into `formAlias` in `config.js`.
2. **Custom domain:** at your registrar, point `10500.com` A records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`, and add CNAME `www` → `webworksa1.github.io`. Then set the custom domain in Settings → Pages and enable *Enforce HTTPS*.
3. **AdSense:** apply once the domain is live, then put the publisher ID in `config.js` → `adsenseClient` and update `ads.txt`.
4. **Analytics:** add the GA4 ID in `config.js` → `ga4`. It loads only after cookie consent.
5. **Donations:** PayPal works automatically through the encoded site address. Add Ko-fi, Buy Me a Coffee, GitHub Sponsors or Stripe links in `config.js`.
6. **YouTube:** set `youtubeChannel` in `config.js`.
7. Submit `sitemap.xml` to Google Search Console and Bing Webmaster Tools.

## Contact address policy
The single contact address is **never** written in plain text anywhere in the site. It is stored encoded in `config.js` and assembled in the browser only when someone clicks an email link or submits a form.

## Legal
See `disclaimer.html#trademark` for the Trademark & Copyright disclosure. © 10500.com.
