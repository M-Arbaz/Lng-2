const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'Footer.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace newsletter card with much more compact version - p-2.5 to p-2
content = content.replace(
  'rounded-xl bg-[#5A2D0C] p-2.5 -mx-2 sm:mx-0">',
  'rounded-xl bg-[#5A2D0C] p-2 -mx-2 sm:mx-0">'
);

// Make heading text-[11px] (smaller than text-xs)
content = content.replace(
  '<p className="text-xs font-semibold text-[#FFFFFF]">\n                Newsletter Sign Up\n              </p>\n              <p className="mt-1 text-xs text-white/90">\n                Receive our latest updates about our products & promotions.\n              </p>',
  '<p className="text-[11px] font-semibold text-[#FFFFFF]">\n                Newsletter Sign Up\n              </p>\n              <p className="mt-0.5 text-[11px] text-white/90">\n                Receive latest updates.\n              </p>'
);

// Reduce form margin
content = content.replace(
  '<form onSubmit={handleNewsletterSubmit} className="mt-2 mx-auto sm:mx-0">',
  '<form onSubmit={handleNewsletterSubmit} className="mt-1.5 mx-auto sm:mx-0">'
);

// Make input field more compact
content = content.replace(
  'className="w-full flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#FFD400]"',
  'className="w-full flex-1 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#FFD400]"'
);

// Make button more compact
content = content.replace(
  'className="fill-btn fill-amber group relative shrink-0 whitespace-nowrap rounded-lg bg-[#FFD400] px-4 py-2 text-sm font-semibold text-[#222222] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"',
  'className="fill-btn fill-amber group relative shrink-0 whitespace-nowrap rounded-lg bg-[#FFD400] px-3 py-1.5 text-xs font-semibold text-[#222222] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"'
);

fs.writeFileSync(filePath, content);
console.log('Newsletter card reduced to minimum height!');