
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartDataLabels
);

const labels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const levels = ["levels", "Level 1", "Level 2"];

const level1Data = [
  45, 55, 40, 60, 50, 34,
  60, 45, 55, 40, 60, 50,
];
const level2Data = [
  30, 42, 36, 48, 41, 38,
  52, 39, 44, 46, 38, 33,
];

const dataByLevel = {
  "Level 1": level1Data,
  "Level 2": level2Data,
  levels: level1Data.map((v, i) => v + level2Data[i]),
};

const buildChartData = (level) => ({
  labels,
  datasets: [
    {
      label: "Requirement",
      data: dataByLevel[level],
      backgroundColor: "#0d9488",
      barThickness: 25,
      borderRadius: {
        topLeft: 6,
        topRight: 6,
        bottomLeft: 0,
        bottomRight: 0,
      },
      borderSkipped: "bottom",
    },
  ],
});

const buildOptions = (level) => {
  const yMax = Math.ceil(Math.max(...dataByLevel[level]) / 20) * 20 + 20;

  return {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: "index",
      intersect: false,
    },

    plugins: {
      legend: {
        display: false,
      },

      datalabels: {
        display: true,
        anchor: "end",
        align: "top",
        offset: 4,
        color: "#334155",
        font: {
          size: 10,
          weight: "600",
          family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        },
        formatter: (value) => value,
      },

      tooltip: {
        enabled: false,
        external: () => { },
      },
    },

    scales: {
      x: {
        offset: true,

        grid: {
          display: false,
          drawBorder: false,
        },

        border: {
          display: false,
        },

        barPercentage: 0.35,
        categoryPercentage: 0.5,

        ticks: {
          color: "#64748B",

          font: {
            size: 10,
            weight: "500",
          },

          padding: 5,
        },
      },

      y: {
        beginAtZero: true,
        max: yMax,

        ticks: {
          stepSize: 20,
          color: "#64748B",

          font: {
            size: 9,
          },

          padding: 8,
        },

        grid: {
          display: false,
          color: "#e8f1f5",
          drawTicks: false,
        },

        border: {
          display: false,
        },
      },
    },
  };
};

const Attrition = () => {
  const [level, setLevel] = useState("levels");

  const chartData = buildChartData(level);
  const options = buildOptions(level);

  return (
    <div className="bg-white/85 backdrop-blur-md rounded-2xl md:rounded-3xl border border-[#e2edf2] shadow-[0_4px_24px_rgba(15,23,42,0.03)] overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e6f7f5] border border-[#0d9488]/20 flex items-center justify-center text-[#0d9488] shadow-xs">
              <PeopleAltIcon sx={{ fontSize: 20 }} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#0f172a]">
                Monthly Attrition
              </h2>

              <p className="text-xs text-[#64748b] mt-0.5">
                Deployed headcount with month-over-month movement
              </p>
            </div>
          </div>

          {/* Level Filter */}
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="h-8 cursor-pointer rounded-xl border border-[#e2edf2] bg-white px-3 text-xs font-medium text-[#0f172a] outline-none focus:border-[#0d9488] transition shadow-xs"
          >
            {levels.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scrollable Chart */}
      <div className="px-4 pb-3 pt-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        <div
          className="h-[230px]"
          style={{
            minWidth: "1200px",
          }}
        >
          <Bar data={chartData} options={options} />
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center items-center gap-4 pb-4">
        {/* Employees Left */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0d9488]"></span>

          <span className="text-xs font-medium text-slate-500">
            Employees Left
          </span>
        </div>
      </div>
    </div>
  );
};

export default Attrition;

