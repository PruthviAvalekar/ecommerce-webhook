const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());

// ------------------------------------
// PRODUCT DATABASE
// ------------------------------------
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

// ------------------------------------
// NORMALIZATION FUNCTION
// ------------------------------------
function normalize(values) {
  if (!values) return "";

  // Dialogflow sends arrays → convert to string
  if (Array.isArray(values)) values = values[0];

  if (!values) return "";

  values = values.toLowerCase();

  // CATEGORY NORMALIZATION
  const categoryMap = {
    mobiles: "mobile",
    mobile: "mobile",
    phone: "mobile",
    phones: "mobile",
    smartphone: "mobile",
    smartphones: "mobile",

    laptop: "laptop",
    laptops: "laptop",
    notebook: "laptop",
    notebooks: "laptop",

    headphone: "headphones",
    headphones: "headphones",
    headset: "headphones",
    headsets: "headphones",
    earphone: "headphones",
    earphones: "headphones",
    earbuds: "headphones",
    earbud: "headphones",

    tablet: "tablet",
    tablets: "tablet",
    tab: "tablet",
    tabs: "tablet",

    camera: "camera",
    cameras: "camera",
    dslr: "camera",
    dslrs: "camera",
    cam: "camera",
    cams: "camera",

    speakers: "speakers",
    speaker: "speakers",
    sound: "speakers",
    soundsystem: "speakers",
  };

  return categoryMap[values] || values;
}

// ------------------------------------
// FILTER PRODUCTS
// ------------------------------------
function filterProducts(parameters) {
  let brand = normalize(parameters.brand);
  let category = normalize(parameters.category);
  let price = parameters.price ? parameters.price[0] : "";
  let features = normalize(parameters.features);

  let results = products;

  if (category) {
    results = results.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (brand) {
    results = results.filter(
      (p) => p.brand.toLowerCase() === brand.toLowerCase()
    );
  }

  if (price) {
    let max = parseInt(price);
    results = results.filter((p) => p.price <= max);
  }

  if (features) {
    results = results.filter((p) =>
      p.features.map((f) => f.toLowerCase()).includes(features)
    );
  }

  return results;
}

// ------------------------------------
// WEBHOOK ENDPOINT
// ------------------------------------
app.post("/webhook", (req, res) => {
  const intent = req.body.queryResult.intent.displayName;
  const parameters = req.body.queryResult.parameters;

  console.log("Intent:", intent);
  console.log("Parameters:", parameters);

  if (intent === "search_product") {
    const results = filterProducts(parameters);

    if (results.length === 0) {
      return res.json({
        fulfillmentText:
          "Sorry, I couldn't find any matching products. Try changing brand or price range.",
      });
    }

    const list = results.map((p) => `${p.name} (₹${p.price})`).join(", ");

    return res.json({
      fulfillmentText: `Here are some products you may like: ${list}`,
    });
  }

  res.json({ fulfillmentText: "I didn't understand that." });
});

// ------------------------------------
// SERVER START
// ------------------------------------
app.listen(3000, () => console.log("Webhook running on port 3000"));
