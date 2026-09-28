# 10500.com — Idea Selection & Phase-Wise Build Prompt

## A. Idea selection (scored 1–5)

| Idea | Search volume | RPM / CPC | Lead value | Moat / fit with "10500" | Build cost | Total |
|---|---|---|---|---|---|---|
| **Chinese Numbers, Luck & Prosperity Hub** (tools + guides + China business concierge) | 5 | 3 | 4 | 5 | 4 | **21** |
| China salary / cost-of-living site only | 3 | 4 | 2 | 4 | 4 | 17 |
| Mandarin-learning course site | 4 | 3 | 3 | 3 | 2 | 15 |
| China sourcing agency landing page only | 2 | 5 | 5 | 2 | 3 | 17 |
| Generic numerology site | 4 | 2 | 2 | 1 | 4 | 13 |

**Winner:** a hybrid. Free tools pull traffic (numbers, luck, zodiac, hongbao, 大写 conversion, China salary); guides and videos keep people reading; the Concierge sells high-value leads (China sourcing, market entry, translation, naming & number consulting, feng shui, premium-number brokerage).

### Revenue model (assumptions, not guarantees)
- **Traffic:** tool pages reach ~50–150k monthly sessions by month 12 with ~40 guide/tool pages and steady publishing.
- **AdSense:** blended page RPM of $4–$12 (finance/business/education queries pay more than culture queries) → ~$600–$3,500/mo at 150k pageviews.
- **Leads:** 0.5–1.5% of tool users submit the form. B2B sourcing and market-entry leads resell or refer at $50–$250 each; consults convert at $49–$299.
- **YouTube:** Shorts built from each tool ("Is your phone number lucky?") drive traffic back to the site and earn YouTube Partner revenue.
- **Also:** sponsorships (from $299/mo), affiliate programs (tutors, red envelopes, books, VPN/eSIM for China travel), donations, and paid contest entries from sponsors.

## B. Phase-wise build prompt (copy-paste to any AI/dev team)

### Phase 0 — Guardrails
> Build a static, dependency-free site (HTML/CSS/vanilla JS) hostable on GitHub Pages free tier. Use relative URLs so it works under `/10500-com/` and at the apex domain. Only one contact email is used, and it must never appear in HTML, JS source as plain text, or on screen. Encode it in JS and assemble it only on click or submit. Every page's first element is a banner: "Contact, if you are interested in this website / domain name / Sponsorship / Advertisement / Partnership" → https://web.works/contact. Do not use "10500" as a claimed trademark; add a trademark/copyright disclosure page.

### Phase 1 — Brand, design system, layout
> Create a brand called "10500 — Numbers · Luck · Prosperity" (一万零五百) with a Chinese-red, gold and ink palette, CSS variables, light/dark themes, a mobile-first 12-column layout and system fonts plus Noto Sans SC. Build a shared header with a mega-nav (Tools, Learn, Business, Videos, Community, Support), a sticky "Get Expert Help" CTA, a footer with a 4-column sitemap, a newsletter form, and a legal strip. Add a cookie-consent banner, skip-link, ARIA labels and prefers-reduced-motion support.

### Phase 2 — Traffic tools
> Build each tool page on this template: tool → result card → share link → "how it works" → examples → FAQ (with FAQPage JSON-LD) → sources → related tools → lead CTA.
> 1. Lucky Number Analyzer (phone, plate, address, price, date, domain): score 0–100, digit-by-digit meanings, combos (8, 88, 168, 518, 666, 888, 520, 1314; penalties for 4, 14, 514, 74, 250), extra weight on the last digits, digit-by-digit Chinese reading with yāo.
> 2. Chinese Number Converter: Arabic ⇄ Chinese, 大写 financial with 元角分整, simplified/traditional, pinyin with tones, reverse parsing, copy buttons, cheque preview.
> 3. Red Envelope Calculator: occasion × relationship × region × closeness → lucky-snapped amount, avoiding 4, in local currency; funerals use odd amounts.
> 4. Chinese Zodiac & Lunar Date: accurate lunar-year boundary using Intl's Chinese calendar; animal, element, yin/yang, lunar date, compatibility (trine, six harmony, clash, harm).
> 5. China Salary & Tax Calculator: annual IIT brackets, ¥5,000/month threshold, editable social insurance (default 8/2/0.5 = 10.5%), housing fund, special deductions; show net pay, a breakdown bar, and how the salary compares with the NBS average (¥129,441/yr, 2025).

### Phase 3 — Content & SEO
> Pages: Number Meanings database (0–9 + 40 combos, searchable and filterable), Learn Chinese Numbers (levels, speech synthesis, quiz game with streaks), Videos hub (lite YouTube facade, no-cookie), China Business Guide, and a Blog with 6 or more long-form articles (why 10,500 ≠ 一万五, lucky-numbers guide, hongbao etiquette, numeric domains in China, China wages 2025, business number etiquette). Add schema.org (WebSite, Organization, Article, FAQPage, BreadcrumbList), sitemap.xml, robots.txt, OpenGraph/Twitter cards, canonical URLs, and client-side site search.

### Phase 4 — Lead generation (the money section)
> Concierge page with 6 service cards (each with "when to use this" and a "from" price), a multi-step form (service → details → budget/timeline → contact + preferred channel → consent), a progress bar, a honeypot, inline validation, UTM/referrer capture, and a thank-you page. Add in-content CTAs every 2–3 sections, a post-result CTA on every tool, an exit-intent modal (once per session), and a "Free Lucky Number Report" email capture.

### Phase 5 — Monetization
> AdSense-ready slots (header leaderboard, in-content, sidebar, sticky mobile anchor) driven by a config file; when no publisher ID is set, show house ads for sponsorship. Add ads.txt, a YouTube channel CTA, affiliate slots, an Advertise/Sponsorship page with rate card and packages, and Partnership inquiry forms.

### Phase 6 — Community & support
> Support page: preset donation amounts, custom amount and message, configurable payment rails (PayPal, Ko-fi, Buy Me a Coffee, GitHub Sponsors), a transparent use-of-funds breakdown (operations, marketing, hiring, prizes), and supporter tiers. Contests page: monthly challenge, prize pool, entry form, referral bonus entries, official rules. Careers page: open roles plus an application form.

### Phase 7 — Legal & trust
> Privacy (including AdSense/cookies, GDPR/CCPA/PIPEDA), Terms, Disclaimer ("entertainment and education only; not financial, legal or tax advice"), a Trademark & Copyright disclosure, Contest rules, and a 404 page.

### Phase 8 — Deploy & grow
> Push to GitHub, publish with GitHub Pages, and add a CNAME once DNS points to GitHub (A records 185.199.108–111.153). Submit to Search Console, apply for AdSense after about 20 quality pages, publish 2 articles and 5 Shorts a week, and A/B test the lead-form CTA.
