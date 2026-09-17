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
  ChartDataLabels,
);

// Chart labels
const labels = [
  "Line 1",
  "Line 2",
  "Line 3",
  "Line 4",
  "Line 5",
  "Line 6",
  "Line 7",
  "Line 8",
  "Line 9",
  "Line 10",
];

// Chart data
const chartData = {
  labels,
  datasets: [
    {
      label: "Actual",
      data: [45, 60, 32, 58, 48, 25, 62, 40, 55, 28],
      backgroundColor: "#4285F4",

      // Rounded only at top
      borderRadius: {
        topLeft: 5,
        topRight: 5,
        bottomLeft: 0,
        bottomRight: 0,
      },

      // Bottom remains straight
      borderSkipped: "bottom",
    },

    {
      label: "Present",
      data: [25, 35, 18, 40, 28, 15, 30, 22, 32, 20],
      backgroundColor: "#26B7A0",

      borderRadius: {
        topLeft: 5,
        topRight: 5,
        bottomLeft: 0,
        bottomRight: 0,
      },

      borderSkipped: "bottom",
    },

    {
      label: "Requirement",
      data: [70, 95, 50, 98, 76, 40, 92, 62, 87, 48],
      backgroundColor: "#FFB52E",

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

// Chart options
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

    tooltip: {
      enabled: false,
      external: () => {},
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
  },

  scales: {
    x: {
      offset: true,

      // Vertical lines removed
      grid: {
        display: false,
        drawBorder: false,
      },

      border: {
        display: false,
      },

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
      max: 120,

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

const DailyManpower = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header */}
<div className="px-5 pt-4">
  <div className="flex items-center justify-between">
    {/* Left side */}
    <div className="flex items-center gap-3">
      {/* Icon - same color as Actual bar */}
      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-[#4285F4]">
        <PeopleAltIcon sx={{ fontSize: 20 }} />
      </div>

      <div>
        <h2 className="text-sm font-bold text-slate-800">
          Daily Manpower Dashboard
        </h2>

        <p className="text-[10px] text-slate-500 mt-0.5">
          Deployed headcount with day-over-day movement
        </p>
      </div>
    </div>

    {/* Right side */}
    <div className="flex items-center gap-4">
      {/* Active shift - same color as Actual bar */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50">
        <span className="w-1.5 h-1.5 rounded-full bg-[#4285F4]"></span>

        <span className="text-[10px] font-semibold text-[#4285F4]">
          Active Shift
        </span>
      </div>

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
    {/* Actual */}
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-[#4285F4]"></span>

      <span className="text-[9px] font-medium text-slate-500">
        Actual
      </span>
    </div>

    {/* Present */}
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-[#26B7A0]"></span>

      <span className="text-[9px] font-medium text-slate-500">
        Present
      </span>
    </div>

    {/* Requirement */}
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-[#FFB52E]"></span>

      <span className="text-[9px] font-medium text-slate-500">
        Requirement
      </span>
    </div>
  </div>
</div>



      {/* Scrollable Chart */}
      <div
        className="
          px-4
          pb-4
          pt-2
          overflow-x-auto
          scrollbar-thin
          scrollbar-thumb-slate-300
          scrollbar-track-transparent
        "
      >
        <div
          className="h-[230px]"
          style={{
            minWidth: "1100px",
          }}
        >
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default DailyManpower;