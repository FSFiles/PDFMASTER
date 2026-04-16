/* ================================================================
   DocForge — Main Application JavaScript
   Features: IMG→PDF, Merge PDF, Split PDF→Images, Add Pages, Sign PDF
   All operations are 100% client-side using pdf-lib & PDF.js
   ================================================================ */

'use strict';

// ─── Configuration ───────────────────────────────────────────────
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ─── DOMContentLoaded ────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initParticles();
  initNavbar();
  initScrollAnimations();
});

/* =================================================================
   PRELOADER
================================================================= */
function initPreloader() {
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('preloader').classList.add('hide');
    }, 600);
  });
}

/* =================================================================
   PARTICLES
================================================================= */
function initParticles() {
  const container = document.getElementById('particles-container');
  const colors = ['rgba(108,99,255,0.6)','rgba(200,80,192,0.5)','rgba(0,212,255,0.45)','rgba(0,232,157,0.4)','rgba(255,140,66,0.4)'];
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 2;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-duration:${Math.random()*20+12}s;
      animation-delay:-${Math.random()*20}s;
    `;
    container.appendChild(p);
  }
}

/* =================================================================
   NAVBAR
================================================================= */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    document.getElementById('backToTop').classList.toggle('show', window.scrollY > 400);
  });
  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* =================================================================
   SCROLL ANIMATIONS
================================================================= */
function initScrollAnimations() {
  const els = document.querySelectorAll('.tool-card, .feature-item, .faq-item, .section-header');
  els.forEach(el => el.classList.add('reveal'));
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
}

/* =================================================================
   FAQ
================================================================= */
function toggleFaq(item) {
  item.classList.toggle('open');
}

/* =================================================================
   MODAL SYSTEM
================================================================= */
function openTool(toolId) {
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');
  content.innerHTML = getToolContent(toolId);
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  initTool(toolId);
}

function closeTool() {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  // Revoke any object URLs
  document.querySelectorAll('[data-obj-url]').forEach(el => URL.revokeObjectURL(el.dataset.objUrl));
}

function closeModal(e) {
  if (e.target === document.getElementById('modalOverlay')) closeTool();
}

/* =================================================================
   TOOL CONTENT TEMPLATES
================================================================= */
function getToolContent(id) {
  const templates = {
    img2pdf: `
      <div class="tool-modal-header">
        <h2>🖼️ Image to PDF</h2>
        <p>Select one or more images — they'll be laid out as pages in a PDF.</p>
      </div>
      <div class="drop-zone" id="img2pdfDrop">
        <input type="file" id="img2pdfInput" multiple accept="image/*" />
        <div class="drop-zone-icon">📁</div>
        <h4>Drop images here or <span class="browse-link">browse</span></h4>
        <p>JPG, PNG, WebP, GIF supported</p>
      </div>
      <div id="imgPreviewGrid" class="img-preview-grid"></div>
      <div class="row mt-16">
        <label style="font-size:.82rem;color:var(--text-muted)">Page Size:</label>
        <select id="pageSizeSelect" style="padding:8px 12px;background:var(--bg-glass);border:1px solid var(--border);border-radius:8px;color:var(--text-primary);font-size:.85rem;outline:none;cursor:pointer">
          <option value="a4">A4</option>
          <option value="letter">US Letter</option>
          <option value="fit">Fit to Image</option>
        </select>
        <label style="font-size:.82rem;color:var(--text-muted);margin-left:8px">Quality:</label>
        <select id="imgQualitySelect" style="padding:8px 12px;background:var(--bg-glass);border:1px solid var(--border);border-radius:8px;color:var(--text-primary);font-size:.85rem;outline:none;cursor:pointer">
          <option value="1">High</option>
          <option value="0.8">Medium</option>
          <option value="0.6">Low</option>
        </select>
      </div>
      <button class="action-btn" id="img2pdfBtn" onclick="runImg2PDF()" disabled>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18"><path d="M12 5v14M5 12h14"/></svg>
        Convert to PDF
      </button>
      <div class="progress-wrap" id="img2pdfProgress">
        <div class="progress-bar"><div class="progress-fill" id="img2pdfFill"></div></div>
        <div class="progress-label" id="img2pdfLabel">Processing…</div>
      </div>
      <div class="result-area" id="img2pdfResult">
        <h4>✅ PDF Created!</h4>
        <p id="img2pdfResultInfo"></p>
        <button class="download-btn" id="img2pdfDownload" onclick="downloadFile('img2pdf')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Open PDF
        </button>
      </div>`,

    mergepdf: `
      <div class="tool-modal-header">
        <h2>🔗 Merge PDFs</h2>
        <p>Upload multiple PDFs — they'll be merged into one in your chosen order.</p>
      </div>
      <div class="drop-zone" id="mergeDrop">
        <input type="file" id="mergeInput" multiple accept="application/pdf" />
        <div class="drop-zone-icon">📂</div>
        <h4>Drop PDFs here or <span class="browse-link">browse</span></h4>
        <p>Add 2 or more PDF files</p>
      </div>
      <div class="file-list" id="mergeFileList"></div>
      <button class="action-btn pink-btn" id="mergePdfBtn" onclick="runMergePDF()" disabled>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18"><path d="M8 3H5a2 2 0 00-2 2v14a2 2 0 002 2h3M16 3h3a2 2 0 012 2v14a2 2 0 01-2 2h-3M12 8v8M9 11l3-3 3 3"/></svg>
        Merge PDFs
      </button>
      <div class="progress-wrap" id="mergeProgress">
        <div class="progress-bar"><div class="progress-fill" style="background:var(--grad-pink)" id="mergeFill"></div></div>
        <div class="progress-label" id="mergeLabel">Merging…</div>
      </div>
      <div class="result-area" id="mergeResult">
        <h4>✅ PDFs Merged!</h4>
        <p id="mergeResultInfo"></p>
        <button class="download-btn" onclick="downloadFile('merge')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Open Merged PDF
        </button>
      </div>`,

    splitpdf: `
      <div class="tool-modal-header">
        <h2>✂️ Split PDF</h2>
        <p>Upload a PDF, select the pages you want, and download them as a new PDF.</p>
      </div>
      <div class="drop-zone" id="splitDrop">
        <input type="file" id="splitInput" accept="application/pdf" />
        <div class="drop-zone-icon">📄</div>
        <h4>Drop a PDF here or <span class="browse-link">browse</span></h4>
        <p>Single PDF file</p>
      </div>
      <div id="splitControls" style="display:none;margin-top:16px">
        <div class="row">
          <span style="font-size:.85rem;color:var(--text-secondary)" id="splitPageCount"></span>
          <button class="sig-ctrl-btn" onclick="selectAllPages()">Select All</button>
          <button class="sig-ctrl-btn" onclick="deselectAllPages()">Deselect All</button>
        </div>
        <div class="split-preview" id="splitPreview"></div>
      </div>
      <button class="action-btn cyan-btn" id="splitBtn" onclick="runSplitPDF()" disabled>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18"><path d="M12 3v18M3 12h18"/></svg>
        Extract Selected Pages as PDF
      </button>
      <div class="progress-wrap" id="splitProgress">
        <div class="progress-bar"><div class="progress-fill" style="background:var(--grad-cyan)" id="splitFill"></div></div>
        <div class="progress-label" id="splitLabel">Extracting…</div>
      </div>
      <div class="result-area" id="splitResult">
        <h4>✅ Pages Extracted!</h4>
        <p id="splitResultInfo"></p>
        <button class="download-btn" style="background:var(--grad-cyan);color:#000" onclick="downloadFile('split')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Open PDF
        </button>
      </div>`,

    addpages: `
      <div class="tool-modal-header">
        <h2>➕ Add Pages to PDF</h2>
        <p>Insert blank pages or image pages at any position in an existing PDF.</p>
      </div>
      <div class="drop-zone" id="addDrop">
        <input type="file" id="addPdfInput" accept="application/pdf" />
        <div class="drop-zone-icon">📄</div>
        <h4>Upload a PDF first</h4>
        <p>Single PDF file</p>
      </div>
      <div id="addControls" style="display:none;margin-top:20px">
        <div style="padding:12px 16px;background:var(--bg-glass);border:1px solid var(--border);border-radius:10px;font-size:.88rem;color:var(--text-secondary)">
          📋 Loaded: <strong id="addPdfName" style="color:var(--text-primary)"></strong> — <span id="addPdfPages"></span>
        </div>
        <h4 style="margin-top:20px;font-size:.95rem;font-weight:600;margin-bottom:12px">Insert Blank Page</h4>
        <div class="page-pos-row">
          <div class="input-group">
            <label>After page #</label>
            <input type="number" id="blankAfterPage" min="0" value="0" style="width:90px" />
          </div>
          <div class="input-group">
            <label>Page size</label>
            <select id="blankPageSize">
              <option value="a4">A4</option>
              <option value="letter">Letter</option>
            </select>
          </div>
          <div class="input-group">
            <label>Count</label>
            <input type="number" id="blankCount" min="1" max="20" value="1" style="width:70px" />
          </div>
          <button class="action-btn orange-btn" onclick="addBlankPage()" style="margin-top:0;width:auto;padding:10px 20px;font-size:.85rem">Add Blank</button>
        </div>
        <h4 style="margin-top:20px;font-size:.95rem;font-weight:600;margin-bottom:12px">Insert Image Page</h4>
        <div class="drop-zone" id="addImgDrop" style="padding:24px">
          <input type="file" id="addImgInput" accept="image/*" />
          <div style="font-size:1.2rem;margin-bottom:6px">🖼️</div>
          <p>Click or drop an image</p>
        </div>
        <div class="page-pos-row mt-12">
          <div class="input-group">
            <label>After page #</label>
            <input type="number" id="imgAfterPage" min="0" value="0" style="width:90px" />
          </div>
          <button class="action-btn orange-btn" onclick="addImagePage()" style="margin-top:0;width:auto;padding:10px 20px;font-size:.85rem">Add Image Page</button>
        </div>
        <div id="addChangeLog" class="file-list" style="margin-top:16px"></div>
      </div>
      <button class="action-btn orange-btn" id="addSaveBtn" onclick="saveAddedPDF()" disabled style="margin-top:20px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
        Save Updated PDF
      </button>
      <div class="result-area" id="addResult">
        <h4>✅ PDF Updated!</h4>
        <p id="addResultInfo"></p>
        <button class="download-btn" style="background:var(--grad-orange)" onclick="downloadFile('add')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Open PDF
        </button>
      </div>`,

    signature: `
      <div class="tool-modal-header">
        <h2>✍️ Sign PDF</h2>
        <p>Draw, type, or upload your signature — then position it on any PDF page.</p>
      </div>
      <div class="drop-zone" id="sigDrop">
        <input type="file" id="sigPdfInput" accept="application/pdf" />
        <div class="drop-zone-icon">📄</div>
        <h4>Upload PDF to sign</h4>
        <p>Single PDF file</p>
      </div>
      <div id="sigControls" style="display:none;margin-top:20px">
        <div style="padding:12px 16px;background:var(--bg-glass);border:1px solid var(--border);border-radius:10px;font-size:.88rem;color:var(--text-secondary);margin-bottom:20px">
          📋 Loaded: <strong id="sigPdfName" style="color:var(--text-primary)"></strong> — <span id="sigPdfPages"></span>
        </div>
        <h4 style="font-size:.95rem;margin-bottom:12px;font-weight:600">Your Signature</h4>
        <div class="sig-tabs">
          <button class="sig-tab active" onclick="switchSigTab('draw',this)">✏️ Draw</button>
          <button class="sig-tab" onclick="switchSigTab('type',this)">⌨️ Type</button>
          <button class="sig-tab" onclick="switchSigTab('upload',this)">📤 Upload</button>
        </div>

        <!-- Draw Tab -->
        <div class="sig-panel show" id="sigPanelDraw">
          <div class="sig-canvas-wrap">
            <canvas id="sigCanvas"></canvas>
          </div>
          <div class="sig-controls">
            <button class="sig-ctrl-btn" onclick="clearCanvas()">🗑 Clear</button>
            <label style="font-size:.8rem;color:var(--text-muted);display:flex;align-items:center;gap:6px">
              Color <input type="color" id="sigColor" value="#1a1a2e" />
            </label>
            <label style="font-size:.8rem;color:var(--text-muted);display:flex;align-items:center;gap:6px">
              Size
              <input type="range" id="sigSize" min="1" max="8" value="2.5" step="0.5" style="width:80px" />
            </label>
          </div>
        </div>

        <!-- Type Tab -->
        <div class="sig-panel" id="sigPanelType">
          <input type="text" class="sig-type-input" id="sigTypeInput" placeholder="Type your name…" oninput="updateTypedSig()" />
          <div id="sigTypePreview" style="margin-top:12px;padding:16px;border:1px solid var(--border);border-radius:10px;background:#fff;text-align:center;font-size:2rem;font-family:'Dancing Script',cursive,serif;color:#111;min-height:80px"></div>
          <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&family=Great+Vibes&family=Pacifico&display=swap" rel="stylesheet" />
          <div class="row mt-12">
            <label style="font-size:.8rem;color:var(--text-muted)">Font:</label>
            <select id="sigFontSelect" onchange="updateTypedSig()" style="padding:7px 12px;background:var(--bg-glass);border:1px solid var(--border);border-radius:8px;color:var(--text-primary);font-size:.85rem;outline:none">
              <option value="Dancing Script">Dancing Script</option>
              <option value="Great Vibes">Great Vibes</option>
              <option value="Pacifico">Pacifico</option>
            </select>
            <label style="font-size:.8rem;color:var(--text-muted)">Color:</label>
            <input type="color" id="sigTypeColor" value="#1a1a2e" oninput="updateTypedSig()" />
          </div>
        </div>

        <!-- Upload Tab -->
        <div class="sig-panel" id="sigPanelUpload">
          <div class="drop-zone" style="padding:24px;margin-bottom:12px">
            <input type="file" id="sigImgInput" accept="image/*" onchange="loadSigImg(this)" />
            <div>📤 Upload signature image (PNG with transparency recommended)</div>
          </div>
          <div id="sigImgPreview" style="display:none;text-align:center">
            <img id="sigImgPreviewEl" style="max-height:120px;border-radius:8px;border:1px solid var(--border)" />
          </div>
        </div>

        <h4 style="margin-top:24px;font-size:.95rem;font-weight:600;margin-bottom:12px">Placement</h4>
        <div class="sig-position-grid">
          <div>
            <div class="sig-pos-label">Apply to page(s)</div>
            <select class="sig-pos-select" id="sigPageSelect">
              <option value="all">All pages</option>
              <option value="first">First page only</option>
              <option value="last">Last page only</option>
              <option value="custom">Custom page #</option>
            </select>
          </div>
          <div>
            <div class="sig-pos-label">Custom page #</div>
            <input type="number" id="sigPageNum" min="1" value="1" class="sig-pos-select" />
          </div>
          <div>
            <div class="sig-pos-label">Horizontal position</div>
            <select class="sig-pos-select" id="sigHPos">
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right" selected>Right</option>
            </select>
          </div>
          <div>
            <div class="sig-pos-label">Vertical position</div>
            <select class="sig-pos-select" id="sigVPos">
              <option value="top">Top</option>
              <option value="middle">Middle</option>
              <option value="bottom" selected>Bottom</option>
            </select>
          </div>
          <div>
            <div class="sig-pos-label">Width (px in PDF)</div>
            <input type="number" id="sigWidth" value="180" min="40" max="500" class="sig-pos-select" />
          </div>
        </div>
      </div>
      <button class="action-btn green-btn" id="sigApplyBtn" onclick="runSignPDF()" disabled>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18"><path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
        Apply Signature
      </button>
      <div class="progress-wrap" id="sigProgress">
        <div class="progress-bar"><div class="progress-fill" style="background:var(--grad-green)" id="sigFill"></div></div>
        <div class="progress-label">Applying signature…</div>
      </div>
      <div class="result-area" id="sigResult">
        <h4>✅ Signature Applied!</h4>
        <p id="sigResultInfo"></p>
        <button class="download-btn" style="background:var(--grad-green)" onclick="downloadFile('sig')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Open Signed PDF
        </button>
      </div>`
  };
  return templates[id] || '';
}

/* =================================================================
   TOOL INITIALIZERS
================================================================= */
const state = {};

function initTool(id) {
  state[id] = {};
  if (id === 'img2pdf')   initImg2PDF();
  if (id === 'mergepdf')  initMergePDF();
  if (id === 'splitpdf')  initSplitPDF();
  if (id === 'addpages')  initAddPages();
  if (id === 'signature') initSignature();
}

/* =================================================================
   TOOL 1 — IMAGE TO PDF
================================================================= */
function initImg2PDF() {
  state.img2pdf = { files: [] };
  const input = document.getElementById('img2pdfInput');
  const drop  = document.getElementById('img2pdfDrop');
  input.addEventListener('change', () => handleImg2PDFFiles(input.files));
  setupDragDrop(drop, input, handleImg2PDFFiles);
}

function handleImg2PDFFiles(files) {
  const fileArr = Array.from(files);
  state.img2pdf.files.push(...fileArr);
  renderImgPreviews();
}

function renderImgPreviews() {
  const grid = document.getElementById('imgPreviewGrid');
  grid.innerHTML = '';
  state.img2pdf.files.forEach((f, i) => {
    const url = URL.createObjectURL(f);
    const item = document.createElement('div');
    item.className = 'img-preview-item';
    item.innerHTML = `<img src="${url}" /><button class="img-preview-remove" onclick="removeImgFile(${i})">✕</button>`;
    grid.appendChild(item);
  });
  document.getElementById('img2pdfBtn').disabled = state.img2pdf.files.length === 0;
}

function removeImgFile(idx) {
  state.img2pdf.files.splice(idx, 1);
  renderImgPreviews();
}

async function runImg2PDF() {
  const files = state.img2pdf.files;
  if (!files.length) return;
  const btn = document.getElementById('img2pdfBtn');
  btn.disabled = true;
  showProgress('img2pdf');

  try {
    const { PDFDocument } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    const pageSize = document.getElementById('pageSizeSelect').value;

    for (let i = 0; i < files.length; i++) {
      setProgress('img2pdf', Math.round((i / files.length) * 90), `Processing image ${i+1}/${files.length}…`);
      const imgBytes = await readFileAsArrayBuffer(files[i]);
      const type = files[i].type;
      let img;
      if (type === 'image/png') {
        img = await pdfDoc.embedPng(imgBytes);
      } else {
        // convert to JPEG via canvas
        const blob = files[i];
        const bmpUrl = URL.createObjectURL(blob);
        const jpgBytes = await imageToJpegBytes(bmpUrl);
        img = await pdfDoc.embedJpg(jpgBytes);
        URL.revokeObjectURL(bmpUrl);
      }
      const { width: iw, height: ih } = img.scale(1);
      let pw, ph;
      if (pageSize === 'a4')     { pw = 595.28; ph = 841.89; }
      else if (pageSize === 'letter') { pw = 612; ph = 792; }
      else { pw = iw; ph = ih; }
      const page = pdfDoc.addPage([pw, ph]);
      const scale = Math.min(pw / iw, ph / ih);
      const scaledW = iw * scale;
      const scaledH = ih * scale;
      page.drawImage(img, {
        x: (pw - scaledW) / 2,
        y: (ph - scaledH) / 2,
        width: scaledW, height: scaledH
      });
    }

    setProgress('img2pdf', 95, 'Generating PDF…');
    const bytes = await pdfDoc.save();
    state.img2pdf.result = bytes;
    setProgress('img2pdf', 100, 'Done!');
    document.getElementById('img2pdfResultInfo').textContent =
      `${files.length} image(s) → ${formatBytes(bytes.byteLength)} PDF`;
    showResult('img2pdf');
  } catch(e) {
    showToast('Error: ' + e.message, 'error');
    console.error(e);
  } finally {
    btn.disabled = false;
  }
}

async function imageToJpegBytes(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        blob.arrayBuffer().then(resolve).catch(reject);
      }, 'image/jpeg', 0.92);
    };
    img.onerror = reject;
    img.src = url;
  });
}

/* =================================================================
   TOOL 2 — MERGE PDFs
================================================================= */
function initMergePDF() {
  state.mergepdf = { files: [] };
  const input = document.getElementById('mergeInput');
  const drop  = document.getElementById('mergeDrop');
  input.addEventListener('change', () => handleMergeFiles(input.files));
  setupDragDrop(drop, input, handleMergeFiles);
}

function handleMergeFiles(files) {
  state.mergepdf.files.push(...Array.from(files));
  renderMergeList();
}

function renderMergeList() {
  const list = document.getElementById('mergeFileList');
  list.innerHTML = '';
  state.mergepdf.files.forEach((f, i) => {
    const item = document.createElement('div');
    item.className = 'file-item';
    item.innerHTML = `
      <div class="file-item-icon">📄</div>
      <div class="file-item-name">${f.name}</div>
      <div class="file-item-size">${formatBytes(f.size)}</div>
      <button class="file-item-remove" onclick="removeMergeFile(${i})">✕</button>`;
    list.appendChild(item);
  });
  document.getElementById('mergePdfBtn').disabled = state.mergepdf.files.length < 2;
}

function removeMergeFile(idx) {
  state.mergepdf.files.splice(idx, 1);
  renderMergeList();
}

async function runMergePDF() {
  const files = state.mergepdf.files;
  if (files.length < 2) return showToast('Please add at least 2 PDFs', 'error');
  const btn = document.getElementById('mergePdfBtn');
  btn.disabled = true;
  showProgress('merge');
  try {
    const { PDFDocument } = PDFLib;
    const merged = await PDFDocument.create();
    for (let i = 0; i < files.length; i++) {
      setProgress('merge', Math.round(i / files.length * 90), `Merging ${i+1}/${files.length}…`);
      const bytes = await readFileAsArrayBuffer(files[i]);
      const src = await PDFDocument.load(bytes);
      const pages = await merged.copyPages(src, src.getPageIndices());
      pages.forEach(p => merged.addPage(p));
    }
    setProgress('merge', 95, 'Writing…');
    const out = await merged.save();
    state.mergepdf.result = out;
    setProgress('merge', 100, 'Done!');
    document.getElementById('mergeResultInfo').textContent =
      `${files.length} PDFs → ${merged.getPageCount()} pages, ${formatBytes(out.byteLength)}`;
    showResult('merge');
  } catch(e) {
    showToast('Error: ' + e.message, 'error');
    console.error(e);
  } finally {
    btn.disabled = false;
  }
}

/* =================================================================
   TOOL 3 — SPLIT PDF → IMAGES
================================================================= */
function initSplitPDF() {
  state.splitpdf = { file: null, pdfDoc: null, selectedPages: new Set() };
  const input = document.getElementById('splitInput');
  const drop  = document.getElementById('splitDrop');
  input.addEventListener('change', () => { if (input.files[0]) loadSplitPDF(input.files[0]); });
  setupDragDrop(drop, input, files => { if (files[0]) loadSplitPDF(files[0]); });
}

async function loadSplitPDF(file) {
  state.splitpdf.file = file;
  state.splitpdf.selectedPages = new Set();
  showProgress('split');
  setProgress('split', 10, 'Loading PDF…');
  try {
    if (typeof pdfjsLib === 'undefined') { pdfjsLib = window['pdfjs-dist/build/pdf']; }
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
    const bytes = await readFileAsArrayBuffer(file);
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
    state.splitpdf.pdfDoc = pdf;
    const n = pdf.numPages;
    document.getElementById('splitPageCount').textContent = `${n} page(s) found`;
    document.getElementById('splitControls').style.display = 'block';

    const preview = document.getElementById('splitPreview');
    preview.innerHTML = '';
    for (let i = 1; i <= n; i++) {
      setProgress('split', 10 + Math.round((i / n) * 80), `Rendering page ${i}/${n}…`);
      const page = await pdf.getPage(i);
      const vp = page.getViewport({ scale: 0.5 });
      const canvas = document.createElement('canvas');
      canvas.width = vp.width; canvas.height = vp.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
      const thumb = document.createElement('div');
      thumb.className = 'split-page-thumb selected';
      thumb.dataset.page = i;
      thumb.innerHTML = `
        <div class="split-check">✓</div>
        <span style="position:absolute;bottom:3px;left:0;right:0;text-align:center;font-size:0.65rem;color:var(--text-muted)">${i}</span>
      `;
      thumb.appendChild(canvas);
      thumb.addEventListener('click', () => toggleSplitPage(thumb, i));
      preview.appendChild(thumb);
      state.splitpdf.selectedPages.add(i);
    }
    hideProgress('split');
    document.getElementById('splitBtn').disabled = false;
  } catch(e) {
    showToast('Error loading PDF: ' + e.message, 'error');
    hideProgress('split');
    console.error(e);
  }
}

function toggleSplitPage(el, pageNum) {
  el.classList.toggle('selected');
  if (el.classList.contains('selected')) state.splitpdf.selectedPages.add(pageNum);
  else state.splitpdf.selectedPages.delete(pageNum);
}
function selectAllPages() {
  document.querySelectorAll('.split-page-thumb').forEach(el => {
    el.classList.add('selected');
    state.splitpdf.selectedPages.add(parseInt(el.dataset.page));
  });
}
function deselectAllPages() {
  document.querySelectorAll('.split-page-thumb').forEach(el => {
    el.classList.remove('selected');
    state.splitpdf.selectedPages.delete(parseInt(el.dataset.page));
  });
}

async function runSplitPDF() {
  const { file, selectedPages } = state.splitpdf;
  if (!file || !selectedPages.size) return showToast('Select at least one page', 'error');
  const btn = document.getElementById('splitBtn');
  btn.disabled = true;
  showProgress('split');

  const pages = [...selectedPages].sort((a, b) => a - b);

  try {
    const { PDFDocument } = PDFLib;
    setProgress('split', 10, 'Loading source PDF…');
    const srcBytes = await readFileAsArrayBuffer(file);
    const srcDoc  = await PDFDocument.load(srcBytes);
    const newDoc  = await PDFDocument.create();

    for (let idx = 0; idx < pages.length; idx++) {
      setProgress('split', 10 + Math.round((idx / pages.length) * 85), `Copying page ${pages[idx]}…`);
      const [copied] = await newDoc.copyPages(srcDoc, [pages[idx] - 1]);
      newDoc.addPage(copied);
    }

    setProgress('split', 97, 'Saving PDF…');
    const outBytes = await newDoc.save();
    state.splitpdf.result = outBytes;
    setProgress('split', 100, 'Done!');
    document.getElementById('splitResultInfo').textContent =
      `${pages.length} page(s) extracted → ${formatBytes(outBytes.byteLength)} PDF`;
    showResult('split');
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
    console.error(e);
  } finally {
    btn.disabled = false;
  }
}

/* =================================================================
   TOOL 4 — ADD PAGES TO PDF
================================================================= */
function initAddPages() {
  state.addpages = { pdfDoc: null, file: null, changes: [] };
  const input = document.getElementById('addPdfInput');
  const drop  = document.getElementById('addDrop');
  input.addEventListener('change', () => { if (input.files[0]) loadAddPDF(input.files[0]); });
  setupDragDrop(drop, input, files => { if (files[0]) loadAddPDF(files[0]); });

  const addImgInput = document.getElementById('addImgInput');
  addImgInput.addEventListener('change', (e) => { if (e.target.files[0]) state.addpages.imgFile = e.target.files[0]; });
}

async function loadAddPDF(file) {
  state.addpages.file = file;
  state.addpages.changes = [];
  try {
    const { PDFDocument } = PDFLib;
    const bytes = await readFileAsArrayBuffer(file);
    state.addpages.pdfDoc = await PDFDocument.load(bytes);
    document.getElementById('addPdfName').textContent = file.name;
    document.getElementById('addPdfPages').textContent =
      `${state.addpages.pdfDoc.getPageCount()} pages`;
    document.getElementById('addControls').style.display = 'block';
    document.getElementById('addSaveBtn').disabled = false;
  } catch(e) {
    showToast('Error loading PDF: ' + e.message, 'error');
  }
}

function addBlankPage() {
  const doc = state.addpages.pdfDoc;
  if (!doc) return;
  const afterPage = parseInt(document.getElementById('blankAfterPage').value);
  const count = parseInt(document.getElementById('blankCount').value) || 1;
  const size = document.getElementById('blankPageSize').value;
  const [pw, ph] = size === 'a4' ? [595.28, 841.89] : [612, 792];
  const insertIdx = Math.max(0, Math.min(afterPage, doc.getPageCount()));
  for (let i = 0; i < count; i++) {
    const p = doc.insertPage(insertIdx + i, [pw, ph]);
    p.drawRectangle({ x: 0, y: 0, width: pw, height: ph, color: PDFLib.rgb(1,1,1) });
  }
  const entry = { type: 'blank', after: afterPage, count, size };
  state.addpages.changes.push(entry);
  updateAddChangeLog();
  document.getElementById('addPdfPages').textContent = `${doc.getPageCount()} pages`;
  showToast(`${count} blank page(s) inserted ✅`, 'success');
}

async function addImagePage() {
  const doc = state.addpages.pdfDoc;
  const imgFile = state.addpages.imgFile;
  if (!doc) return showToast('Upload a PDF first', 'error');
  if (!imgFile) return showToast('Select an image first', 'error');
  const afterPage = parseInt(document.getElementById('imgAfterPage').value);
  const insertIdx = Math.max(0, Math.min(afterPage, doc.getPageCount()));
  try {
    const imgBytes = await readFileAsArrayBuffer(imgFile);
    let img;
    if (imgFile.type === 'image/png') img = await doc.embedPng(imgBytes);
    else {
      const url = URL.createObjectURL(imgFile);
      const jpgBytes = await imageToJpegBytes(url);
      img = await doc.embedJpg(jpgBytes);
      URL.revokeObjectURL(url);
    }
    const { width: iw, height: ih } = img.scale(1);
    const p = doc.insertPage(insertIdx, [iw, ih]);
    p.drawImage(img, { x: 0, y: 0, width: iw, height: ih });
    state.addpages.changes.push({ type: 'image', file: imgFile.name, after: afterPage });
    updateAddChangeLog();
    document.getElementById('addPdfPages').textContent = `${doc.getPageCount()} pages`;
    showToast('Image page inserted ✅', 'success');
  } catch(e) {
    showToast('Error: ' + e.message, 'error');
  }
}

function updateAddChangeLog() {
  const log = document.getElementById('addChangeLog');
  log.innerHTML = state.addpages.changes.map((c, i) => `
    <div class="file-item">
      <div class="file-item-icon">${c.type === 'blank' ? '📋' : '🖼️'}</div>
      <div class="file-item-name">${c.type === 'blank' ? `${c.count} blank page(s) after page ${c.after}` : `Image "${c.file}" after page ${c.after}`}</div>
    </div>`).join('');
}

async function saveAddedPDF() {
  const doc = state.addpages.pdfDoc;
  if (!doc) return;
  try {
    const bytes = await doc.save();
    state.addpages.result = bytes;
    document.getElementById('addResultInfo').textContent =
      `${doc.getPageCount()} pages, ${formatBytes(bytes.byteLength)}`;
    showResult('add');
  } catch(e) {
    showToast('Error saving PDF: ' + e.message, 'error');
  }
}

/* =================================================================
   TOOL 5 — SIGN PDF
================================================================= */
let sigCtx, sigDrawing = false;

function initSignature() {
  state.signature = { pdfFile: null, pdfDoc: null, activeTab: 'draw', uploadedSigImg: null };
  const input = document.getElementById('sigPdfInput');
  const drop  = document.getElementById('sigDrop');
  input.addEventListener('change', () => { if (input.files[0]) loadSigPDF(input.files[0]); });
  setupDragDrop(drop, input, files => { if (files[0]) loadSigPDF(files[0]); });
}

async function loadSigPDF(file) {
  state.signature.pdfFile = file;
  try {
    const { PDFDocument } = PDFLib;
    const bytes = await readFileAsArrayBuffer(file);
    state.signature.pdfDoc = await PDFDocument.load(bytes);
    document.getElementById('sigPdfName').textContent = file.name;
    document.getElementById('sigPdfPages').textContent =
      `${state.signature.pdfDoc.getPageCount()} pages`;
    document.getElementById('sigControls').style.display = 'block';
    document.getElementById('sigApplyBtn').disabled = false;
    // init canvas after showing
    setTimeout(initSigCanvas, 50);
  } catch(e) {
    showToast('Error loading PDF: ' + e.message, 'error');
  }
}

function initSigCanvas() {
  const canvas = document.getElementById('sigCanvas');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = canvas.offsetWidth  * dpr;
  canvas.height = canvas.offsetHeight * dpr;
  sigCtx = canvas.getContext('2d');
  sigCtx.scale(dpr, dpr);
  sigCtx.fillStyle = '#fff';
  sigCtx.fillRect(0, 0, canvas.width, canvas.height);
  sigCtx.strokeStyle = '#1a1a2e';
  sigCtx.lineWidth = 2.5;
  sigCtx.lineCap = 'round';

  const getPos = (e) => {
    const r = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  };
  canvas.addEventListener('mousedown',  e => { sigDrawing = true; const p = getPos(e); sigCtx.beginPath(); sigCtx.moveTo(p.x, p.y); });
  canvas.addEventListener('mousemove',  e => { if (!sigDrawing) return; const p = getPos(e); sigCtx.lineTo(p.x, p.y); sigCtx.stroke(); });
  canvas.addEventListener('mouseup',    () => sigDrawing = false);
  canvas.addEventListener('mouseleave', () => sigDrawing = false);
  canvas.addEventListener('touchstart', e => { e.preventDefault(); sigDrawing = true; const p = getPos(e); sigCtx.beginPath(); sigCtx.moveTo(p.x, p.y); });
  canvas.addEventListener('touchmove',  e => { e.preventDefault(); if (!sigDrawing) return; const p = getPos(e); sigCtx.lineTo(p.x, p.y); sigCtx.stroke(); });
  canvas.addEventListener('touchend',   () => sigDrawing = false);
  document.getElementById('sigColor').addEventListener('input', (e) => { sigCtx.strokeStyle = e.target.value; });
  document.getElementById('sigSize').addEventListener('input',  (e) => { sigCtx.lineWidth = parseFloat(e.target.value); });
}

function clearCanvas() {
  if (!sigCtx) return;
  const canvas = document.getElementById('sigCanvas');
  sigCtx.fillStyle = '#fff';
  sigCtx.fillRect(0, 0, canvas.offsetWidth * (window.devicePixelRatio||1), canvas.offsetHeight * (window.devicePixelRatio||1));
}

function switchSigTab(tab, btn) {
  state.signature.activeTab = tab;
  document.querySelectorAll('.sig-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.sig-panel').forEach(p => p.classList.remove('show'));
  document.getElementById(`sigPanel${tab.charAt(0).toUpperCase() + tab.slice(1)}`).classList.add('show');
  if (tab === 'draw') setTimeout(initSigCanvas, 50);
}

function updateTypedSig() {
  const text  = document.getElementById('sigTypeInput').value;
  const font  = document.getElementById('sigFontSelect').value;
  const color = document.getElementById('sigTypeColor').value;
  const prev  = document.getElementById('sigTypePreview');
  prev.textContent = text || ' ';
  prev.style.fontFamily = `'${font}', cursive`;
  prev.style.color = color;
}

function loadSigImg(input) {
  if (!input.files[0]) return;
  state.signature.uploadedSigImg = input.files[0];
  const url = URL.createObjectURL(input.files[0]);
  const preview = document.getElementById('sigImgPreview');
  document.getElementById('sigImgPreviewEl').src = url;
  preview.style.display = 'block';
}

async function getSigImageBytes() {
  const tab = state.signature.activeTab;
  if (tab === 'draw') {
    const canvas = document.getElementById('sigCanvas');
    return await canvasToBytes(canvas);
  } else if (tab === 'type') {
    return await typedSigToBytes();
  } else if (tab === 'upload') {
    if (!state.signature.uploadedSigImg) throw new Error('No signature image uploaded');
    return await readFileAsArrayBuffer(state.signature.uploadedSigImg);
  }
}

async function canvasToBytes(canvas) {
  return new Promise(resolve => {
    canvas.toBlob(blob => blob.arrayBuffer().then(resolve), 'image/png');
  });
}

async function typedSigToBytes() {
  const text   = document.getElementById('sigTypeInput').value.trim();
  if (!text) throw new Error('Please type your name for the signature');
  const font   = document.getElementById('sigFontSelect').value;
  const color  = document.getElementById('sigTypeColor').value;
  const canvas = document.createElement('canvas');
  canvas.width = 500; canvas.height = 120;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.clearRect(0, 0, 500, 120);
  ctx.fillStyle = color;
  ctx.font = `60px '${font}', cursive`;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 16, 60);
  return await canvasToBytes(canvas);
}

async function runSignPDF() {
  const doc = state.signature.pdfDoc;
  if (!doc) return;
  const btn = document.getElementById('sigApplyBtn');
  btn.disabled = true;
  showProgress('sig');
  try {
    const sigBytes = await getSigImageBytes();
    const sigImg = await doc.embedPng(sigBytes).catch(() => doc.embedJpg(sigBytes));

    const hPos  = document.getElementById('sigHPos').value;
    const vPos  = document.getElementById('sigVPos').value;
    const sigW  = parseInt(document.getElementById('sigWidth').value) || 180;
    const pageSelectVal = document.getElementById('sigPageSelect').value;
    const customPageNum = parseInt(document.getElementById('sigPageNum').value) || 1;
    const totalPages = doc.getPageCount();

    let pagesToSign = [];
    if (pageSelectVal === 'all') pagesToSign = [...Array(totalPages).keys()];
    else if (pageSelectVal === 'first') pagesToSign = [0];
    else if (pageSelectVal === 'last') pagesToSign = [totalPages - 1];
    else pagesToSign = [Math.max(0, Math.min(customPageNum - 1, totalPages - 1))];

    for (const pi of pagesToSign) {
      const page = doc.getPage(pi);
      const { width: pw, height: ph } = page.getSize();
      const { width: iw, height: ih } = sigImg.scale(1);
      const scale = sigW / iw;
      const scaledW = sigW;
      const scaledH = ih * scale;
      const margin = 20;
      let x = margin;
      let y = margin;
      if (hPos === 'center') x = (pw - scaledW) / 2;
      else if (hPos === 'right') x = pw - scaledW - margin;
      if (vPos === 'middle') y = (ph - scaledH) / 2;
      else if (vPos === 'top') y = ph - scaledH - margin;
      page.drawImage(sigImg, { x, y, width: scaledW, height: scaledH });
    }
    const out = await doc.save();
    state.signature.result = out;
    document.getElementById('sigResultInfo').textContent =
      `Signature applied to ${pagesToSign.length} page(s), ${formatBytes(out.byteLength)}`;
    setProgress('sig', 100, 'Done!');
    showResult('sig');
  } catch(e) {
    showToast('Error: ' + e.message, 'error');
    console.error(e);
  } finally {
    btn.disabled = false;
  }
}

/* =================================================================
   DOWNLOAD — opens PDF in browser viewer (new tab)
================================================================= */
function downloadFile(toolKey) {
  let bytes, filename;
  if (toolKey === 'img2pdf')  { bytes = state.img2pdf.result;    filename = 'converted.pdf'; }
  if (toolKey === 'merge')    { bytes = state.mergepdf.result;   filename = 'merged.pdf'; }
  if (toolKey === 'split')    { bytes = state.splitpdf.result;   filename = 'extracted-pages.pdf'; }
  if (toolKey === 'add')      { bytes = state.addpages.result;   filename = 'updated.pdf'; }
  if (toolKey === 'sig')      { bytes = state.signature.result;  filename = 'signed.pdf'; }
  if (!bytes) return showToast('No file to download', 'error');

  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url  = URL.createObjectURL(blob);

  // Open the PDF in the browser's built-in PDF viewer (new tab)
  const tab = window.open(url, '_blank');
  if (!tab) {
    // Popup blocked — fall back to inline link
    showToast('Popup blocked. Click the link below to view.', 'error');
  } else {
    showToast('📄 PDF opened in new tab!', 'success');
  }
  // Revoke after 60 s so the tab still has time to render
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/* =================================================================
   HELPERS
================================================================= */
function readFileAsArrayBuffer(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = e => res(e.target.result);
    r.onerror = rej;
    r.readAsArrayBuffer(file);
  });
}

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1024*1024) return (b/1024).toFixed(1) + ' KB';
  return (b/1024/1024).toFixed(2) + ' MB';
}

function setupDragDrop(zone, input, handler) {
  zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop',      e => {
    e.preventDefault(); zone.classList.remove('dragover');
    handler(e.dataTransfer.files);
  });
}

function showProgress(key) {
  const el = document.getElementById(`${key}Progress`);
  if (el) el.classList.add('show');
}
function hideProgress(key) {
  const el = document.getElementById(`${key}Progress`);
  if (el) el.classList.remove('show');
}
function setProgress(key, pct, label) {
  const fill  = document.getElementById(`${key}Fill`);
  const lbl   = document.getElementById(`${key}Label`);
  if (fill) fill.style.width = pct + '%';
  if (lbl)  lbl.textContent = label;
}
function showResult(key) {
  const el = document.getElementById(`${key}Result`);
  if (el) { el.classList.add('show'); el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  hideProgress(key);
}

/* Toast */
function showToast(msg, type = '') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 4200);
}
