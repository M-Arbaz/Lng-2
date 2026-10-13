const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'ProductDetail.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// ===== 1. Replace bulb option buttons =====

var oldBulbSection = '             {"/*"} ── Bulb Options ── {"*/"}\n';
oldBulbSection += '              {product.bulbEnabled && bulbOptions.length > 0 && (\n';
oldBulbSection += '                <div className="mt-5 border-t border-stone-200 pt-5">\n';
oldBulbSection += '                  <p className="text-[13px] font-semibold text-stone-800">\n';
oldBulbSection += '                    Bulb: <span className="font-normal text-stone-500">{selectedBulbOption || bulbOptions[0]}</span>\n';
oldBulbSection += '                  </p>\n';
oldBulbSection += '                  <div className="mt-3 flex items-center gap-2">\n';
oldBulbSection += '                    {bulbOptions.map((opt) => {\n';
oldBulbSection += '                      const active = selectedBulbOption ? selectedBulbOption === opt : opt === bulbOptions[0]\n';
oldBulbSection += "                      const isWith = String(opt).toLowerCase().includes('with') && !String(opt).toLowerCase().includes('without')\n";
oldBulbSection += '                      return (\n';
oldBulbSection += '                        <button\n';
oldBulbSection += '                          key={opt}\n';
oldBulbSection += '                          type="button"\n';
oldBulbSection += '                          onClick={() => setSelectedBulbOption(opt)}\n';
oldBulbSection += '                          className={classNames(\n';
oldBulbSection += "                            'px-4 py-2.5 border text-[13px] transition-all duration-200',\n";
oldBulbSection += '                            active\n';
oldBulbSection += "                              ? 'border-stone-900 bg-stone-900 text-white font-semibold'\n";
oldBulbSection += "                              : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500',\n";
oldBulbSection += '                          )}\n';
oldBulbSection += '                        >\n';
oldBulbSection += '                          {opt} {isWith ? (`(+Rs.${bulbPrice.toLocaleString()})`) : (`(-Rs.${bulbPrice.toLocaleString()})`)}\n';
oldBulbSection += '                        </button>\n';
oldBulbSection += '                      )\n';
oldBulbSection += '                    })}\n';
oldBulbSection += '                  </div>\n';
oldBulbSection += '                </div>\n';
oldBulbSection += '              )}';

var newBulbSection = '             {"/*"} ── Bulb Option: With / Without {"*/"}\n';
newBulbSection += '              {(product.bulbEnabled || bulbOptions.length > 0) && (\n';
newBulbSection += '                <div className="mt-5 border-t border-stone-200 pt-5">\n';
newBulbSection += '                  <p className="text-[13px] font-semibold text-stone-800">\n';
newBulbSection += '                    Bulb Option\n';
newBulbSection += '                  </p>\n';
newBulbSection += '                  <div className="mt-3 flex items-center gap-4">\n';
newBulbSection += '                    <label className={classNames(\n';
newBulbSection += "                      'flex items-center gap-2 px-4 py-2.5 border text-[13px] cursor-pointer transition-all duration-200',\n";
newBulbSection += "                      selectedBulbOption === 'with'\n";
newBulbSection += "                        ? 'border-stone-900 bg-stone-900 text-white font-semibold'\n";
newBulbSection += "                        : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500',\n";
newBulbSection += '                    )}>\n';
newBulbSection += '                      <input\n';
newBulbSection += '                        type="radio"\n';
newBulbSection += '                        name="bulbOption"\n';
newBulbSection += '                        value="with"\n';
newBulbSection += '                        checked={selectedBulbOption === "with"}\n';
newBulbSection += '                        onChange={() => setSelectedBulbOption("with")}\n';
newBulbSection += '                        className="sr-only"\n';
newBulbSection += '                      />\n';
newBulbSection += '                      With Bulb (+Rs.{bulbPrice.toLocaleString()})\n';
newBulbSection += '                    </label>\n';
newBulbSection += '                    <label className={classNames(\n';
newBulbSection += "                      'flex items-center gap-2 px-4 py-2.5 border text-[13px] cursor-pointer transition-all duration-200',\n";
newBulbSection += "                      selectedBulbOption === 'without'\n";
newBulbSection += "                        ? 'border-stone-900 bg-stone-900 text-white font-semibold'\n";
newBulbSection += "                        : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500',\n";
newBulbSection += '                    )}>\n';
newBulbSection += '                      <input\n';
newBulbSection += '                        type="radio"\n';
newBulbSection += '                        name="bulbOption"\n';
newBulbSection += '                        value="without"\n';
newBulbSection += '                        checked={selectedBulbOption === "without"}\n';
newBulbSection += '                        onChange={() => setSelectedBulbOption("without")}\n';
newBulbSection += '                        className="sr-only"\n';
newBulbSection += '                      />\n';
newBulbSection += '                      Without Bulb (-Rs.{bulbPrice.toLocaleString()})\n';
newBulbSection += '                    </label>\n';
newBulbSection += '                  </div>\n';
newBulbSection += '                </div>\n';
newBulbSection += '              )}';

content = content.replace(oldBulbSection, newBulbSection);

// ===== 2. Add fill-btn CSS styles =====

var styleBlock = '    <section className="w-full">\n';
styleBlock += '      <style>{`\n';
styleBlock += '        .fill-btn {\n';
styleBlock += '          overflow: hidden;\n';
styleBlock += '        }\n';
styleBlock += '        .fill-btn .fill-layer {\n';
styleBlock += '          position: absolute;\n';
styleBlock += '          left: 0;\n';
styleBlock += '          right: 0;\n';
styleBlock += '          bottom: 0;\n';
styleBlock += '          height: 0%;\n';
styleBlock += '          transition: height 0.8s cubic-bezier(0.22, 0.9, 0.32, 1);\n';
styleBlock += '          pointer-events: none;\n';
styleBlock += '          z-index: 0;\n';
styleBlock += '        }\n';
styleBlock += '        .fill-btn .fill-layer::before {\n';
styleBlock += "          content: '';\n";
styleBlock += '          position: absolute;\n';
styleBlock += '          top: -12px;\n';
styleBlock += '          left: 0;\n';
styleBlock += '          right: 0;\n';
styleBlock += '          height: 24px;\n';
styleBlock += '          border-radius: 50%;\n';
styleBlock += '          opacity: 0;\n';
styleBlock += '          transition: opacity 0.3s ease;\n';
styleBlock += '        }\n';
styleBlock += '        .fill-btn.fill-dark .fill-layer {\n';
styleBlock += '          background: #FFD400;\n';
styleBlock += '        }\n';
styleBlock += '        .fill-btn.fill-dark .fill-layer::before {\n';
styleBlock += '          background: #FFD400;\n';
styleBlock += '        }\n';
styleBlock += '        .fill-btn.fill-amber .fill-layer {\n';
styleBlock += '          background: #b45309;\n';
styleBlock += '        }\n';
styleBlock += '        .fill-btn.fill-amber .fill-layer::before {\n';
styleBlock += '          background: #b45309;\n';
styleBlock += '        }\n';
styleBlock += '        .fill-btn:hover .fill-layer {\n';
styleBlock += '          height: 100%;\n';
styleBlock += '        }\n';
styleBlock += '        .fill-btn:hover .fill-layer::before {\n';
styleBlock += '          opacity: 1;\n';
styleBlock += '        }\n';
styleBlock += '        @media (prefers-reduced-motion: reduce) {\n';
styleBlock += '          .fill-btn:hover .fill-layer { transition: none; height: 100%; }\n';
styleBlock += '          .fill-btn:hover .fill-layer::before { opacity: 1; }\n';
styleBlock += '        }\n';
styleBlock += '      `}</style>';

content = content.replace('    <section className="w-full">', styleBlock);

// ===== 3. Update Add to Cart button =====

content = content.replace(
  'className={classNames(\n                    \'relative h-12 flex-1 overflow-hidden bg-[#5A2D0C] text-white text-[13px] font-semibold tracking-wide uppercase transition-colors duration-200 hover:bg-[#FFD400] hover:text-[#222222] active:scale-[0.99]\',\n                    !inStock && \'opacity-50 cursor-not-allowed\',\n                  )}\n                >\n                Add To Cart\n              </button>',
  'className={classNames(\n                    \'fill-btn fill-dark group relative h-12 flex-1 overflow-hidden bg-[#5A2D0C] text-white text-[13px] font-semibold tracking-wide uppercase\',\n                    !inStock && \'opacity-50 cursor-not-allowed\',\n                  )}\n                >\n                  <span className="fill-layer" aria-hidden="true" />\n                  <span className="relative z-10 transition-colors group-hover:text-[#222222]">Add To Cart</span>\n                </button>'
);

// ===== 4. Update Buy It Now button =====

content = content.replace(
  'className={classNames(\n                  \'mt-3 h-12 w-full bg-[#FFD400] text-[#222222] text-[13px] font-semibold tracking-wide uppercase transition-colors duration-200 hover:bg-[#FFE566] active:scale-[0.99]\',\n                  !inStock && \'opacity-50 cursor-not-allowed\',\n                )}\n                >\n                Buy It Now\n              </button>',
  'className={classNames(\n                  \'fill-btn fill-amber group relative mt-3 h-12 w-full overflow-hidden bg-[#FFD400] text-[#222222] text-[13px] font-semibold tracking-wide uppercase\',\n                  !inStock && \'opacity-50 cursor-not-allowed\',\n                )}\n                >\n                  <span className="fill-layer" aria-hidden="true" />\n                  <span className="relative z-10 transition-colors group-hover:text-white">Buy It Now</span>\n                </button>'
);

// ===== 5. Update bulb logic =====

content = content.replace(
  "  const selectedBulb = selectedBulbOption || (bulbOptions[0] ?? '')\n  const isWithBulb =\n    selectedBulb &&\n    String(selectedBulb).toLowerCase().includes('with') &&\n    !String(selectedBulb).toLowerCase().includes('without')\n  const bulbPrice = typeof product?.bulbPrice === 'number' ? product.bulbPrice : 500",
  "  const selectedBulb = selectedBulbOption || 'with'\n  const isWithBulb = selectedBulb === 'with'\n  const bulbPrice = typeof product?.bulbPrice === 'number' ? product.bulbPrice : 500"
);

// ===== 6. Update bulbOption in addToCart payload =====

content = content.replace('bulbOption: selectedBulb || null,', 'bulbOption: selectedBulb,');

fs.writeFileSync(filePath, content);
console.log('ProductDetail.jsx updated successfully!');