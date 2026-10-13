const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'AdminLayout.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add Shipping Fees menu item before Shipping Policy
const oldText = `    {
      label: 'Shipping Policy',
      icon: Truck,
      path: '/admin/shipping-policy',
    },`;

const newText = `    {
      label: 'Shipping Fees',
      icon: Truck,
      path: '/admin/shipping-fees',
    },
    {
      label: 'Shipping Policy',
      icon: FileText,
      path: '/admin/shipping-policy',
    },`;

content = content.replace(oldText, newText);

fs.writeFileSync(filePath, content);
console.log('Shipping Fees button added to admin sidebar!');