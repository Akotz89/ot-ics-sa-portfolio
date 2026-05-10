// nav.js — Shared portfolio navigation (auto-injects into any page)
(function() {
  // Detect depth: whiteboard/ and discovery/ are one level deep
  const path = window.location.pathname;
  const inSubdir = /\/(whiteboard|discovery)\//.test(path);
  const prefix = inSubdir ? '../' : '';

  const pages = [
    { href: 'scenario.html',     label: 'Scenario',        stage: '0' },
    { href: 'discovery/index.html', label: 'Discovery',  stage: '1' },
    { href: 'architecture.html', label: 'Architecture',    stage: '2' },
    { href: 'demo.html',         label: 'Demo',            stage: '3' },
    { href: 'poc-report.html',   label: 'PoC Report',      stage: '4' },
    { href: 'rfp-response.html', label: 'RFP Response',    stage: '5' },
    { href: 'arb-brief.html',    label: 'ARB Brief',       stage: '6' },
  ];

  const tools = [
    { href: 'whiteboard/index.html', label: 'Whiteboard', badge: 'NEW' },
    { href: 'diagrams.html', label: 'Diagrams',   badge: null },
  ];

  // Determine which page is active
  function isActive(href) {
    const normalized = href.replace(/\/$/, '/index.html');
    // Don't match root index.html when we're in a subdirectory
    if (href === 'index.html' && inSubdir) return false;
    return path.endsWith(href) || path.endsWith(normalized) ||
           (href === 'index.html' && (path.endsWith('/') || path.endsWith('/index.html')));
  }

  // Build nav HTML
  let html = '<nav class="portfolio-nav" role="navigation" aria-label="Portfolio">';
  html += `<a class="nav-brand" href="${prefix}index.html">⬢ <span>SA Portfolio</span></a>`;
  html += '<div class="nav-links">';

  pages.forEach(p => {
    const cls = isActive(p.href) ? ' active' : '';
    const stageTag = p.stage !== null ? `<span style="opacity:.5;margin-right:2px">${p.stage}.</span>` : '';
    html += `<a class="nav-link${cls}" href="${prefix}${p.href}">${stageTag}${p.label}</a>`;
  });

  html += '<div class="nav-sep"></div>';

  tools.forEach(t => {
    const cls = isActive(t.href) ? ' active' : '';
    const badge = t.badge ? `<span class="nav-badge">${t.badge}</span>` : '';
    html += `<a class="nav-link${cls}" href="${prefix}${t.href}">🛠 ${t.label}${badge}</a>`;
  });

  html += '</div></nav>';

  // Inject at top of body
  document.body.insertAdjacentHTML('afterbegin', html);
})();
