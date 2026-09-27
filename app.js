const $ = id => document.getElementById(id);
const canvas = $('canvas');
const ctx = canvas.getContext('2d');
const state = { template: 'debate', palette: 'sport', photoObj: null, logoObj: null, video: null, videoUrl: null };
const templates = [
  ['debate', '💬', 'විවාදය'], ['sports', '🏏', 'ක්‍රීඩා'], ['breaking', '🚨', 'Breaking'],
  ['quote', '❝', 'Quote'], ['score', '🏆', 'Score'], ['entertain', '🎬', 'Entertainment'],
  ['community', '🌿', 'Community'], ['versus', '⚡', 'VS / Poll']
];
const palettes = {
  news: ['#f04438', '#171d35', '#ffb547'], sport: ['#21c98a', '#082941', '#b7ef50'],
  gold: ['#ffc638', '#29180f', '#f5ead3'], violet: ['#a28aff', '#181d56', '#f1d6ff'],
  clean: ['#f1f1e9', '#123b48', '#bce9e7'], ocean: ['#45d7e8', '#072f4f', '#86aaff'],
  sunset: ['#ff835e', '#37134f', '#ffc857'], rose: ['#ff79a8', '#35142e', '#ffd2d8'],
  mint: ['#75e0b4', '#123c35', '#d0f29d'], midnight: ['#6d95ff', '#10182e', '#c1d4ff'],
  earth: ['#d8a75b', '#33251b', '#b9c07b'], coral: ['#ff7665', '#24202b', '#ffc2a8'],
  sakura: ['#ffb7cb', '#401d36', '#f7e8da'], plum: ['#c18cff', '#25153f', '#f4b4cf'],
  mono: ['#f1f3f5', '#181b21', '#858e9b'], island: ['#ffb74d', '#063b3b', '#38cfaa']
};
const interfaceCopy = {
  si: { headline: 'ඔබේ අදහස, ඔබේ නිර්මාණය.', sub: 'Facebook සහ සමාජ මාධ්‍ය සඳහා ආකර්ෂණීය post නිර්මාණය කරන්න. පින්තූරයක් හෝ වීඩියෝවක් දාන්න, ඔබේ භාෂාවෙන් ලියන්න, කැමති template එක තෝරාගෙන download කරන්න.', edit: 'නිර්මාණය සකසන්න', tabs: ['✍️ අන්තර්ගතය', '🎨 Design', '◈ Branding'], headLabel: 'ප්‍රධාන මාතෘකාව', subLabel: 'අමතර විස්තර', photoLabel: 'පසුබිම් ඡායාරූපය / වීඩියෝව', pageLabel: 'Page / brand නම', logoLabel: 'ඔබේ logo එක', preview: 'Live preview', png: 'PNG Download', reset: 'Reset', local: '● LOCAL · ඔබේ file ඔබ ළඟමයි' },
  en: { headline: 'Your story. Your style.', sub: 'Create social posts in Sinhala, Tamil, English, or any language. Add a photo or video, choose a layout, and download your design.', edit: 'Customize your post', tabs: ['✍️ Content', '🎨 Design', '◈ Branding'], headLabel: 'Main headline', subLabel: 'Supporting line', photoLabel: 'Background photo / video', pageLabel: 'Page / brand name', logoLabel: 'Your logo', preview: 'Live preview', png: 'Download PNG', reset: 'Reset', local: '● LOCAL · FILES STAY ON DEVICE' },
  ta: { headline: 'உங்கள் செய்தி. உங்கள் பாணி.', sub: 'சிங்களம், தமிழ், ஆங்கிலம் அல்லது எந்த மொழியிலும் சமூக வலைதள பதிவுகளை உருவாக்குங்கள். படத்தை அல்லது வீடியோவைச் சேர்த்து வடிவமைப்பைத் தேர்ந்தெடுங்கள்.', edit: 'பதிவைத் தனிப்பயனாக்கு', tabs: ['✍️ உள்ளடக்கம்', '🎨 வடிவமைப்பு', '◈ பிராண்டிங்'], headLabel: 'முக்கிய தலைப்பு', subLabel: 'துணை வரி', photoLabel: 'பின்னணி படம் / வீடியோ', pageLabel: 'பக்கம் / பிராண்ட் பெயர்', logoLabel: 'உங்கள் லோகோ', preview: 'நேரடி முன்னோட்டம்', png: 'PNG பதிவிறக்கம்', reset: 'மீட்டமை', local: '● LOCAL · கோப்புகள் உங்கள் சாதனத்தில்' }
};
function setlang(language) {
  const copy = interfaceCopy[language] || interfaceCopy.si;
  document.documentElement.lang = language;
  $('title').textContent = copy.headline;
  $('subtitle').textContent = copy.sub;
  $('editTitle').textContent = copy.edit;
  $('tabContent').textContent = copy.tabs[0]; $('tabDesign').textContent = copy.tabs[1]; $('tabBrand').textContent = copy.tabs[2];
  $('headlineLabel').childNodes[0].textContent = copy.headLabel + ' ';
  $('subLabel').textContent = copy.subLabel; $('photoLabel').textContent = copy.photoLabel;
  $('pageLabel').textContent = copy.pageLabel; $('logoLabel').textContent = copy.logoLabel;
  $('previewTitle').textContent = copy.preview; $('pngText').textContent = copy.png; $('resetText').textContent = copy.reset;
  $('localBadge').textContent = copy.local;
}

function drawTemplates() {
  $('templates').innerHTML = templates.map(([id, icon, name]) =>
    `<button class="template ${state.template === id ? 'selected' : ''}" data-t="${id}"><b>${icon}</b>${name}</button>`
  ).join('');
  document.querySelectorAll('.template').forEach(button => button.onclick = () => {
    state.template = button.dataset.t;
    drawTemplates();
    render();
  });
}

function fitText(text, maxWidth, font) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  ctx.font = font;
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else line = candidate;
  }
  if (line) lines.push(line);
  return lines;
}
function fontStack(choice = 'system') {
  if (choice === 'serif') return '"Noto Serif Sinhala", "Noto Serif Tamil", "Nirmala UI", Georgia, serif';
  if (choice === 'narrow') return '"Arial Narrow", "Nirmala UI", "Noto Sans Sinhala", "Noto Sans Tamil", sans-serif';
  if (choice === 'sans') return 'Arial, "Nirmala UI", "Noto Sans Sinhala", "Noto Sans Tamil", sans-serif';
  return '"Nirmala UI", "Noto Sans Sinhala", "Noto Sans Tamil", Arial, sans-serif';
}
function formatDate(raw, style) {
  if (!raw) return '';
  const date = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(date.getTime())) return raw;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  if (style === 'mdy') return `${day}/${month}/${year}`;
  if (style === 'ymd') return `${year}.${month}.${day}`;
  if (style === 'long') return new Intl.DateTimeFormat(document.documentElement.lang || 'en', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  return `${day}.${month}.${year}`;
}
function localDateValue() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function timeLabel(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
function roundedPath(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function pill(x, y, w, h, color, radius = 12) {
  ctx.fillStyle = color;
  roundedPath(ctx, x, y, w, h, radius);
  ctx.fill();
}
function cover(source, sw0, sh0, dx = 0, dy = 0, dw = canvas.width, dh = canvas.height) {
  const ratio = sw0 / sh0, target = dw / dh;
  let sw, sh, sx, sy;
  if (ratio > target) { sh = sh0; sw = sh * target; sx = (sw0 - sw) / 2; sy = 0; }
  else { sw = sw0; sh = sw / target; sx = 0; sy = (sh0 - sh) / 2; }
  const zoom = Number($('mediaZoom')?.value || 100) / 100;
  const cropW = sw / zoom, cropH = sh / zoom;
  sx = (sw0 - cropW) * Number($('mediaX')?.value || 50) / 100;
  sy = (sh0 - cropH) * Number($('mediaY')?.value || 50) / 100;
  sw = cropW; sh = cropH;
  ctx.drawImage(source, sx, sy, sw, sh, dx, dy, dw, dh);
}
function wrapHeight(lines, lineHeight) { return lines.length * lineHeight; }
function drawBadge(text, x, y, fill, color = '#142016', fontSize = 27) {
  ctx.font = `800 ${fontSize}px "Nirmala UI", "Noto Sans Sinhala", "DM Sans", sans-serif`;
  const width = Math.min(canvas.width * .74, ctx.measureText(text).width + 36);
  pill(x, y, width, fontSize + 24, fill, 11);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + width / 2, y + (fontSize + 24) / 2, width - 22);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  return width;
}
function render() {
  const format = $('size').value;
  const w = 1080;
  const h = format === 'square' ? 1080 : format === 'story' ? 1920 : 1350;
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  $('dimensions').textContent = `${w} × ${h} px`;
  $('frame').className = `canvasframe ${format === 'square' ? 'square' : format === 'story' ? 'story' : ''}`;
  const palette = palettes[state.palette], accent = $('accent').value, brand = $('brandColor').value;
  const title = $('headline').value.trim(), sub = $('subline').value.trim();
  const tag = $('tag').value.trim(), page = $('pageName').value.trim(), foot = $('footerText').value.trim();
  const pad = w * .075, top = h * .055;

  ctx.clearRect(0, 0, w, h);
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, palette[1]); gradient.addColorStop(.55, '#10141b'); gradient.addColorStop(1, '#080a0e');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);
  if (!(state.photoObj || state.video)) {
    ctx.globalAlpha = .2; ctx.fillStyle = palette[0]; ctx.beginPath(); ctx.arc(w * .82, h * .22, w * .44, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  }
  if (state.photoObj || state.video) {
    // Keep the uploaded picture/video in a top banner; the rest is a calm, dark text area.
    const bandHeight = h * Number($('fadeStart').value) / 100;
    const source = state.video && state.video.readyState >= 2 ? state.video : state.photoObj;
    const sourceW = state.video ? state.video.videoWidth : state.photoObj?.naturalWidth;
    const sourceH = state.video ? state.video.videoHeight : state.photoObj?.naturalHeight;
    if (source && sourceW && sourceH) cover(source, sourceW, sourceH, 0, 0, w, bandHeight);
    const fadeTop = Math.max(0, bandHeight - h * .12);
    const fade = ctx.createLinearGradient(0, fadeTop, 0, bandHeight);
    fade.addColorStop(0, '#080a0e00'); fade.addColorStop(.66, '#080a0eb8'); fade.addColorStop(1, '#080a0eff');
    ctx.fillStyle = fade; ctx.fillRect(0, fadeTop, w, h - fadeTop);
  } else if ($('darken').checked) {
    const overlay = ctx.createLinearGradient(0, 0, 0, h);
    overlay.addColorStop(0, '#00000010'); overlay.addColorStop(.35, '#00000010'); overlay.addColorStop(.62, '#00000099'); overlay.addColorStop(1, '#000000f5');
    ctx.fillStyle = overlay; ctx.fillRect(0, 0, w, h);
  }

  // Compact page mark and date stay inside the safe margins.
  if (page) {
    if (state.logoObj) {
      const logoW = w * .16, logoH = w * .07;
      const logoX = $('showDate').checked && $('datePosition').value === 'top-left' ? w - pad - logoW : pad;
      ctx.save(); roundedPath(ctx, logoX, top, logoW, logoH, 9); ctx.clip(); ctx.drawImage(state.logoObj, logoX, top, logoW, logoH); ctx.restore();
    } else {
      ctx.font = `800 ${w * .022}px "Nirmala UI", "Noto Sans Sinhala", "Noto Sans Tamil", sans-serif`;
      const brandLabel = page.toUpperCase(), brandW = Math.min(w * .4, ctx.measureText(brandLabel).width + 32);
      const brandX = $('showDate').checked && $('datePosition').value === 'top-left' ? w - pad - brandW : pad;
      if ($('logoStyle').value === 'pill') { pill(brandX, top, brandW, w * .055, brand, 11); ctx.fillStyle = '#142016'; }
      else ctx.fillStyle = '#fff';
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText(brandLabel, brandX + ($('logoStyle').value === 'pill' ? 16 : 0), top + w * .0275, brandW - 14);
    }
  }
  if ($('showDate').checked && $('date').value) {
    const date = formatDate($('date').value, $('dateFormat')?.value || 'dmy');
    ctx.font = `700 ${w * .023}px "Nirmala UI", "Noto Sans Sinhala", "Noto Sans Tamil", sans-serif`;
    const dw = Math.min(w * .36, ctx.measureText(date).width + 32), dh = w * .055, dx = w - pad - dw;
    const position = $('datePosition')?.value || 'top-right';
    const x = position.endsWith('left') ? pad : position.endsWith('right') ? w - pad - dw : (w - dw) / 2;
    const shape = $('dateShape')?.value || 'pill';
    const y = position.startsWith('bottom') ? h * .85 : shape === 'ribbon' && page ? top + w * .085 : top;
    if (shape === 'ribbon') { ctx.fillStyle = palette[0]; ctx.fillRect(0, y, w, dh); }
    else if (shape === 'pill') pill(x, y, dw, dh, palette[0], 10);
    ctx.fillStyle = state.palette === 'clean' || state.palette === 'mono' ? '#102c33' : '#fff';
    ctx.textAlign = shape === 'ribbon' ? 'center' : shape === 'plain' ? position.endsWith('left') ? 'left' : 'right' : 'center';
    const tx = shape === 'ribbon' ? w / 2 : shape === 'plain' && position.endsWith('right') ? w - pad : shape === 'plain' && position.endsWith('left') ? pad : x + dw / 2;
    ctx.textBaseline = 'middle'; ctx.fillText(date, tx, y + dh / 2, dw - 14); ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  }

  const label = tag || ({ sports: 'MATCH DAY', breaking: 'BREAKING', quote: 'QUOTE', score: 'FULL TIME', entertain: 'ENTERTAINMENT', community: 'COMMUNITY', versus: 'YOUR PICK', debate: 'DISCUSSION' }[state.template]);
  const face = fontStack($('headlineFont')?.value);
  const layout = $('layout').value;
  const automaticAlign = ['sports', 'score', 'quote', 'entertain'].includes(state.template) ? 'center' : 'left';
  const requestedAlign = $('textAlign')?.value || 'auto';
  const align = requestedAlign === 'auto' ? automaticAlign : requestedAlign;
  const centerX = w / 2;
  let titleTop, maxLines = format === 'story' ? 5 : 4, maxTextWidth = w - pad * 2;
  const fontScale = Number($('fontSize').value) / 100;
  let maxFont = w * (state.template === 'score' ? .11 : .061) * fontScale * (layout === 'minimal' ? .88 : 1);
  let minFont = w * .033, fontSize = maxFont, titleFont, lines;
  const weight = Number($('headlineWeight')?.value || 800);
  const lineScale = Number($('lineSpacing')?.value || 127) / 100;
  const textAreaHeight = h * (state.template === 'debate' ? .29 : state.template === 'versus' ? .30 : .35);
  const breakTagY = h * .455;
  if (state.template === 'breaking') {
    pill(pad, breakTagY, w - pad * 2, w * .076, '#ef4036', 5);
    ctx.font = `800 ${w * .03}px ${face}`; ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle';
    ctx.fillText(label.toUpperCase(), pad + 20, breakTagY + w * .038, w - pad * 2 - 40); ctx.textBaseline = 'top';
  } else if (!['sports', 'score', 'quote'].includes(state.template)) {
    drawBadge(`✦  ${label.toUpperCase()}`, pad, h * .455, accent, '#18200e', w * .024);
  }
  titleTop = state.template === 'breaking' ? h * .55 : h * (state.template === 'debate' ? .53 : state.template === 'versus' ? .51 : .54);
  if (state.template === 'sports') titleTop = h * .53;
  if (state.template === 'score') titleTop = h * .50;
  if (state.template === 'quote') titleTop = h * .53;
  if (state.template === 'entertain') titleTop = h * .55;
  if (state.template === 'community') {
    ctx.fillStyle = '#07120fdc'; roundedPath(ctx, pad - 10, h * .49, w - (pad - 10) * 2, h * .34, 20); ctx.fill();
    ctx.fillStyle = accent; roundedPath(ctx, pad - 10, h * .49, 9, h * .34, 5); ctx.fill();
  }
  if (state.template === 'entertain') {
    ctx.fillStyle = '#070910b8'; roundedPath(ctx, pad - 10, h * .49, w - (pad - 10) * 2, h * .34, 16); ctx.fill();
    ctx.strokeStyle = `${accent}aa`; ctx.lineWidth = 2; ctx.stroke();
  }

  const visibleTitle = state.template === 'quote' ? `“${title}”` : title;
  while (fontSize >= minFont) {
    titleFont = `${weight} ${fontSize}px ${face}`;
    lines = fitText(visibleTitle, maxTextWidth, titleFont);
    const lineHeight = fontSize * lineScale;
    if (lines.length <= maxLines && wrapHeight(lines, lineHeight) <= textAreaHeight) break;
    fontSize -= 2;
  }
  if (fontSize < minFont) {
    fontSize = minFont; titleFont = `${weight} ${fontSize}px ${face}`; lines = fitText(visibleTitle, maxTextWidth, titleFont).slice(0, maxLines);
  }
  const lineHeight = fontSize * lineScale;
  ctx.font = titleFont; ctx.textBaseline = 'top'; ctx.textAlign = align;
  let titleY = titleTop;
  if (state.template === 'quote') {
    ctx.strokeStyle = '#ffffffaa'; ctx.lineWidth = 2;
    ctx.strokeRect(pad, h * .48, w - pad * 2, h * .37);
    titleY = h * .55;
  }
  if (state.template === 'score') {
    const scoreText = title || '355/7';
    const cardW = w - pad * 2, cardX = pad, cardY = h * .47, cardH = h * .31;
    pill(cardX, cardY, cardW, cardH, '#090d13d9', 20);
    ctx.strokeStyle = `${palette[0]}cc`; ctx.lineWidth = 3; ctx.strokeRect(cardX + 2, cardY + 2, cardW - 4, cardH - 4);
    ctx.fillStyle = palette[0]; ctx.font = `800 ${w * .032}px ${face}`; ctx.textAlign = 'center'; ctx.fillText(label.toUpperCase(), centerX, h * .495, cardW - 36);
    ctx.fillStyle = '#fff'; ctx.font = `900 ${w * .15}px ${face}`;
    ctx.fillText(scoreText, centerX, h * .535, cardW - 40);
    if (sub) { ctx.fillStyle = accent; ctx.font = `800 ${w * .041}px ${face}`; ctx.fillText(sub, centerX, h * .69, cardW - 36); }
    ctx.textAlign = 'left';
  } else {
      const x = align === 'center' ? centerX : align === 'right' ? w - pad : pad;
    lines.forEach((line, index) => {
      const y = titleY + index * lineHeight;
      const highlighted = layout === 'split' ? index === Math.ceil(lines.length / 2) : index === lines.length - 1 && state.template !== 'breaking';
      if ($('headlineOutline')?.checked && layout !== 'minimal') {
        ctx.lineWidth = fontSize * .075; ctx.strokeStyle = '#000b'; ctx.lineJoin = 'round';
        ctx.strokeText(line, x, y, maxTextWidth);
      }
      ctx.fillStyle = highlighted ? accent : '#fff';
      if ($('headlineShadow')?.checked) { ctx.shadowColor = '#000b'; ctx.shadowBlur = fontSize * .14; ctx.shadowOffsetY = fontSize * .035; }
      ctx.fillText(line, x, y, maxTextWidth);
      ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    });
    ctx.textAlign = 'left';
  }

  const titleBottom = state.template === 'score' ? h * .73 : titleTop + lines.length * lineHeight;
  const reactionY = Math.min(h * .82, Math.max(h * .78, titleBottom + h * .055));
  const bodyTop = state.template === 'debate' ? Math.min(titleBottom + h * .035, h * .77) : titleBottom + h * .026;
  const subSize = w * .027;
  ctx.font = `600 ${subSize}px ${face}`; ctx.fillStyle = '#ffffffdf'; ctx.textAlign = align; ctx.textBaseline = 'top';
  const subLines = state.template === 'score' ? [] : fitText(sub, maxTextWidth, ctx.font).slice(0, 2);
  subLines.forEach((line, i) => ctx.fillText(line, align === 'center' ? centerX : align === 'right' ? w - pad : pad, bodyTop + i * subSize * 1.45, maxTextWidth));
  ctx.textAlign = 'left';

  if (state.template === 'debate') {
    const y = reactionY, gap = 22, bw = w * .31, bh = w * .075, total = bw * 2 + gap, left = centerX - total / 2;
    pill(left, y, bw, bh, '#fff', 13); pill(left + bw + gap, y, bw, bh, '#fff', 13);
    ctx.font = `700 ${w * .025}px ${face}`; ctx.fillStyle = '#17212a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('❤️  ඔව්', left + bw / 2, y + bh / 2); ctx.fillText('👍  නැහැ', left + bw + gap + bw / 2, y + bh / 2); ctx.textAlign = 'left';
  }
  if (state.template === 'versus') {
    const y = reactionY, gap = 18, bw = (w - pad * 2 - gap) / 2, bh = w * .09;
    pill(pad, y, bw, bh, accent, 12); pill(pad + bw + gap, y, bw, bh, palette[0], 12);
    ctx.font = `800 ${w * .023}px ${face}`; ctx.fillStyle = '#121820'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('👍  OPTION A', pad + bw / 2, y + bh / 2); ctx.fillStyle = '#fff'; ctx.fillText('❤️  OPTION B', pad + bw + gap + bw / 2, y + bh / 2); ctx.textAlign = 'left';
  }
  if (state.template === 'quote') {
    ctx.fillStyle = accent; ctx.font = `700 ${w * .028}px ${face}`; ctx.textAlign = 'center'; ctx.fillText(`— ${foot || page}`, centerX, h * .80, w - pad * 2); ctx.textAlign = 'left';
  }
  if (state.template === 'entertain') {
    ctx.fillStyle = accent; ctx.fillRect(w * .35, h * .49, w * .3, 5);
  }

  const footerY = h * .925;
  ctx.fillStyle = '#ffffffb8'; ctx.fillRect(pad, footerY - 18, w - pad * 2, 2);
  ctx.fillStyle = '#fff'; ctx.font = `700 ${w * .021}px ${face}`; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
  ctx.fillText(foot || page, pad, footerY, w - pad * 2);
  $('fadeValue').textContent = `${$('fadeStart').value}%`;
  $('fontSizeValue').textContent = `${$('fontSize').value}%`;
  $('lineSpacingValue').textContent = `${$('lineSpacing').value}%`;
  $('mediaZoomValue').textContent = `${$('mediaZoom').value}%`;
  $('mediaXValue').textContent = `${$('mediaX').value}%`; $('mediaYValue').textContent = `${$('mediaY').value}%`;
  $('videoStartValue').textContent = timeLabel($('videoStart').value); $('videoEndValue').textContent = timeLabel($('videoEnd').value);
}

function loadMedia(file) {
  if (!file) return;
  state.photoObj = null;
  if (state.video) { state.video.pause(); state.video.removeAttribute('src'); state.video.load(); }
  if (state.videoUrl) URL.revokeObjectURL(state.videoUrl);
  state.video = null;
  const url = URL.createObjectURL(file);
  if (file.type.startsWith('video/')) {
    const video = document.createElement('video');
    video.src = url; video.muted = true; video.loop = false; video.playsInline = true; video.preload = 'auto';
    video.onloadeddata = () => {
      state.video = video; state.videoUrl = url;
      $('mediaZoom').value = 100; $('mediaX').value = 50; $('mediaY').value = 50;
      updateVideoControls(); video.play().catch(() => {}); render(); animateVideo();
    };
    video.onerror = () => toast('Could not open this video format in your browser');
  } else {
    const image = new Image();
    image.onload = () => { state.photoObj = image; $('mediaZoom').value = 100; $('mediaX').value = 50; $('mediaY').value = 50; updateVideoControls(); render(); URL.revokeObjectURL(url); };
    image.onerror = () => toast('Could not open this image');
    image.src = url;
  }
}
let animationActive = false;
function animateVideo() {
  if (animationActive) return;
  animationActive = true;
  const tick = () => {
    if (!state.video) { animationActive = false; return; }
    const start = Number($('videoStart').value || 0), end = Number($('videoEnd').value || state.video.duration || 10);
    if (state.video.currentTime < start || state.video.currentTime >= end) {
      state.video.currentTime = start;
      state.video.play().catch(() => {});
    }
    render(); requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
function loadLogo(file) {
  if (!file) return;
  const url = URL.createObjectURL(file), image = new Image();
  image.onload = () => { state.logoObj = image; render(); URL.revokeObjectURL(url); };
  image.src = url;
}
function toast(text) {
  $('toast').textContent = text; $('toast').classList.add('show');
  setTimeout(() => $('toast').classList.remove('show'), 2600);
}
function updateVideoControls() {
  const hasMedia = Boolean(state.photoObj || state.video);
  $('mediaControls').classList.toggle('hide', !hasMedia);
  $('videoControls').classList.toggle('hide', !state.video);
  if (!state.video) return;
  const duration = Math.min(120, Math.max(.5, Number.isFinite(state.video.duration) ? state.video.duration : 120));
  $('videoStart').max = Math.max(0, duration - .5); $('videoEnd').max = duration;
  $('videoStart').min = 0; $('videoEnd').min = .5;
  $('videoStart').value = 0; $('videoEnd').value = Math.max(.5, duration);
}

const PROFILE_KEY = 'postkatha.brandProfiles.v1';
function readBrandProfiles() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}'); }
  catch { return {}; }
}
function refreshBrandProfiles(selected = '') {
  const select = $('brandProfiles'), profiles = readBrandProfiles();
  select.innerHTML = '<option value="">Select saved profile</option>';
  Object.keys(profiles).sort((a, b) => a.localeCompare(b)).forEach(name => {
    const option = document.createElement('option'); option.value = name; option.textContent = name; select.append(option);
  });
  if (selected && profiles[selected]) select.value = selected;
}
function logoAsDataURL() {
  if (!state.logoObj) return '';
  const scale = Math.min(1, 1024 / Math.max(state.logoObj.naturalWidth, state.logoObj.naturalHeight));
  const c = document.createElement('canvas'); c.width = Math.round(state.logoObj.naturalWidth * scale); c.height = Math.round(state.logoObj.naturalHeight * scale);
  c.getContext('2d').drawImage(state.logoObj, 0, 0, c.width, c.height);
  return c.toDataURL('image/png');
}
function saveBrandProfile() {
  const name = $('profileName').value.trim() || $('pageName').value.trim() || 'My Page';
  try {
    const profiles = readBrandProfiles();
    profiles[name] = {
      pageName: $('pageName').value, palette: state.palette, accent: $('accent').value,
      brandColor: $('brandColor').value, logoStyle: $('logoStyle').value, logo: logoAsDataURL(),
      headlineFont: $('headlineFont').value, dateFormat: $('dateFormat').value,
      dateShape: $('dateShape').value, datePosition: $('datePosition').value,
      headlineWeight: $('headlineWeight').value, fontSize: $('fontSize').value,
      textAlign: $('textAlign').value, lineSpacing: $('lineSpacing').value, layout: $('layout').value
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
    refreshBrandProfiles(name); toast(`Saved brand profile: ${name}`);
  } catch { toast('Could not save profile. The logo may be too large; try a smaller PNG.'); }
}
function loadBrandProfile() {
  const name = $('brandProfiles').value, profile = readBrandProfiles()[name];
  if (!profile) { toast('Choose a saved brand profile first'); return; }
  $('pageName').value = profile.pageName || '';
  $('logoStyle').value = profile.logoStyle || 'pill';
  $('headlineFont').value = profile.headlineFont || 'system';
  $('dateFormat').value = profile.dateFormat || 'dmy';
  $('dateShape').value = profile.dateShape || 'pill';
  $('datePosition').value = profile.datePosition || 'top-right';
  $('headlineWeight').value = profile.headlineWeight || '800';
  $('fontSize').value = profile.fontSize || '100';
  $('textAlign').value = profile.textAlign || 'auto';
  $('lineSpacing').value = profile.lineSpacing || '127';
  $('layout').value = profile.layout || 'bold';
  $('accent').value = profile.accent || palettes[profile.palette]?.[0] || '#c3f36b';
  $('brandColor').value = profile.brandColor || palettes[profile.palette]?.[2] || '#c3f36b';
  if (palettes[profile.palette]) state.palette = profile.palette;
  document.querySelectorAll('.swatches button').forEach(button => {
    const selected = button.dataset.palette === state.palette;
    button.classList.toggle('selected', selected); button.setAttribute('aria-pressed', String(selected));
  });
  if (profile.logo) {
    const image = new Image(); image.onload = () => { state.logoObj = image; render(); };
    image.src = profile.logo;
  } else state.logoObj = null;
  $('profileName').value = name; render(); toast(`Loaded brand profile: ${name}`);
}
function deleteBrandProfile() {
  const name = $('brandProfiles').value, profiles = readBrandProfiles();
  if (!name || !profiles[name]) { toast('Choose a saved brand profile first'); return; }
  if (!window.confirm(`Delete the saved profile “${name}” from this device?`)) return;
  delete profiles[name];
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles)); refreshBrandProfiles(); toast(`Deleted saved profile: ${name}`); }
  catch { toast('Could not update saved profiles'); }
}
function download(type) {
  const a = document.createElement('a'); a.download = `postkatha-${Date.now()}.${type}`;
  a.href = canvas.toDataURL(type === 'jpg' ? 'image/jpeg' : 'image/png', .94); a.click(); toast(`${type.toUpperCase()} downloaded`);
}
async function downloadVideo() {
  if (!canvas.captureStream || !window.MediaRecorder) { toast('Video export needs a recent Chrome or Edge browser'); return; }
  const audioEnabled = Boolean(state.video && $('includeAudio').checked);
  const types = audioEnabled
    ? ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
    : ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  const mime = types.find(type => MediaRecorder.isTypeSupported(type));
  if (!mime) { toast('This browser does not support video export'); return; }
  const button = $('downloadVideo'), oldText = button.textContent;
  const clipStart = state.video ? Math.max(0, Math.min(Number($('videoStart').value) || 0, Math.max(0, (Number.isFinite(state.video.duration) ? state.video.duration : 120) - .5))) : 0;
  const sourceDuration = state.video ? Math.min(120, Number.isFinite(state.video.duration) ? state.video.duration : 120) : 10;
  const clipEnd = state.video ? Math.min(sourceDuration, Math.max(clipStart + .5, Number($('videoEnd').value) || sourceDuration)) : sourceDuration;
  const duration = Math.max(.5, clipEnd - clipStart);
  button.disabled = true;
  const oldMuted = state.video?.muted ?? true, oldVolume = state.video?.volume ?? 1;
  let sourceStream = null, timer = null;
  try {
    if (state.video) {
      await seekVideo(state.video, clipStart);
      state.video.muted = !audioEnabled;
      state.video.volume = .75;
      await state.video.play();
    }
    render();
    const stream = canvas.captureStream(30);
    if (audioEnabled) {
      const capture = state.video.captureStream || state.video.mozCaptureStream;
      if (!capture) throw new Error('Audio capture is not available in this browser.');
      sourceStream = capture.call(state.video);
      sourceStream.getAudioTracks().forEach(track => stream.addTrack(track));
      if (!sourceStream.getAudioTracks().length) toast('The selected video has no audio track');
    }
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6500000, audioBitsPerSecond: 192000 });
    const chunks = [];
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
    const done = new Promise((resolve, reject) => { recorder.onstop = resolve; recorder.onerror = () => reject(recorder.error); });
    const started = performance.now();
    recorder.start(1000);
    timer = setInterval(() => {
      const elapsed = Math.min(duration, (performance.now() - started) / 1000);
      const mm = Math.floor(elapsed / 60), ss = String(Math.floor(elapsed % 60)).padStart(2, '0');
      button.textContent = `● ${mm}:${ss} / ${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}`;
    }, 500);
    await new Promise(resolve => setTimeout(resolve, duration * 1000)); recorder.stop(); await done;
    const blob = new Blob(chunks, { type: mime }), ext = mime.includes('mp4') ? 'mp4' : 'webm';
    const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = `postkatha-${Date.now()}.${ext}`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    toast(`${ext.toUpperCase()} downloaded with video sound where present`);
  } catch (error) { toast(error.message || 'Video export failed in this browser'); }
  finally {
    clearInterval(timer);
    sourceStream?.getTracks().forEach(track => track.stop());
    if (state.video) { state.video.muted = oldMuted; state.video.volume = oldVolume; }
    button.disabled = false; button.textContent = oldText;
  }
}
function seekVideo(video, time) {
  return new Promise(resolve => {
    if (Math.abs(video.currentTime - time) < .04) { resolve(); return; }
    let timer;
    const finish = () => { clearTimeout(timer); video.removeEventListener('seeked', finish); resolve(); };
    video.addEventListener('seeked', finish, { once: true });
    video.currentTime = time;
    timer = setTimeout(finish, 1000);
  });
}

document.querySelectorAll('.tab').forEach(button => button.onclick = () => {
  document.querySelectorAll('.tab').forEach(item => item.classList.toggle('active', item === button));
  ['content', 'design', 'brand'].forEach(name => $('panel-' + name).classList.toggle('hide', name !== button.dataset.panel));
});
document.querySelectorAll('input:not([type=file]), textarea, select').forEach(el => el.addEventListener('input', render));
document.querySelectorAll('.swatches button').forEach(button => button.onclick = () => {
  state.palette = button.dataset.palette;
  document.querySelectorAll('.swatches button').forEach(item => {
    const selected = item === button;
    item.classList.toggle('selected', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
  $('accent').value = palettes[state.palette][0];
  $('brandColor').value = palettes[state.palette][2];
  render();
});
$('photo').onchange = event => loadMedia(event.target.files[0]);
$('logo').onchange = event => loadLogo(event.target.files[0]);
$('clearPhoto').onclick = () => { if (state.video) { state.video.pause(); state.video.removeAttribute('src'); state.video.load(); } state.video = null; state.photoObj = null; if (state.videoUrl) URL.revokeObjectURL(state.videoUrl); state.videoUrl = null; $('photo').value = ''; updateVideoControls(); render(); };
$('clearLogo').onclick = () => { state.logoObj = null; $('logo').value = ''; render(); };
['mediaZoom', 'mediaX', 'mediaY', 'headlineWeight', 'headlineFont', 'textAlign', 'lineSpacing', 'headlineOutline', 'headlineShadow', 'dateFormat', 'dateShape', 'datePosition'].forEach(id => {
  $(id).addEventListener('input', render);
  $(id).addEventListener('change', render);
});
$('videoStart').addEventListener('input', () => {
  const start = Number($('videoStart').value), end = Number($('videoEnd').value);
  if (start >= end - .5) $('videoEnd').value = Math.min(Number($('videoEnd').max), start + .5);
  if (state.video && (state.video.currentTime < start || state.video.currentTime >= Number($('videoEnd').value))) seekVideo(state.video, start);
  render();
});
$('videoEnd').addEventListener('input', () => {
  const end = Number($('videoEnd').value), start = Number($('videoStart').value);
  if (end <= start + .5) $('videoStart').value = Math.max(0, end - .5);
  if (state.video && state.video.currentTime >= end) seekVideo(state.video, Number($('videoStart').value));
  render();
});
// Keep the date field useful immediately while still letting the user choose another date.
if (!$('date').value) $('date').value = localDateValue();
refreshBrandProfiles();
function saveCurrentBrand() { saveBrandProfile(); }
$('saveBrand').onclick = saveCurrentBrand;
$('loadBrand').onclick = loadBrandProfile;
$('deleteBrand').onclick = deleteBrandProfile;
$('brandProfiles').onchange = () => { if ($('brandProfiles').value) $('profileName').value = $('brandProfiles').value; };
document.querySelectorAll('.swatches button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.palette === state.palette)));
$('uiLang').onchange = event => setlang(event.target.value);
$('downloadPng').onclick = () => download('png'); $('downloadJpg').onclick = () => download('jpg'); $('downloadVideo').onclick = downloadVideo;
$('openGemini').onclick = () => {
  const prompt = $('prompt').value || 'Create a dramatic editorial background photo for a social media post. Leave clear negative space in the lower third for headline text. No text, no lettering, no watermark.';
  window.open('https://gemini.google.com/app', '_blank', 'noopener');
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(prompt).then(() => toast('Image prompt copied — paste it into Gemini')).catch(() => toast('Gemini opened — copy the prompt from this box'));
  else toast('Gemini opened — copy the prompt from this box');
};
$('reset').onclick = () => location.reload();
$('accent').value = palettes[state.palette][0]; $('brandColor').value = palettes[state.palette][2];
drawTemplates(); setlang('si'); render();
