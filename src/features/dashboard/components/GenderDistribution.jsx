import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import MoreVertIcon from "@mui/icons-material/MoreVert";
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
  "01 May",
  "02 May",
  "03 May",
  "04 May",
  "05 May",
  "06 May",
  "07 May",
  "08 May",
  "09 May",
  "10 May",
  "11 May",
  "12 May",
  "13 May",
  "14 May",
  "15 May",
  "16 May",
];

const chartData = {
  labels,
  datasets: [
    {
      label: "Female",
      data: [
        45,
        55,
        40,
        60,
        50,
        34,
        60,
        45,
        55,
        40,
        60,
        50,
        34,
        60,
        55,
        45,
      ],
      backgroundColor: "#ba58a5",

      borderRadius: {
        topLeft: 5,
        topRight: 5,
        bottomLeft: 0,
        bottomRight: 0,
      },

      borderSkipped: "bottom",
    },

    {
      label: "Male",
      data: [
        30,
        46,
        24,
        50,
        40,
        20,
        45,
        30,
        46,
        24,
        50,
        40,
        20,
        45,
        46,
        32,
      ],
      backgroundColor: "#2a62d9",

      borderRadius: {
        topLeft: 5,
        topRight: 5,
        bottomLeft: 0,
        bottomRight: 0,
      },

      borderSkipped: "bottom",
    },
  ],
};

const options = {
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

    // Tooltip completely disabled
    tooltip: {
      enabled: false,
      external: () => {},
    },

    // Number displayed on top of every bar
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

      // Space between individual bars, like the manpower graph
      barPercentage: 0.3,
      categoryPercentage: 0.4,

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

      // Extra space above highest bars
      max: 80,

      ticks: {
        stepSize: 20,

        color: "#64748B",

        font: {
          size: 9,
        },

        padding: 8,
      },

      // Horizontal lines removed
      grid: {
        display: false,
        drawTicks: false,
      },

      border: {
        display: false,
      },
    },
  },
};

const GenderDistribution = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header */}
     {/* Header */}
<div className="px-5 pt-4">
  <div className="flex items-center justify-between">
    {/* Left side */}
    <div className="flex items-center gap-3">
      {/* Icon - same color as Female bar */}
      <div className="w-9 h-9 rounded-lg bg-pink-50 flex items-center justify-center text-[#ba58a5]">
        <PeopleAltIcon sx={{ fontSize: 20 }} />
      </div>

      <div>
        <h2 className="text-sm font-bold text-slate-800">
          Gender Distribution
        </h2>

        <p className="text-[10px] text-slate-500 mt-0.5">
          Deployed headcount with day-over-day movement
        </p>
      </div>
    </div>

    {/* Right side */}
    <div className="flex items-center gap-4">
      {/* Ratio - same color as Female bar */}
      <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-50">
        <span className="w-1.5 h-1.5 rounded-full bg-[#ba58a5]"></span>

        <span className="text-[10px] font-semibold text-[#ba58a5] whitespace-nowrap">
          Ratio: 48% F / 52% M
        </span>
      </span>

      {/* More button */}
      <button className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition">
        <MoreVertIcon
          sx={{
            fontSize: 17,
            color: "#64748B",
          }}
        />
      </button>
    </div>
  </div>

  {/* Legend */}
  <div className="flex justify-end items-center gap-4 mt-3">
    {/* Female */}
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-[#ba58a5]"></span>

      <span className="text-[9px] font-medium text-slate-500">
        Female
      </span>
    </div>

    {/* Male */}
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-[#2a62d9]"></span>

      <span className="text-[9px] font-medium text-slate-500">
        Male
      </span>
    </div>
  </div>
</div>

      {/* Scrollable Chart */}
      <div className="px-4 pb-4 pt-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        <div
          className="h-[230px]"
          style={{
            minWidth: "1600px",
          }}
        >
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default GenderDistribution;