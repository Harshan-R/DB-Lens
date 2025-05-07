// src/components/ChartComponent.js
import React from "react";
import { Bar, Line, Pie, Radar, Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend
);

const ChartComponent = ({ chartData, chartType }) => {
  const chartProps = { data: chartData };

  switch (chartType) {
    case "bar":
      return <Bar {...chartProps} />;
    case "line":
      return <Line {...chartProps} />;
    case "pie":
      return <Pie {...chartProps} />;
    case "radar":
      return <Radar {...chartProps} />;
    case "scatter":
      return <Scatter {...chartProps} />;
    default:
      return <Bar {...chartProps} />;
  }
};

export default ChartComponent;
