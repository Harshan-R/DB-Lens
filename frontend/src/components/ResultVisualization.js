// src/components/ResultVisualization.js
import React, { useState } from "react";
import ChartComponent from "./ChartComponent";
import axios from "axios";

const ResultVisualization = ({ data }) => {
  const [view, setView] = useState("table");
  const [chartType, setChartType] = useState("bar");

  const [insights, setInsights] = useState(null); // NEW
  const [loadingInsights, setLoadingInsights] = useState(false); // NEW

  if (!Array.isArray(data) || data.length === 0) {
    return <div>No valid data to display.</div>;
  }

  const columns = Object.keys(data[0]);

  const isNumericLike = (value) => {
    if (value === null || value === undefined) return false;
    return !isNaN(Number(value));
  };

  const numericColumns = columns.filter((col) =>
    data.some((row) => isNumericLike(row[col]))
  );

  const labelColumn = columns[0];
  const valueColumn = numericColumns[0] || columns[1];

  const colors = [
    "rgba(75,192,192,0.6)",
    "rgba(255,99,132,0.6)",
    "rgba(255,206,86,0.6)",
    "rgba(54,162,235,0.6)",
    "rgba(153,102,255,0.6)",
    "rgba(255,159,64,0.6)",
    "rgba(199,199,199,0.6)",
  ];

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const generateColorSet = (num) => {
    const colors = [];
    for (let i = 0; i < num; i++) {
      colors.push(getRandomColor());
    }
    return colors;
  };

  const fetchInsights = async () => {
    setLoadingInsights(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/generate-insights",
        {
          rows: data,
        }
      );
      setInsights(response.data.insights);
      setView("insights");
    } catch (err) {
      console.error("Insights fetch error:", err.message);
      alert("Failed to fetch insights. Check console for details.");
    } finally {
      setLoadingInsights(false);
    }
  };

  const chartData = valueColumn
    ? {
        labels: data.map((item) => item[labelColumn]),
        datasets: [
          {
            label: valueColumn,
            data: data.map((item) => Number(item[valueColumn])),
            backgroundColor: data.map((_, i) => colors[i % colors.length]),
            borderColor: data.map((_, i) =>
              colors[i % colors.length].replace("0.6", "1")
            ),
            borderWidth: 1,
          },
        ],
      }
    : null;

  return (
    <div>
      <h2>Result Visualization</h2>

      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => setView("table")}>Table View</button>
        <button onClick={() => setView("chart")} disabled={!chartData}>
          Chart View
        </button>
        <button onClick={fetchInsights} disabled={loadingInsights}>
          {loadingInsights ? "Loading Insights..." : "Useful Insights"}
        </button>

        {view === "chart" && chartData && (
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="pie">Pie</option>
            <option value="radar">Radar</option>
            <option value="scatter">Scatter</option>
          </select>
        )}
      </div>

      {/* Existing Table & Chart views */}
      {view === "table" ? (
        <div className="table-wrapper">
          <table className="result-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  {columns.map((col) => (
                    <td key={col}>{row[col]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : view === "chart" && chartData ? (
        <ChartComponent chartData={chartData} chartType={chartType} />
      ) : view === "insights" && insights ? (
        <div className="insights-wrapper">
          <h3>Generated Insights</h3>
          {insights.map((insight, idx) => {
            // Generate a unique color set for each insight's dataset
            const colors = generateColorSet(insight.labels.length);

            const insightChartData = {
              labels: insight.labels,
              datasets: [
                {
                  label: insight.label,
                  data: insight.values,
                  backgroundColor: colors,
                  borderColor: colors.map((color) => color.replace("0.6", "1")), // Use darker shades for borders
                  borderWidth: 1,
                },
              ],
            };

            return (
              <div key={idx} style={{ marginBottom: "30px" }}>
                <h4>{insight.label}</h4>
                <ChartComponent
                  chartData={insightChartData}
                  chartType={insight.chartType}
                />
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default ResultVisualization;
