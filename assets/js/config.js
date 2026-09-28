/* =========================================================
   10500.com — Site configuration (edit this file only)
   ========================================================= */
window.SITE_CONFIG = {
  siteName: "10500",
  siteUrl: "https://10500.com",

  // Google AdSense — paste your publisher ID after approval (e.g. "ca-pub-1234567890123456").
  // Leave empty to show house ads (sponsor/advertise promos) in every ad slot.
  adsenseClient: "",
  adsenseSlots: { leaderboard: "", incontent: "", sidebar: "", anchor: "" },

  // Google Analytics 4 measurement ID (e.g. "G-XXXXXXXXXX"). Loaded only after cookie consent.
  ga4: "",

  // Contact routing (encoded — do not paste a plain address anywhere in the site)
  _k: ["=02bj5Cb", "pFWbnBUMh", "N3ay92diV2d"],
  // Optional: after FormSubmit activation you receive a random alias string; paste it here
  // to avoid using the encoded address at all (e.g. "a1b2c3d4e5f6...").
  formAlias: "",

  // Donations / support rails. Empty values are hidden. PayPal uses the encoded contact
  // address automatically if paypalMe is empty and paypalDonate is true.
  paypalMe: "",          // e.g. "https://paypal.me/yourname"
  paypalDonate: true,
  kofi: "",              // e.g. "https://ko-fi.com/yourname"
  buyMeACoffee: "",      // e.g. "https://buymeacoffee.com/yourname"
  githubSponsors: "",    // e.g. "https://github.com/sponsors/yourname"
  stripeLink: "",        // e.g. Stripe Payment Link URL

  // Social / YouTube
  youtubeChannel: "",    // e.g. "https://www.youtube.com/@10500com"
  social: { x: "", instagram: "", tiktok: "", facebook: "", linkedin: "", pinterest: "" },

  // Top banner target
  interestUrl: "https://web.works/contact"
};
