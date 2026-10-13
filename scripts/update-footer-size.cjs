const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'Footer.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Increase padding from p-2 to p-2.5
content = content.replace(
  'rounded-xl bg-[#5A2D0C] p-2 -mx-2 sm:mx-0">',
  'rounded-xl bg-[#5A2D0C] p-2.5 -mx-2 sm:mx-0">'
);

// Increase description margin from mt-0.5 to mt-1
content = content.replace(
  '<p className="mt-0.5 text-sm text-white/90">',
  '<p className="mt-1 text-sm text-white/90">'
);

// Increase form margin from mt-1.5 to mt-2
content = content.replace(
  '<form onSubmit={handleNewsletterSubmit} className="mt-1.5 mx-auto sm:mx-0">',
  '<form onSubmit={handleNewsletterSubmit} className="mt-2 mx-auto sm:mx-0">'
);

fs.writeFileSync(filePath, content);
console.log('Newsletter card height increased by ~10%!');