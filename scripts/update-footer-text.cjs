const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'Footer.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Restore font sizes to text-sm while keeping compact padding
content = content.replace(
  '<p className="text-[11px] font-semibold text-[#FFFFFF]">\n                Newsletter Sign Up\n              </p>\n              <p className="mt-0.5 text-[11px] text-white/90">\n                Receive latest updates.\n              </p>',
  '<p className="text-sm font-semibold text-[#FFFFFF]">\n                Newsletter Sign Up\n              </p>\n              <p className="mt-0.5 text-sm text-white/90">\n                Receive the latest updates about our products and promotions.\n              </p>'
);

// Restore input text size to text-sm
content = content.replace(
  'className="w-full flex-1 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#FFD400]"',
  'className="w-full flex-1 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#FFD400]"'
);

// Restore button text size to text-sm
content = content.replace(
  'className="fill-btn fill-amber group relative shrink-0 whitespace-nowrap rounded-lg bg-[#FFD400] px-3 py-1.5 text-xs font-semibold text-[#222222] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"',
  'className="fill-btn fill-amber group relative shrink-0 whitespace-nowrap rounded-lg bg-[#FFD400] px-3 py-1.5 text-sm font-semibold text-[#222222] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"'
);

fs.writeFileSync(filePath, content);
console.log('Font sizes restored to text-sm, compact padding + reduced py kept!');