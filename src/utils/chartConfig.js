import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartDataLabels,
);

export const CHART_COLORS = {
  primary: "#0d9488",
  primaryLight: "#14b8a6",
  primaryDark: "#0f766e",
  success: "#10b981",
  successLight: "#34d399",
  warning: "#f59e0b",
  warningLight: "#fbbf24",
  danger: "#fb7185",
  dangerLight: "#fda4af",
  blue: "#38bdf8",
  indigo: "#6366f1",
  pink: "#fb7185",
  teal: "#0d9488",
  slate: "#64748b",
  requirement: "#0d9488",
  present: "#14b8a6",
  total: "#64748b",
};

export const getBarChartOptions = ({
  yStepSize = 20,
  yMax,
  yMin = 0,
  legendPosition = "top",
  legendAlign = "end",
  showGridLines = true,
  stacked = false,
  barPercentage = 0.3,
  categoryPercentage = 0.4,
  yAxisFormatter,
  xAxisFormatter,
} = {}) => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 8,
        bottom: 4,
        left: 4,
        right: 8,
      },
    },
    animation: {
      duration: 800,
      easing: "easeOutQuart",
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: legendPosition,
        align: legendAlign,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          boxWidth: 8,
          boxHeight: 8,
          color: "#0f172a",
          font: {
            size: 12,
            weight: "600",
            family:
              "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          },
        },
      },
      tooltip: {
        enabled: false,
        external: () => { },
      },
      datalabels: {
        display: true,
        anchor: "end",
        align: "top",
        offset: 4,
        color: "#0f172a",
        font: {
          size: 10,
          weight: "600",
          family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        },
        formatter: (value, ctx) => {
          if (yAxisFormatter) {
            return yAxisFormatter(value);
          }
          return ctx.chart.data.datasets[ctx.datasetIndex]?.label
            ? value
            : value;
        },
      },
    },
    scales: {
      x: {
        stacked: stacked,
        offset: true,
        barPercentage: barPercentage,
        categoryPercentage: categoryPercentage,
        grid: {
          display: false,
          drawBorder: false,
          drawTicks: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 11,
            weight: "500",
            family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          },
          padding: 8,
          callback: xAxisFormatter ? xAxisFormatter : undefined,
        },
      },
      y: {
        stacked: stacked,
        beginAtZero: yMin === 0,
        min: yMin,
        max: yMax,
        grid: {
          display: showGridLines,
          color: "#e8f1f5",
          drawBorder: false,
          drawTicks: false,
          borderDash: [],
          lineWidth: 1,
        },
        border: {
          display: false,
          dash: [],
        },
        ticks: {
          stepSize: yStepSize,
          color: "#64748b",
          font: {
            size: 11,
            weight: "500",
            family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          },
          padding: 10,
          callback: yAxisFormatter
            ? (value) => yAxisFormatter(value)
            : undefined,
        },
      },
    },
  };
};

/**
 * Helper to build stylized bar dataset with rounded-top bars (manpower style).
 * Bar sizes are controlled by the scale-level barPercentage/categoryPercentage so
 * that spacing between bars matches the Daily Manpower chart.
 */
export const createBarDataset = ({
  label,
  data,
  color,
  borderRadius = {
    topLeft: 5,
    topRight: 5,
    bottomLeft: 0,
    bottomRight: 0,
  },
  stack,
}) => ({
  label,
  data,
  backgroundColor: color,
  hoverBackgroundColor: color,
  borderRadius: borderRadius,
  borderSkipped: "bottom",
  stack,
});
