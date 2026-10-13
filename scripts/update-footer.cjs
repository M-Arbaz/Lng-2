const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'Footer.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Change transition duration from 0.8s to 0.5s
content = content.replace(
  'transition: height 0.8s cubic-bezier(0.22, 0.9, 0.32, 1)',
  'transition: height 0.5s cubic-bezier(0.22, 0.9, 0.32, 1)'
);

// Reduce newsletter section padding from p-4 to p-3
content = content.replace(
  'rounded-xl bg-[#5A2D0C] p-4 -mx-2 sm:mx-0">',
  'rounded-xl bg-[#5A2D0C] p-3 -mx-2 sm:mx-0">'
);

// Reduce description margin from mt-2 to mt-1.5
content = content.replace(
  '<p className="mt-2 text-sm text-white/90">',
  '<p className="mt-1.5 text-sm text-white/90">'
);

// Reduce form margin from mt-3 to mt-2
content = content.replace(
  '<form onSubmit={handleNewsletterSubmit} className="mt-3 mx-auto sm:mx-0">',
  '<form onSubmit={handleNewsletterSubmit} className="mt-2 mx-auto sm:mx-0">'
);

// Reduce gap from gap-2 to gap-1.5
content = content.replace(
  '<div className="flex flex-col sm:flex-row gap-2">',
  '<div className="flex flex-col sm:flex-row gap-1.5">'
);

// Reduce input padding from px-4 py-2.5 to px-3 py-2
content = content.replace(
  'className="w-full flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#FFD400]"',
  'className="w-full flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#FFD400]"'
);

// Reduce button padding from px-5 py-2.5 to px-4 py-2
content = content.replace(
  'className="water-fill-btn water-fill-amber group relative shrink-0 whitespace-nowrap rounded-lg bg-[#FFD400] px-5 py-2.5 text-sm font-semibold text-[#222222] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"',
  'className="water-fill-btn water-fill-amber group relative shrink-0 whitespace-nowrap rounded-lg bg-[#FFD400] px-4 py-2 text-sm font-semibold text-[#222222] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"'
);

fs.writeFileSync(filePath, content);
console.log('Footer.jsx updated successfully!');