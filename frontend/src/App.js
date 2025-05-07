// frontend/src/App.js
import React, { useState } from "react";
import "./App.css";
import DBConnect from "./components/DBConnect";
import QueryInput from "./components/QueryInput";
import ResultVisualization from "./components/ResultVisualization";
import LoadingComponent from "./components/LoadingComponent";
import axios from "axios";

const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState(""); // Store DB schema

  // Function to handle DB connection + fetch schema
  const handleDbConnect = async (details) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/connect",
        details
      );
      if (response.data.success) {
        setIsConnected(true);

        // After successful connection, fetch schema
        const schemaResponse = await axios.get("http://localhost:5000/schema");
        setSchema(schemaResponse.data.schema);
        console.log("✅ DB Schema fetched:", schemaResponse.data.schema);

        setLoading(false);
      } else {
        alert("Failed to connect to database");
        setLoading(false);
      }
    } catch (error) {
      alert("Error connecting to the database");
      setLoading(false);
    }
  };

  // Function to clear query result
  const clearQuery = () => {
    setResult(null);
  };

  return (
    <div className="App">
      <h1>DBLens</h1>
      {!isConnected ? (
        <DBConnect onConnect={handleDbConnect} />
      ) : (
        <div>
          <QueryInput
            schema={schema}
            onQueryResult={(rows) => setResult(rows)}
            onClear={clearQuery}
          />
          {loading ? (
            <LoadingComponent />
          ) : (
            result && <ResultVisualization data={result} />
          )}
        </div>
      )}
    </div>
  );
};

export default App;
