require("dotenv").config(); // Add dotenv to load environment variables

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise"); // <-- mysql2 with promise support
const axios = require("axios");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

let pool = null; // We'll initialize pool when user supplies DB details

// 1️⃣ Route to connect to MySQL
app.post("/connect", async (req, res) => {
  const { host, port, user, password, database } = req.body;

  try {
    // Use environment variables instead of parameters from the request
    pool = await mysql.createPool({
      host: process.env.DB_HOST || host, // If env variable exists, use it
      port: process.env.DB_PORT || port, // If env variable exists, use it
      user: process.env.DB_USER || user, // If env variable exists, use it
      password: process.env.DB_PASSWORD || password, // If env variable exists, use it
      database: process.env.DB_NAME || database, // If env variable exists, use it
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Simple test connection
    const [rows] = await pool.query("SELECT 1");

    res.json({ success: true, message: "Connected successfully to MySQL!" });
  } catch (err) {
    console.error("Connection failed:", err);
    res.status(400).json({
      success: false,
      message: "Failed to connect to database",
      error: err.message,
    });
  }
});

function extractSQL(text) {
  const possibleStarts = [
    "SELECT",
    "WITH",
    "INSERT",
    "UPDATE",
    "DELETE",
    "CREATE",
  ];
  const lines = text.split("\n");

  let sqlQuery = "";
  let capturing = false;

  for (let line of lines) {
    const trimmed = line.trim();

    // Start capturing if line starts with SQL keyword
    if (
      !capturing &&
      possibleStarts.some((kw) => trimmed.toUpperCase().startsWith(kw))
    ) {
      capturing = true;
    }

    if (capturing) {
      sqlQuery += line + "\n";
      if (trimmed.endsWith(";")) {
        break;
      }
    }
  }

  return sqlQuery.trim();
}

app.post("/llm", async (req, res) => {
  const { prompt, schema } = req.body;

  try {
    const ollamaResponse = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "phi:2.7b",
        // model: "qwen2.5-coder:7b", // alternate model
        prompt: `Given the following database schema:\n${schema}\n\nConvert the following user request into SQL:\n"${prompt}"`,
        stream: false,
      }
    ); // alternate model : qwen2.5-coder:7b ;  phi:2.7b consistency is less example it takes 'orders' table as 'order' table i.e misses the exact name of the table

    const rawResponse = ollamaResponse.data.response.trim();
    const extractedSQL = extractSQL(rawResponse);

    res.json({ sql: extractedSQL });
  } catch (err) {
    console.error("LLM error:", err.message);
    res
      .status(500)
      .json({ error: "Failed to get SQL from LLM", details: err.message });
  }
});
// 3️⃣ Route to run SQL query on MySQL
app.post("/query", async (req, res) => {
  const { sql } = req.body;

  if (!pool) {
    return res.status(400).json({ error: "Not connected to DB" });
  }

  try {
    const [rows, fields] = await pool.query(sql);
    res.json({ rows, fields });
  } catch (err) {
    console.error("SQL execution error:", err.message);
    res
      .status(500)
      .json({ error: "SQL execution failed", details: err.message });
  }
});

// 4️⃣ Route to get DB schema (tables + columns)
app.get("/schema", async (req, res) => {
  if (!pool) {
    return res.status(400).json({ error: "Not connected to DB" });
  }

  try {
    // Get all tables in the database
    const [tables] = await pool.query("SHOW TABLES");

    // Get database name dynamically
    const [dbNameResult] = await pool.query("SELECT DATABASE() as db");
    const dbName = dbNameResult[0].db;

    const schemaParts = [];

    for (const row of tables) {
      const tableName = row[`Tables_in_${dbName}`];
      const [columns] = await pool.query(`SHOW COLUMNS FROM \`${tableName}\``);

      const columnDefs = columns
        .map((col) => `${col.Field} ${col.Type}`)
        .join(", ");

      schemaParts.push(`${tableName}(${columnDefs})`);
    }

    const schemaString = schemaParts.join("; ");
    res.json({ schema: schemaString });
  } catch (err) {
    console.error("Schema fetch error:", err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch schema", details: err.message });
  }
});

// 6️⃣ Route to generate Insights via LLM (from SQL results)
app.post("/generate-insights", async (req, res) => {
  const { rows } = req.body; // Accept raw rows from frontend

  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: "No data provided for insights" });
  }

  try {
    const ollamaResponse = await axios.post(
      "http://localhost:11434/api/generate",
      {
        // model: "phi:2.7b",
        model: "qwen2.5-coder:7b", // alternate model
        prompt: `Given this data:\n${JSON.stringify(rows, null, 2)}\n\n
Your task is to suggest one or more useful insights (such as summaries, patterns, or comparisons) from the data that can be visualized.

For each insight, provide:
- "label": a short descriptive title (string)
- "chartType": one of ["bar", "pie", "doughnut", "line", "radar"] (string)
- "labels": an array of strings (x-axis categories or groups)
- "values": an array of numbers (y-axis values corresponding to labels)

IMPORTANT INSTRUCTIONS:
- ONLY output a pure JSON array of objects
- DO NOT include any explanations, text, code comments, or code blocks
- The response must start with '[' and end with ']'

Example output:
[
  {
    "label": "",
    "chartType": "bar",
    "labels": ["y", "y"],
    "values": [0, 100]
  }
]`,
        stream: false,
      }
    );

    // Log the raw response from LLM for debugging
    console.log("LLM Raw Response:", ollamaResponse.data.response);

    let rawResponse = ollamaResponse.data.response.trim();

    // Strip code block markers if present (```json ... ```)
    if (rawResponse.startsWith("```")) {
      rawResponse = rawResponse
        .replace(/```(?:json)?/gi, "")
        .replace(/```$/, "")
        .trim();
    }

    // ✅ Parse the raw response into JSON (this was missing)
    // const parsedInsights = JSON.parse(rawResponse);

    let parsedInsights;
    try {
      parsedInsights = JSON.parse(rawResponse);
    } catch (err) {
      console.error("Failed to parse JSON:", err.message);
      return res.status(500).json({
        error: "Invalid JSON returned from LLM",
        rawResponse: rawResponse,
      });
    }

    // Validate insights
    const validInsights = [];
    const invalidInsights = [];

    parsedInsights.forEach((insight, idx) => {
      const isValid =
        typeof insight.label === "string" &&
        typeof insight.chartType === "string" &&
        Array.isArray(insight.labels) &&
        Array.isArray(insight.values) &&
        insight.labels.length === insight.values.length;

      if (isValid) {
        validInsights.push(insight);
      } else {
        invalidInsights.push({ index: idx, insight });
      }
    });

    if (invalidInsights.length > 0) {
      console.warn("Skipped invalid insights:", invalidInsights);
    }

    if (validInsights.length === 0) {
      throw new Error("No valid insights in LLM response");
    }

    res.json({ insights: validInsights });
  } catch (err) {
    console.error("LLM Insights error:", err.message);
    res.status(500).json({
      error: "Failed to generate insights",
      details: err.message,
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`✅ DBLens backend (MySQL) running at http://localhost:${port}`);
});
