/* =====================================================================
   README Generator Pro — app.js
   Form-driven README.md builder with a live Markdown preview rendered by
   a small hand-written Markdown to HTML converter (no external library).
   Classic script (no modules). Depends on window.WUS (core.js).
   ===================================================================== */
(function () {
  'use strict';

  var WUS = window.WUS;
  var STORE_KEY = 'readmegen.state';

  /* ----------------------------- DOM refs ---------------------------- */
  var fProjectName    = document.getElementById('fProjectName');
  var fTagline        = document.getElementById('fTagline');

  var bLicense        = document.getElementById('bLicense');
  var fLicense        = document.getElementById('fLicense');
  var bBuild          = document.getElementById('bBuild');
  var bVersion        = document.getElementById('bVersion');
  var fVersion        = document.getElementById('fVersion');
  var bLanguage       = document.getElementById('bLanguage');
  var fLanguage       = document.getElementById('fLanguage');

  var fInstall        = document.getElementById('fInstall');
  var fUsage           = document.getElementById('fUsage');
  var fUsageLang       = document.getElementById('fUsageLang');

  var featureRows      = document.getElementById('featureRows');
  var btnAddFeature    = document.getElementById('btnAddFeature');

  var fContributing    = document.getElementById('fContributing');
  var fLicenseSection  = document.getElementById('fLicenseSection');

  var viewPreview      = document.getElementById('viewPreview');
  var viewMarkdown     = document.getElementById('viewMarkdown');

  var previewPane      = document.getElementById('previewPane');
  var markdownPane     = document.getElementById('markdownPane');
  var markdownCode     = document.getElementById('markdownCode');
  var emptyState       = document.getElementById('emptyState');
  var outputStats      = document.getElementById('outputStats');

  var btnCopy          = document.getElementById('btnCopy');
  var btnDownload       = document.getElementById('btnDownload');
  var btnReset          = document.getElementById('btnReset');

  var lastMarkdown = '';
  var currentView = 'preview';

  /* =================================================================
     BADGES
     ================================================================= */
  var LICENSE_COLORS = {
    'MIT': 'blue',
    'Apache-2.0': 'blue',
    'GPL-3.0': 'blue',
    'BSD-3-Clause': 'blue',
    'ISC': 'blue',
    'Unlicense': 'green',
    'MPL-2.0': 'orange'
  };

  function shieldsEscape(text) {
    return String(text).replace(/-/g, '--').replace(/_/g, '__').replace(/ /g, '_');
  }

  function licenseBadge(license) {
    var color = LICENSE_COLORS[license] || 'blue';
    return '![License](https://img.shields.io/badge/license-' + shieldsEscape(license) + '-' + color + '.svg)';
  }
  function buildBadge() {
    return '![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)';
  }
  function versionBadge(version) {
    var v = (version || '1.0.0').trim() || '1.0.0';
    return '![Version](https://img.shields.io/badge/version-' + shieldsEscape(v) + '-blue.svg)';
  }
  function languageBadge(language) {
    var l = (language || 'JavaScript').trim() || 'JavaScript';
    return '![Language](https://img.shields.io/badge/language-' + shieldsEscape(l) + '-yellow.svg)';
  }

  /* =================================================================
     FEATURE ROWS (repeatable, dynamically added -- event delegation)
     ================================================================= */
  function refreshFeatureEmptyState() {
    var hasRows = featureRows.querySelectorAll('.feature-row').length > 0;
    var placeholder = featureRows.querySelector('.feature-empty');
    if (!hasRows && !placeholder) {
      var p = document.createElement('p');
      p.className = 'feature-empty';
      p.textContent = 'No features added yet.';
      featureRows.appendChild(p);
    } else if (hasRows && placeholder) {
      placeholder.remove();
    }
  }

  function addFeatureRow(value, focus) {
    var placeholder = featureRows.querySelector('.feature-empty');
    if (placeholder) placeholder.remove();

    var row = document.createElement('div');
    row.className = 'feature-row';

    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'feature-input';
    input.placeholder = 'Fast, zero-dependency, offline-first';
    input.value = value || '';
    input.setAttribute('aria-label', 'Feature');

    var removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn--icon btn--ghost feature-remove';
    removeBtn.title = 'Remove feature';
    removeBtn.setAttribute('aria-label', 'Remove feature');
    removeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';

    row.appendChild(input);
    row.appendChild(removeBtn);
    featureRows.appendChild(row);

    if (focus) input.focus();
    return row;
  }

  function getFeatureValues() {
    return Array.prototype.map.call(featureRows.querySelectorAll('.feature-input'), function (el) {
      return el.value;
    });
  }

  /* Delegated click/input handling -- rows are added/removed dynamically. */
  featureRows.addEventListener('click', function (e) {
    var removeBtn = e.target.closest ? e.target.closest('.feature-remove') : null;
    if (!removeBtn) return;
    var row = removeBtn.closest('.feature-row');
    if (row) row.remove();
    refreshFeatureEmptyState();
    persist();
    render();
  });
  featureRows.addEventListener('input', function (e) {
    if (!e.target.classList.contains('feature-input')) return;
    persistDebounced();
    renderDebounced();
  });

  btnAddFeature.addEventListener('click', function () {
    addFeatureRow('', true);
    persist();
    render();
  });

  /* =================================================================
     MARKDOWN ASSEMBLY -- build the raw README.md text from form state
     ================================================================= */
  function getState() {
    return {
      projectName: fProjectName.value,
      tagline: fTagline.value,
      bLicense: bLicense.checked,
      license: fLicense.value,
      bBuild: bBuild.checked,
      bVersion: bVersion.checked,
      version: fVersion.value,
      bLanguage: bLanguage.checked,
      language: fLanguage.value,
      install: fInstall.value,
      usageLang: fUsageLang.value,
      usage: fUsage.value,
      features: getFeatureValues(),
      contributing: fContributing.checked,
      licenseSection: fLicenseSection.checked
    };
  }

  function isStateEmpty(state) {
    return !state.projectName.trim() &&
      !state.tagline.trim() &&
      !state.install.trim() &&
      !state.usage.trim() &&
      !state.features.some(function (f) { return f.trim(); }) &&
      !state.contributing &&
      !state.licenseSection &&
      !state.bLicense && !state.bBuild && !state.bVersion && !state.bLanguage;
  }

  function buildMarkdown(state) {
    var lines = [];
    var name = state.projectName.trim() || 'Project Name';
    lines.push('# ' + name);
    lines.push('');

    var badges = [];
    if (state.bLicense) badges.push(licenseBadge(state.license));
    if (state.bBuild) badges.push(buildBadge());
    if (state.bVersion) badges.push(versionBadge(state.version));
    if (state.bLanguage) badges.push(languageBadge(state.language));
    if (badges.length) {
      lines.push(badges.join(' '));
      lines.push('');
    }

    if (state.tagline.trim()) {
      lines.push(state.tagline.trim());
      lines.push('');
    }

    if (state.install.trim()) {
      lines.push('## Installation');
      lines.push('');
      lines.push('```bash');
      lines.push(state.install.trim());
      lines.push('```');
      lines.push('');
    }

    if (state.usage.trim()) {
      lines.push('## Usage');
      lines.push('');
      lines.push('```' + (state.usageLang || 'text'));
      lines.push(state.usage.replace(/\n+$/, ''));
      lines.push('```');
      lines.push('');
    }

    var features = state.features.filter(function (f) { return f.trim(); });
    if (features.length) {
      lines.push('## Features');
      lines.push('');
      features.forEach(function (f) { lines.push('- ' + f.trim()); });
      lines.push('');
    }

    if (state.contributing) {
      lines.push('## Contributing');
      lines.push('');
      lines.push('Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.');
      lines.push('');
      lines.push('Please make sure to update tests as appropriate.');
      lines.push('');
    }

    if (state.licenseSection) {
      var lic = state.bLicense ? state.license : 'MIT';
      lines.push('## License');
      lines.push('');
      lines.push('This project is licensed under the ' + lic + ' License.');
      lines.push('');
    }

    return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  }

  /* =================================================================
     MARKDOWN TO HTML RENDERER
     A small, dependency-free renderer covering: headings, bold, italic,
     inline code, fenced code blocks, links, images, unordered lists,
     blockquotes, horizontal rules and paragraphs. The entire input is
     HTML-escaped up front, so nothing the user types can inject raw
     HTML or break the preview layout.
     ================================================================= */
  function renderInline(text) {
    // Images: ![alt](url) -- the whole document was HTML-escaped up front,
    // so an optional "title" (which would need a literal quote) can't be
    // matched here; titles are simply not supported.
    text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (m, alt, url) {
      return '<img src="' + url + '" alt="' + alt + '">';
    });
    // Links: [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, t, url) {
      return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + t + '</a>';
    });
    // Bold: **text** or __text__
    text = text.replace(/\*\*([^*]+)\*\*|__([^_]+)__/g, function (m, a, b) {
      return '<strong>' + (a || b) + '</strong>';
    });
    // Italic: *text* or _text_
    text = text.replace(/\*([^*]+)\*|_([^_]+)_/g, function (m, a, b) {
      return '<em>' + (a || b) + '</em>';
    });
    // Inline code: `code`
    text = text.replace(/`([^`]+)`/g, function (m, c) {
      return '<code>' + c + '</code>';
    });
    return text;
  }

  var CODE_FENCE_RE = /```([a-zA-Z0-9_+-]*)\n?([\s\S]*?)```/g;
  var CODE_PLACEHOLDER_RE = /^CBLOCK-(\d+)-CBLOCK$/;
  var IMAGE_ONLY_RE = /^(!\[[^\]]*\]\([^)\s]+\)\s*)+$/;

  function renderMarkdown(raw) {
    if (!raw) return '';

    // Escape everything first -- markdown punctuation (# * _ ` [ ] ( ) > -)
    // survives HTML-escaping untouched, so the transforms below still work.
    var esc = WUS.escapeHtml(raw);

    // Pull fenced code blocks out first so inline rules never touch them.
    var codeBlocks = [];
    esc = esc.replace(CODE_FENCE_RE, function (m, lang, code) {
      var idx = codeBlocks.length;
      var body = code.replace(/\n$/, '');
      var cls = lang ? ' class="lang-' + WUS.escapeHtml(lang) + '"' : '';
      codeBlocks.push('<pre><code' + cls + '>' + body + '</code></pre>');
      return 'CBLOCK-' + idx + '-CBLOCK';
    });

    var lines = esc.split('\n');
    var out = [];
    var para = [];
    var i = 0;

    function flushPara() {
      if (para.length) {
        out.push('<p>' + para.join('<br>') + '</p>');
        para = [];
      }
    }

    while (i < lines.length) {
      var line = lines[i];
      var trimmed = line.trim();

      var cbMatch = CODE_PLACEHOLDER_RE.exec(trimmed);
      if (cbMatch) {
        flushPara();
        out.push(codeBlocks[Number(cbMatch[1])]);
        i++;
        continue;
      }

      if (!trimmed) { flushPara(); i++; continue; }

      if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
        flushPara();
        out.push('<hr>');
        i++;
        continue;
      }

      var hMatch = /^(#{1,6})\s+(.*)$/.exec(line);
      if (hMatch) {
        flushPara();
        var level = hMatch[1].length;
        out.push('<h' + level + '>' + renderInline(hMatch[2]) + '</h' + level + '>');
        i++;
        continue;
      }

      // Note: the line has already been HTML-escaped, so a literal ">"
      // markdown blockquote marker now reads as the entity "&gt;".
      if (/^&gt;\s?/.test(line)) {
        flushPara();
        var quoteLines = [];
        while (i < lines.length && /^&gt;\s?/.test(lines[i])) {
          quoteLines.push(renderInline(lines[i].replace(/^&gt;\s?/, '')));
          i++;
        }
        out.push('<blockquote>' + quoteLines.join('<br>') + '</blockquote>');
        continue;
      }

      if (/^[-*]\s+/.test(line)) {
        flushPara();
        var items = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
          items.push('<li>' + renderInline(lines[i].replace(/^[-*]\s+/, '')) + '</li>');
          i++;
        }
        out.push('<ul>' + items.join('') + '</ul>');
        continue;
      }

      if (IMAGE_ONLY_RE.test(trimmed)) {
        flushPara();
        out.push('<div class="badge-row">' + renderInline(trimmed) + '</div>');
        i++;
        continue;
      }

      para.push(renderInline(line));
      i++;
    }
    flushPara();
    return out.join('\n');
  }

  /* =================================================================
     VIEW TOGGLE -- Preview / Markdown segmented control
     ================================================================= */
  function setView(view) {
    currentView = view;
    viewPreview.classList.toggle('is-active', view === 'preview');
    viewPreview.setAttribute('aria-selected', view === 'preview' ? 'true' : 'false');
    viewMarkdown.classList.toggle('is-active', view === 'markdown');
    viewMarkdown.setAttribute('aria-selected', view === 'markdown' ? 'true' : 'false');
    previewPane.hidden = view !== 'preview';
    markdownPane.hidden = view !== 'markdown';
  }
  viewPreview.addEventListener('click', function () { setView('preview'); persist(); });
  viewMarkdown.addEventListener('click', function () { setView('markdown'); persist(); });

  /* =================================================================
     RENDER -- assemble markdown + render preview + update stats
     ================================================================= */
  function render() {
    var state = getState();
    var empty = isStateEmpty(state);

    if (empty) {
      lastMarkdown = '';
      previewPane.innerHTML = '';
      markdownCode.textContent = '';
      outputStats.textContent = '';
      emptyState.classList.remove('is-hidden');
      return;
    }

    var md = buildMarkdown(state);
    lastMarkdown = md;
    markdownCode.textContent = md;
    previewPane.innerHTML = renderMarkdown(md);
    emptyState.classList.add('is-hidden');
    outputStats.textContent = md.split('\n').length + ' lines · ' + md.length.toLocaleString() + ' chars';
  }
  var renderDebounced = WUS.debounce(render, 150);

  /* =================================================================
     COPY / DOWNLOAD
     ================================================================= */
  function copyMarkdown() {
    if (!lastMarkdown.trim()) { WUS.toast('Nothing to copy yet', 'error'); return; }
    WUS.copy(lastMarkdown, 'README.md copied to clipboard');
  }
  function downloadMarkdown() {
    if (!lastMarkdown.trim()) { WUS.toast('Nothing to download yet', 'error'); return; }
    WUS.download('README.md', lastMarkdown, 'text/markdown;charset=utf-8');
    WUS.toast('Downloaded README.md');
  }
  btnCopy.addEventListener('click', copyMarkdown);
  btnDownload.addEventListener('click', downloadMarkdown);

  /* =================================================================
     RESET
     ================================================================= */
  function resetForm() {
    fProjectName.value = '';
    fTagline.value = '';
    bLicense.checked = false;
    fLicense.value = 'MIT';
    bBuild.checked = false;
    bVersion.checked = false;
    fVersion.value = '1.0.0';
    bLanguage.checked = false;
    fLanguage.value = 'JavaScript';
    fInstall.value = '';
    fUsage.value = '';
    fUsageLang.value = 'bash';
    fContributing.checked = false;
    fLicenseSection.checked = false;
    featureRows.innerHTML = '';
    refreshFeatureEmptyState();
    WUS.store.remove(STORE_KEY);
    render();
    fProjectName.focus();
    WUS.toast('Form reset');
  }
  btnReset.addEventListener('click', resetForm);

  /* =================================================================
     PERSISTENCE
     ================================================================= */
  function persist() {
    WUS.store.set(STORE_KEY, {
      view: currentView,
      form: getState()
    });
  }
  var persistDebounced = WUS.debounce(persist, 300);

  function restore() {
    var saved = WUS.store.get(STORE_KEY, null);
    if (saved && saved.form) {
      var s = saved.form;
      fProjectName.value = s.projectName || '';
      fTagline.value = s.tagline || '';
      bLicense.checked = !!s.bLicense;
      fLicense.value = s.license || 'MIT';
      bBuild.checked = !!s.bBuild;
      bVersion.checked = !!s.bVersion;
      fVersion.value = s.version || '1.0.0';
      bLanguage.checked = !!s.bLanguage;
      fLanguage.value = s.language || 'JavaScript';
      fInstall.value = s.install || '';
      fUsage.value = s.usage || '';
      fUsageLang.value = s.usageLang || 'bash';
      fContributing.checked = !!s.contributing;
      fLicenseSection.checked = !!s.licenseSection;

      featureRows.innerHTML = '';
      if (Array.isArray(s.features)) {
        s.features.forEach(function (f) { addFeatureRow(f, false); });
      }
    }
    refreshFeatureEmptyState();
    setView(saved && saved.view === 'markdown' ? 'markdown' : 'preview');
    render();
  }

  /* Wire form-field change/input listeners to persist + re-render. */
  [fProjectName, fTagline, fLicense, fVersion, fLanguage, fInstall, fUsage, fUsageLang]
    .forEach(function (elx) {
      elx.addEventListener('input', function () { persistDebounced(); renderDebounced(); });
      elx.addEventListener('change', function () { persist(); render(); });
    });
  [bLicense, bBuild, bVersion, bLanguage, fContributing, fLicenseSection]
    .forEach(function (elx) {
      elx.addEventListener('change', function () { persist(); render(); });
    });

  /* =================================================================
     SHORTCUTS HELP MODAL
     ================================================================= */
  var helpBackdrop = document.getElementById('helpBackdrop');
  var helpClose    = document.getElementById('helpClose');
  var shortcutRows = document.getElementById('shortcutRows');

  var SHORTCUTS = [
    { keys: ['mod', 'C'], desc: 'Copy Markdown' },
    { keys: ['mod', 'S'], desc: 'Download README.md' },
    { keys: ['?'], desc: 'Show this help' },
    { keys: ['Esc'], desc: 'Close dialog' }
  ];

  function buildShortcutTable() {
    var html = '';
    SHORTCUTS.forEach(function (s) {
      var kbds = s.keys.map(function (k) { return '<kbd>' + WUS.escapeHtml(k) + '</kbd>'; }).join('');
      html += '<tr><td>' + WUS.escapeHtml(s.desc) + '</td><td>' + kbds + '</td></tr>';
    });
    shortcutRows.innerHTML = html;
  }

  function openHelp() { helpBackdrop.hidden = false; helpClose.focus(); }
  function closeHelp() { helpBackdrop.hidden = true; }

  helpClose.addEventListener('click', closeHelp);
  helpBackdrop.addEventListener('click', function (e) {
    if (e.target === helpBackdrop) closeHelp();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !helpBackdrop.hidden) closeHelp();
  });

  var helpBtns = document.querySelectorAll('[data-shortcut-help]');
  for (var i = 0; i < helpBtns.length; i++) helpBtns[i].addEventListener('click', openHelp);

  /* Global keyboard shortcuts via WUS. */
  WUS.registerShortcut('mod+c', function () { copyMarkdown(); }, 'Copy Markdown');
  WUS.registerShortcut('mod+s', function () { downloadMarkdown(); }, 'Download README.md');
  WUS.registerShortcut('?', function () { openHelp(); }, 'Show shortcuts');

  /* =================================================================
     INIT
     ================================================================= */
  buildShortcutTable();
  restore();
})();
