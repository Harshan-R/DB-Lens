// src/components/DBConnect.js
import React, { useState } from "react";

const DBConnect = ({ onConnect }) => {
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [dbName, setDbName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onConnect({ host, port, dbName, username, password });
  };

  return (
    <div>
      <h2>Connect to Database</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Host"
          value={host}
          onChange={(e) => setHost(e.target.value)}
        />
        <input
          type="text"
          placeholder="Port"
          value={port}
          onChange={(e) => setPort(e.target.value)}
        />
        <input
          type="text"
          placeholder="Database Name"
          value={dbName}
          onChange={(e) => setDbName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Connect</button>
      </form>
    </div>
  );
};

export default DBConnect;
