const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());

// ---------------------------
// PRODUCT DATABASE
// ---------------------------
const products = [
  {
    name: "Samsung Galaxy S21",
    brand: "Samsung",
    category: "mobile",
    price: 45000,
    features: ["AMOLED", "5G"],
  },
  {
    name: "iPhone 13",
    brand: "Apple",
    category: "mobile",
    price: 60000,
    features: ["OLED"],
  },
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
];

// -----------------------------------------
// NORMALIZATION FUNCTION (fix plural forms)
// -----------------------------------------
function normalizeCategory(category) {
  if (!category) return "";

  category = category.toLowerCase().trim();

  // Convert plurals → singular
  const pluralToSingular = {
    mobiles: "mobile",
    phones: "mobile", // "phones" should NOT be matched directly
    phone: "mobile",
    smartphones: "mobile",
    smartphone: "mobile",

    laptops: "laptop",
    notebooks: "laptop",
    pcs: "laptop",
    pc: "laptop",

    headphones: "headphones",
    headphone: "headphones",
    headsets: "headphones",
    headset: "headphones",
    earphones: "headphones",
    earphone: "headphones",
    earbuds: "headphones",
    earbud: "headphones",

    smartwatches: "smartwatch",
    smartwatch: "smartwatch",
    watches: "smartwatch",
    watch: "smartwatch",

    speakers: "speakers",
    speaker: "speakers",

    tablets: "tablet",
    tabs: "tablet",
    tab: "tablet",

    cameras: "camera",
    cam: "camera",
    cams: "camera",
    dslrs: "camera",
    dslr: "camera",
  };

  return pluralToSingular[category] || category;
}

// ---------------------------
// FILTER FUNCTION (upgraded)
// ---------------------------
function filterProducts(parameters) {
  let { brand, category, price, features } = parameters;

  // Extract first value from arrays
  if (Array.isArray(brand)) brand = brand[0];
  if (Array.isArray(category)) category = category[0];
  if (Array.isArray(features)) features = features[0];

  // Normalize category (fix plurals)
  category = normalizeCategory(category);

  let results = products;

  // Filter by category
  if (category && category !== "") {
    results = results.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Filter by brand
  if (brand && brand !== "") {
    results = results.filter(
      (p) => p.brand.toLowerCase() === brand.toLowerCase()
    );
  }

  // Filter by max price
  if (price && price !== "") {
    let max = parseInt(price);
    results = results.filter((p) => p.price <= max);
  }

  // Filter by features
  if (features && features !== "") {
    const f = features.toLowerCase();
    results = results.filter((p) =>
      p.features.map((x) => x.toLowerCase()).includes(f)
    );
  }

  return results;
}

// ---------------------------
// MAIN WEBHOOK
// ---------------------------
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
    fulfillmentText: "I'm not sure how to help with that.",
  });
});

// ---------------------------
// START SERVER
// ---------------------------
app.listen(3000, () => {
  console.log("Webhook server running on port 3000");
});
