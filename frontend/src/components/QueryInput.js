// frontend/src/components/QueryInput.js
import React, { useState } from "react";
import axios from "axios";

function QueryInput({ schema, onQueryResult }) {
  const [prompt, setPrompt] = useState("");

  const handleInputChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleQuerySubmit = async () => {
    if (!prompt) {
      alert("Please enter your query description!");
      return;
    }

    try {
      // Step 1: Send prompt + schema to /llm
      const llmResponse = await axios.post("http://localhost:5000/llm", {
        prompt: prompt,
        schema: schema,
      });

      const generatedSQL = llmResponse.data.sql;
      console.log("Generated SQL:", generatedSQL);

      // Step 2: Send generated SQL to /query
      const queryResponse = await axios.post("http://localhost:5000/query", {
        sql: generatedSQL,
      });

      // Step 3: Log query result rows after receiving the response
      console.log("Query result rows:", queryResponse.data);

      // Step 4: Pass query result to parent component
      if (typeof onQueryResult === "function") {
        onQueryResult(queryResponse.data.rows);
      }
    } catch (error) {
      console.error("Error processing query:", error);
      alert("Error processing query. Check console for details.");
    }
  };

  return (
    <div>
      <textarea
        value={prompt}
        onChange={handleInputChange}
        placeholder="Describe the data you want (e.g., Show all sales orders this month)"
      />
      <button onClick={handleQuerySubmit}>Run Query</button>
    </div>
  );
}

export default QueryInput;
