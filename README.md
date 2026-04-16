# PDFMASTER

👇

📄 PDF Converter Web App

A modern, client-side PDF utility web app built using pure HTML, CSS, and JavaScript.
No backend, no uploads — everything runs securely in your browser.

🚀 Overview

This is a single-page application that provides multiple PDF tools in one place:

Convert images to PDF
Merge multiple PDFs
Split PDFs into images
Add pages to PDFs
Add signatures to PDFs

All processing happens locally in the browser, ensuring:

🔒 Privacy (no file uploads)
⚡ Fast performance
🌐 Offline capability (after load)
✨ Features
🖼️ IMG → PDF

Convert images (JPG, PNG, WebP) into a downloadable PDF file.

📚 Merge PDF

Combine multiple PDF files into a single document.

✂️ Split PDF → Images

Extract each page of a PDF and download them as PNG images (ZIP file).

➕ Add Pages to PDF

Insert:

Blank pages
Image-based pages
into an existing PDF.
✍️ Add Signature to PDF
Draw signature using canvas
Or upload an image signature
Place it anywhere on the PDF
🛠️ Tech Stack
Library	Purpose
pdf-lib	Create, merge, and modify PDFs
PDF.js	Render PDF pages to canvas
JSZip	Bundle split images into ZIP
FileSaver.js	Trigger file downloads
🎨 UI / Design
🌑 Dark glassmorphism theme
🌌 Deep navy/indigo gradient background
🎯 Accent colors:
Cyan: #00D4FF
Purple: #7B2FBE
🔤 Fonts:
Inter
Space Grotesk
UI Highlights
Animated hero section with floating particles
Gradient text effects
Glass-style feature cards
Hover animations with icons
Drag-and-drop upload zones
Animated progress bars
Toast notifications (success/error)
📁 Project Structure
d:\New_Pro\
└── pdf-converter\
    └── index.html
