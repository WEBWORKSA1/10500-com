---
layout: null
---
window.SEARCH_INDEX=[{% for p in site.html_pages %}{% unless p.noindex %}{% assign u = p.url | remove_first: "/" %}{% if u == "" %}{% assign u = "index.html" %}{% endif %}{"u":{{ u | jsonify }},"t":{{ p.title | jsonify }},"d":{{ p.description | jsonify }},"k":{{ p.keywords | default: "" | jsonify }}},{% endunless %}{% endfor %}];
