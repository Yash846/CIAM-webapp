const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8080;

// Custom middleware to parse SCIM+JSON
app.use((req, res, next) => {
  if (req.is("application/scim+json")) {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        req.body = JSON.parse(data);
      } catch (e) {
        console.error("Error parsing SCIM+JSON:", e);
      }
      next();
    });
  } else {
    next();
  }
});

// Standard middleware for parsing different types of request bodies
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Enable CORS for all routes
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
  })
);

app.use(express.static(path.join(__dirname, "../dist/tcs-angular-app")));

// Proxy endpoint
app.all("/api/*", async (req, res) => {
  try {
    const targetUrl = process.env.TARGET_API_URL + req.url.replace("/api", "");

    let requestData = req.body;
    let headers = {
      ...req.headers,
      host: new URL(targetUrl).host,
    };

    // Remove problematic headers
    delete headers["host"];
    delete headers["content-length"];

    // Handle different content types
    if (req.is("application/x-www-form-urlencoded")) {
      requestData = new URLSearchParams(req.body).toString();
      headers["content-type"] = "application/x-www-form-urlencoded";
    } else if (req.is("application/scim+json")) {
      headers["content-type"] = "application/scim+json";
      // Ensure SCIM specific headers if needed
      headers["accept"] = "application/scim+json";
    }

    const config = {
      method: req.method,
      url: targetUrl,
      headers: headers,
      data: requestData,
      // Skip SSL verification if needed
      // httpsAgent: new https.Agent({ rejectUnauthorized: false })
    };
    console.log(config);

    const response = await axios(config);

    // Set the correct content type for SCIM responses
    if (req.is("application/scim+json")) {
      res.set("Content-Type", "application/scim+json");
    }

    res.status(response.status).send(response.data);
  } catch (error) {
    console.error("Proxy Error:", error.message);
    const errorResponse = {
      status: error.response?.status || 500,
      detail: error.message,
      schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"],
    };

    if (req.is("application/scim+json")) {
      res.set("Content-Type", "application/scim+json");
    }

    res.status(errorResponse.status).json(errorResponse);
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/tcs-angular-app/index.html"));
});

app.listen(port, () => {
  console.log(path.join(__dirname, "../dist/tcs-angular-app/index.html"));
  console.log(`Proxy server running on port ${port}`);
});
