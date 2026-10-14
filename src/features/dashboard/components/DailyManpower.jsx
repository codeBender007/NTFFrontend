import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
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
];

// Chart data
const chartData = {
  labels,
  datasets: [
    {
      label: "Actual",
      data: [45, 60, 32, 58, 48, 25, 62, 40, 55, 28],
      backgroundColor: "#13B8FF",
      hoverBackgroundColor: "#38bdf8",

      // Rounded only at top
      borderRadius: {
        topLeft: 6,
        topRight: 6,
        bottomLeft: 0,
        bottomRight: 0,
      },

      // Bottom remains straight
      borderSkipped: "bottom",
    },

    {
      label: "Present",
      data: [25, 35, 18, 40, 28, 15, 30, 22, 32, 20],
      backgroundColor: "#0d9488",
      borderRadius: {
        topLeft: 6,
        topRight: 6,
        bottomLeft: 0,
        bottomRight: 0,
      },

      borderSkipped: "bottom",
    },

    {
      label: "Requirement",
      data: [70, 95, 50, 98, 76, 40, 92, 62, 87, 48],
      backgroundColor: "#f59e0b",

      borderRadius: {
        topLeft: 6,
        topRight: 6,
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
      external: () => { },
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

const DailyManpower = () => {
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
                Daily Manpower Dashboard
              </h2>

              <p className="text-xs text-[#64748b] mt-0.5">
                Deployed headcount with day-over-day movement
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Scrollable Chart */}
      <div
        className="
          px-4
          pb-3
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

      {/* Legend */}
      <div className="flex justify-center items-center gap-5 pb-4">
        {/* Actual */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#13B8FF]"></span>

          <span className="text-xs font-medium text-slate-500">
            Actual
          </span>
        </div>

        {/* Present */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0d9488]"></span>

          <span className="text-xs font-medium text-slate-500">
            Present
          </span>
        </div>

        {/* Requirement */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>

          <span className="text-xs font-medium text-slate-500">
            Requirement
          </span>
        </div>
      </div>
    </div>
  );
};

export default DailyManpower;