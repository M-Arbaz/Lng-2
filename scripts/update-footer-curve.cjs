const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'Footer.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace with blob/bubble effect that has a curved top touching center
const oldCSS = `        .fill-btn {
          overflow: hidden;
        }
        .fill-btn .fill-layer {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 0%;
          background: #059669;
          transition: height 0.5s cubic-bezier(0.22, 0.9, 0.32, 1);
          pointer-events: none;
          z-index: 0;
          border-radius: 0 0 9999px 9999px;
        }
        .fill-btn.fill-amber .fill-layer {
          background: #d97706;
        }
        .fill-btn:hover .fill-layer {
          height: 100%;
        }
        @media (prefers-reduced-motion: reduce) {
          .fill-btn:hover .fill-layer { transition: none; height: 100%; }
        }`;

const newCSS = `        .fill-btn {
          overflow: hidden;
        }
        .fill-btn .fill-layer {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 0%;
          background: #059669;
          transition: height 0.5s cubic-bezier(0.22, 0.9, 0.32, 1);
          pointer-events: none;
          z-index: 0;
        }
        .fill-btn .fill-layer::before {
          content: '';
          position: absolute;
          top: -16px;
          left: 0;
          right: 0;
          height: 32px;
          background: #059669;
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .fill-btn.fill-amber .fill-layer {
          background: transparent;
        }
        .fill-btn.fill-amber .fill-layer::before {
          background: #d97706;
        }
        .fill-btn:hover .fill-layer {
          height: 100%;
        }
        .fill-btn:hover .fill-layer::before {
          opacity: 1;
        }
        @media (prefers-reduced-motion: reduce) {
          .fill-btn:hover .fill-layer { transition: none; height: 100%; }
          .fill-btn:hover .fill-layer::before { opacity: 1; }
        }`;

content = content.replace(oldCSS, newCSS);

fs.writeFileSync(filePath, content);
console.log('Bubble/blob top curve added!');