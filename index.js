const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());

// -------------------------------------------------
// PRODUCT DATABASE (EXTENDED)
// -------------------------------------------------
const products = [
  // Mobiles
  {
    name: "Samsung Galaxy S21",
    brand: "Samsung",
    category: "mobile",
    price: 45000,
    features: ["5G", "AMOLED"],
  },
  {
    name: "Samsung A52",
    brand: "Samsung",
    category: "mobile",
    price: 26000,
    features: ["AMOLED"],
  },
  {
    name: "iPhone 13",
    brand: "Apple",
    category: "mobile",
    price: 60000,
    features: ["OLED"],
  },

  // Laptops
  {
    name: "HP Pavilion 15",
    brand: "HP",
    category: "laptop",
    price: 52000,
    features: ["SSD"],
  },
  {
    name: "Dell Inspiron 3501",
    brand: "Dell",
    category: "laptop",
    price: 47000,
    features: ["SSD"],
  },
  {
    name: "Asus VivoBook 14",
    brand: "Asus",
    category: "laptop",
    price: 43000,
    features: ["SSD"],
  },

  // Tablets
  {
    name: "Samsung Tab A7",
    brand: "Samsung",
    category: "tablet",
    price: 21000,
    features: ["WiFi"],
  },
  {
    name: "iPad 9th Gen",
    brand: "Apple",
    category: "tablet",
    price: 30000,
    features: ["Retina"],
  },

  // Headphones
  {
    name: "Boat Airdopes 141",
    brand: "Boat",
    category: "headphones",
    price: 999,
    features: ["Bluetooth"],
  },
  {
    name: "Sony WH-1000XM4",
    brand: "Sony",
    category: "headphones",
    price: 24000,
    features: ["Bluetooth", "noise cancelling"],
  },

  // Smartwatch
  {
    name: "Boat Xtend Smartwatch",
    brand: "Boat",
    category: "smartwatch",
    price: 3000,
    features: ["Bluetooth"],
  },
  {
    name: "Apple Watch SE",
    brand: "Apple",
    category: "smartwatch",
    price: 28000,
    features: ["Heart rate"],
  },

  // Speakers
  {
    name: "JBL Flip 5",
    brand: "JBL",
    category: "speakers",
    price: 9000,
    features: ["Bass"],
  },
  {
    name: "Boat Stone 350",
    brand: "Boat",
    category: "speakers",
    price: 1800,
    features: ["Bluetooth"],
  },

  // Cameras
  {
    name: "Canon EOS 1500D",
    brand: "Canon",
    category: "camera",
    price: 38000,
    features: ["DSLR"],
  },
  {
    name: "Sony A6100",
    brand: "Sony",
    category: "camera",
    price: 60000,
    features: ["Mirrorless"],
  },
];

// -------------------------------------------------
// CATEGORY NORMALIZATION (BASED ON YOUR ENTITY)
// -------------------------------------------------
const CATEGORY_MAP = {
  mobile: ["phone", "phones", "mobile", "mobiles", "smartphone", "smartphones"],
  laptop: ["laptop", "laptops", "pc", "pcs", "notebook", "notebooks"],
  headphones: [
    "headphones",
    "headphone",
    "earphones",
    "headset",
    "headsets",
    "earbud",
    "earbuds",
    "airpods",
    "airpod",
  ],
  smartwatch: [
    "smartwatch",
    "smartwatches",
    "watch",
    "watches",
    "smartbands",
    "smartband",
  ],
  speakers: ["speaker", "speakers", "sound system"],
  tablet: ["tablet", "tablets", "tab", "tabs"],
  camera: ["camera", "cameras", "dslr", "dslrs", "cam", "cams"],
};

// -------------------------------------------------
// NORMALIZATION HELPERS
// -------------------------------------------------
function normalizeCategory(cat) {
  if (!cat) return "";

  cat = cat.toLowerCase().trim();

  // direct match inside map
  for (const key in CATEGORY_MAP) {
    if (CATEGORY_MAP[key].includes(cat)) {
      return key;
    }
  }

  // plural to singular (e.g., smartwatches → smartwatch)
  if (cat.endsWith("s")) {
    const singular = cat.slice(0, -1);
    for (const key in CATEGORY_MAP) {
      if (CATEGORY_MAP[key].includes(singular)) {
        return key;
      }
    }
  }

  return cat; // fallback
}

function normalizeBrand(brand) {
  if (!brand) return "";
  return brand.toLowerCase().trim();
}

function normalizeFeature(f) {
  if (!f) return "";
  return f.toLowerCase().trim();
}

// -------------------------------------------------
// PRODUCT FILTER FUNCTION
// -------------------------------------------------
function filterProducts(parameters) {
  let { brand, category, price, features } = parameters;

  // unwrap arrays
  brand = brand?.[0] || "";
  category = category?.[0] || "";
  price = price?.[0] || "";
  features = features?.[0] || "";

  // Normalize values
  category = normalizeCategory(category);
  brand = normalizeBrand(brand);
  features = normalizeFeature(features);

  let results = products;

  if (category) {
    results = results.filter((p) => p.category === category);
  }
  if (brand) {
    results = results.filter((p) => p.brand.toLowerCase() === brand);
  }
  if (price) {
    results = results.filter((p) => p.price <= parseInt(price));
  }
  if (features) {
    results = results.filter((p) =>
      p.features.map((x) => x.toLowerCase()).includes(features)
    );
  }

  return results;
}

// -------------------------------------------------
// MAIN WEBHOOK ENDPOINT
// -------------------------------------------------
app.post("/webhook", (req, res) => {
  const intentName = req.body.queryResult.intent.displayName;
  const parameters = req.body.queryResult.parameters;

  console.log("Intent:", intentName);
  console.log("Parameters:", parameters);

  if (intentName === "search_product") {
    const results = filterProducts(parameters);

    if (results.length === 0) {
      return res.json({
        fulfillmentText:
          "Sorry, I couldn't find any matching products. Try changing brand, category, or price range.",
      });
    }

    const productList = results
      .map((p) => `${p.name} (₹${p.price})`)
      .join(", ");

    return res.json({
      fulfillmentText: `Here are some products you may like: ${productList}`,
    });
  }

  return res.json({
    fulfillmentText: "I'm not sure how to handle that.",
  });
});

// -------------------------------------------------
app.listen(3000, () => {
  console.log("Webhook server running on port 3000");
});
