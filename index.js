const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());

// ---------------------------
// SAMPLE PRODUCT DATABASE
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

// ---------------------------
// FIXED PRODUCT FILTER FUNCTION
// ---------------------------
function filterProducts(parameters) {
  let { brand, category, price, features } = parameters;

  // Dialogflow returns arrays → convert them to single values
  if (Array.isArray(brand)) brand = brand[0];
  if (Array.isArray(category)) category = category[0];
  if (Array.isArray(features)) features = features[0];

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
    let maxPrice = parseInt(price);
    results = results.filter((p) => p.price <= maxPrice);
  }

  // Filter by features
  if (features && features !== "") {
    const featureLower = features.toLowerCase();
    results = results.filter((p) =>
      p.features.map((f) => f.toLowerCase()).includes(featureLower)
    );
  }

  return results;
}

// ---------------------------
// MAIN WEBHOOK ENDPOINT
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
          "Sorry, I couldn't find any matching products. Try changing brand or price range.",
      });
    }

    const productList = results
      .map((p) => `${p.name} (₹${p.price})`)
      .join(", ");

    return res.json({
      fulfillmentText: `Here are some products you may like: ${productList}`,
    });
  }

  // Default fallback response
  return res.json({
    fulfillmentText: "I'm not sure how to handle that.",
  });
});

// Start the server
app.listen(3000, () => {
  console.log("Webhook server running on port 3000");
});
