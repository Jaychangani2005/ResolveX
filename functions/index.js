const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const ee = require("@google/earthengine");
const { GoogleAuth } = require("google-auth-library");

const app = express();
app.use(cors({ origin: true }));

// Authenticate with Earth Engine using the Firebase service account
const auth = new GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/earthengine"],
});

auth.getClient().then((client) => {
  ee.data.authenticateViaGoogle(client, () => {
    ee.initialize(null, null, () => {
      console.log("✅ Earth Engine initialized successfully");
    }, (err) => {
      console.error("❌ Earth Engine initialization error:", err);
    });
  }, (err) => {
    console.error("❌ Earth Engine auth error:", err);
  });
});

// Endpoint: /verifyLocation?lat=22.47&lon=70.05
app.get("/verifyLocation", async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: "Invalid coordinates" });
    }

    const point = ee.Geometry.Point([lon, lat]);

    // Use Global Mangrove Watch FeatureCollection
    const gmw = ee.FeatureCollection("projects/glad/GMw2020_v3");

    const result = await gmw.filterBounds(point).size().gt(0).getInfo();

    res.json({ insideMangrove: result });
  } catch (error) {
    console.error("Error verifying location:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Export the function
exports.api = functions.https.onRequest(app);
