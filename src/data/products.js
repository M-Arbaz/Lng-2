export const PRODUCTS = [
  {
    id: 1,
    name: "Mushroom Floor Lamp",
    category: "Floor Lamp",
    price: 24500,
    compareAtPrice: 20000,
    image: "https://www.lampandglow.com/cdn/shop/files/MushroomFloorLamp_2.webp?v=1747793187",
    images: [
      "https://www.lampandglow.com/cdn/shop/files/MushroomFloorLamp_8.webp?v=1747793187",
      "https://www.lampandglow.com/cdn/shop/files/MushroomFloorLamp_9.webp?v=1747793187",
      "https://www.lampandglow.com/cdn/shop/files/MushroomFloorLamp_4.webp?v=1747793187",
      "https://www.lampandglow.com/cdn/shop/files/MushroomFloorLamp_7.webp?v=1747793187"
    ],
    sku: "LG-LAMP-0001",
    stock: 20,
    bulbOptions: ["With Bulb", "Without Bulb"],
    productType: "Bedside lamp",
    description: `Mushroom Floor Lamp
A grounded silhouette with elevated simplicity.

Crafted for interiors that celebrate subtlety and sculptural form.
Perfect for bedrooms, living rooms, and reading corners.`,
    productDetails: {
      baseMaterial: "Solid wood",
      shadeMaterial: "Premium linen blend fabric",
      colorVariants: [
        { name: "Deep Espresso Brown", image: "https://www.lampandglow.com/cdn/shop/files/MushroomFloorLamp_2.webp?v=1747793187" },
        { name: "Black", image: "https://www.lampandglow.com/cdn/shop/files/MushroomFloorLamp_8.webp?v=1747793187" },
        { name: "White", image: "https://www.lampandglow.com/cdn/shop/files/MushroomFloorLamp_9.webp?v=1747793187" }
      ],
      height: "60 inches",
      socket: "E27",
      maxWattage: "16W"
    },
    bulbEnabled: true,
    bulbPrice: 500,
  },

  {
    id: 2,
    name: "Briar Floor Lamp",
    category: "Floor Lamp",
    price: 21000,
    compareAtPrice: 19000,
    image: "https://www.lampandglow.com/cdn/shop/files/BriarFloorLamps_6.webp?v=1747862569",
    images: [
      "https://www.lampandglow.com/cdn/shop/files/BriarFloorLamps_2.webp?v=1747862569",
      "https://www.lampandglow.com/cdn/shop/files/6_1acde5f0-6461-45d6-93f7-c63c61e1896d.webp?v=1747863020",
      "https://www.lampandglow.com/cdn/shop/files/BriarFloorLamps_3.webp?v=1747862569"
    ],
    sku: "LG-LAMP-0002",
    stock: 20,
    bulbOptions: ["With Bulb", "Without Bulb"],
    productType: "Desk lamp",
    description: `Briar Floor Lamp
Elegance carved in wood. Light sculpted in warmth.`,
    productDetails: {
      height: "63 inches",
      material: "Solid wood base, linen shade",
      socket: "E26/E27",
      voltage: "220–240V",
      colorVariants: [
        { name: "Light Brown", image: "https://www.lampandglow.com/cdn/shop/files/BriarFloorLamps_6.webp?v=1747862569" },
        { name: "Deep Espresso Brown", image: "https://www.lampandglow.com/cdn/shop/files/BriarFloorLamps_2.webp?v=1747862569" }
      ]
    },
    bulbEnabled: true,
    bulbPrice: 500,
  },

  {
    id: 3,
    name: "Moon Walker Floor Lamp",
    category: "Floor Lamp",
    price: 12500,
    compareAtPrice: 11000,
    image: "https://www.lampandglow.com/cdn/shop/files/Moon_Walker_Lamp.png?v=1732800905",
    images: [
      "https://www.lampandglow.com/cdn/shop/files/Moon_Walker_Floor_Lamp_2.webp?v=1732801306",
      "https://www.lampandglow.com/cdn/shop/files/Moon_Walker_Floor_Lamp_3.webp?v=1732801479"
    ],
    sku: "LG-TABLE-00012",
    stock: 20,
    bulbOptions: ["With Bulb", "Without Bulb"],
    productType: "Floor lamp",
    description: `Handcrafted from solid pine wood.
Elegant, lightweight, and durable.`,
    productDetails: {
      material: "Solid Pine Wood",
      finish: "Dark walnut",
      bulbType: "E27",
      height: "4.8 feet",
      colorVariants: [
        { name: "Dark Walnut", image: "https://www.lampandglow.com/cdn/shop/files/Moon_Walker_Lamp.png?v=1732800905" },
        { name: "Natural Pine", image: "https://www.lampandglow.com/cdn/shop/files/Moon_Walker_Floor_Lamp_2.webp?v=1732801306" }
      ]
    },
    bulbEnabled: true,
    bulbPrice: 500,
  },

  {
    id: 4,
    name: "Rustic Rope Wooden 4 Lamp Square Chandelier",
    category: "Roof/Ceiling Wooden Lamps",
    price: 24000,
    compareAtPrice: 20000,
    image: "https://www.lampandglow.com/cdn/shop/files/140.png?v=1719989196",
    images: [
      "https://www.lampandglow.com/cdn/shop/files/Product_Pictures_1.webp?v=1720512730"
    ],
    sku: "LG-TABLE-0002",
    stock: 20,
    bulbOptions: ["With Bulb", "Without Bulb"],
    productType: "Ceiling Lamp",
    description: "Rustic wooden chandelier with modern elegance.",
    productDetails: {
      colorVariants: [
        { name: "Rustic Brown", image: "https://www.lampandglow.com/cdn/shop/files/140.png?v=1719989196" },
        { name: "Black", image: "https://www.lampandglow.com/cdn/shop/files/Product_Pictures_1.webp?v=1720512730" }
      ],
      material: "Natural Wood",
      finish: "Walnut Varnish",
      socket: "E27",
      length: "65 cm"
    },
    bulbEnabled: true,
    bulbPrice: 500,
  },

  {
    id: 5,
    name: "Hemp Rope Metal Hollow Pendant Light",
    category: "Roof/Ceiling Wooden Lamps",
    price: 12500,
    compareAtPrice: 9999,
    image: "https://www.lampandglow.com/cdn/shop/files/2_a9fd8981-7f23-4116-8a8c-fd37e544fe1a.webp?v=1720093595",
    images: [
      "https://www.lampandglow.com/cdn/shop/files/1_dbf85081-9fb2-4f85-9cb6-ab5c904fd0f7_large.webp?v=1720093595",
      "https://www.lampandglow.com/cdn/shop/files/5_cee77c1e-80a8-4d20-8a2e-3a827a29b402_large.webp?v=1720093595"
    ],
    sku: "LG-DECOR-0001",
    stock: 20,
    bulbOptions: ["With Bulb", "Without Bulb"],
    productType: "Pendant Light",
    description: "Vintage hemp rope pendant with metal finish.",
    productDetails: {
      material: "Hemp Rope, Iron",
      socket: "E27",
      voltage: "220–240V",
      colorVariants: [
        { name: "Natural", image: "https://www.lampandglow.com/cdn/shop/files/2_a9fd8981-7f23-4116-8a8c-fd37e544fe1a.webp?v=1720093595" }
      ]
    },
    bulbEnabled: true,
    bulbPrice: 500,
  },

  {
    id: 6,
    name: "Wooden Log Cutting Lamp",
    category: "Table Lamp",
    price: 8500,
    compareAtPrice: 7000,
    image: "https://www.lampandglow.com/cdn/shop/files/CuttingLogWoodenLamp_4.webp?v=1746759258",
    images: [
      "https://www.lampandglow.com/cdn/shop/files/3in1_7aa55042-9cc0-4ded-994d-aec9c2887176_large.webp?v=1747131700",
      "https://www.lampandglow.com/cdn/shop/files/CuttingLogWoodenLamp_1_large.webp?v=1747131700"
    ],
    sku: "LG-DECOR-0002",
    stock: 10,
    bulbOptions: ["With Bulb", "Without Bulb"],
    productType: "Table Lamp",
    description: "Rustic stacked wooden log lamp.",
    productDetails: {
      material: "Wood logs",
      height: "24 cm",
      diameter: "25 cm",
      colorVariants: [
        { name: "Natural Wood", image: "https://www.lampandglow.com/cdn/shop/files/CuttingLogWoodenLamp_4.webp?v=1746759258" }
      ]
    },
    bulbEnabled: true,
    bulbPrice: 500,
  }
];
