const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'Footer.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace water-fill-btn CSS with simple clean fill (no waves, no shake)
const oldCSS = `        .water-fill-btn {
          overflow: hidden;
        }
        /* Liquid layer: starts at 0 height and rises from bottom to top on hover */
        .water-fill-btn .wa-water {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 0%;
          background: linear-gradient(180deg, #6ee7b7 0%, #10b981 55%, #047857 100%);
          transition: height 0.5s cubic-bezier(0.22, 0.9, 0.32, 1);
          pointer-events: none;
          z-index: 0;
        }
        /* Amber variant used on the Subscribe button to suit its yellow background */
        .water-fill-btn.water-fill-amber .wa-water {
          background: linear-gradient(180deg, #fde68a 0%, #f59e0b 55%, #b45309 100%);
        }
        .water-fill-btn:hover .wa-water {
          height: 100%;
        }
        /* Wavy surface riding on top of the rising liquid */
        .water-fill-btn .wa-water::before,
        .water-fill-btn .wa-water::after {
          content: '';
          position: absolute;
          top: -8px;
          left: -25%;
          width: 150%;
          height: 16px;
          background: inherit;
          border-radius: 45%;
          opacity: 0;
          transition: opacity 0.3s ease 0.4s;
        }
        .water-fill-btn .wa-water::after {
          left: -55%;
        }
        .water-fill-btn:hover .wa-water::before,
        .water-fill-btn:hover .wa-water::after {
          opacity: 1;
          animation: wa-wave-drift 2.2s ease-in-out infinite;
        }
        .water-fill-btn:hover .wa-water::after {
          animation-duration: 2.8s;
          animation-direction: reverse;
        }
        @keyframes wa-wave-drift {
          0%, 100% { transform: translateX(-4%) scaleY(1); }
          50% { transform: translateX(4%) scaleY(0.6); }
        }
        .water-fill-btn:hover {
          animation: wa-shake 0.5s ease-in-out 1;
        }
        @keyframes wa-shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          15% { transform: translateX(-4px) rotate(-6deg); }
          30% { transform: translateX(4px) rotate(6deg); }
          45% { transform: translateX(-3px) rotate(-4deg); }
          60% { transform: translateX(3px) rotate(4deg); }
          80% { transform: translateX(-1px) rotate(-1deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .water-fill-btn:hover { animation: none; }
          .water-fill-btn:hover .wa-water { transition: none; height: 100%; }
          .water-fill-btn:hover .wa-water::before,
          .water-fill-btn:hover .wa-water::after { animation: none; }
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
          transition: height 0.4s cubic-bezier(0.22, 0.9, 0.32, 1);
          pointer-events: none;
          z-index: 0;
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

content = content.replace(oldCSS, newCSS);

// Update class references
content = content.replace(/water-fill-btn/g, 'fill-btn');
content = content.replace(/water-fill-amber/g, 'fill-amber');
content = content.replace(/wa-water/g, 'fill-layer');

// Reduce newsletter card height further - change p-3 to p-2.5
content = content.replace(
  'rounded-xl bg-[#5A2D0C] p-3 -mx-2 sm:mx-0">',
  'rounded-xl bg-[#5A2D0C] p-2.5 -mx-2 sm:mx-0">'
);

// Make heading text-xs
content = content.replace(
  '<p className="text-sm font-semibold text-[#FFFFFF]">\n                Newsletter Sign Up\n              </p>\n              <p className="mt-1.5 text-sm text-white/90">',
  '<p className="text-xs font-semibold text-[#FFFFFF]">\n                Newsletter Sign Up\n              </p>\n              <p className="mt-1 text-xs text-white/90">'
);

fs.writeFileSync(filePath, content);
console.log('Footer.jsx updated successfully!');