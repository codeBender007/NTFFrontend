import PsychologyIcon from "@mui/icons-material/Psychology";
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
      label: "Planned",
      data: [
        70, 75, 68, 80, 74, 60, 78, 70,
        75, 68, 80, 74, 60, 78, 74, 72,
      ],
      backgroundColor: "#13B8FF",
      hoverBackgroundColor: "#38bdf8",

      borderRadius: {
        topLeft: 6,
        topRight: 6,
        bottomLeft: 0,
        bottomRight: 0,
      },

      borderSkipped: "bottom",
    },

    {
      label: "Deployed",
      data: [
        55, 62, 50, 66, 58, 44, 60, 52,
        62, 50, 66, 58, 44, 60, 58, 55,
      ],
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
      label: "Optimal",
      data: [
        45, 52, 40, 58, 48, 36, 54, 44,
        52, 40, 58, 48, 36, 54, 48, 46,
      ],
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

      // Room above the tallest bar (80) so the value labels
      // on top of bars aren't cut off
      max: 100,

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

const DojoManpowerTrend = () => {
  return (
    <div className="bg-white/85 backdrop-blur-md rounded-2xl md:rounded-3xl border border-[#e2edf2] shadow-[0_4px_24px_rgba(15,23,42,0.03)] overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-[#e6f7f5] border border-[#0d9488]/20 flex items-center justify-center text-[#0d9488] shadow-xs">
              <PsychologyIcon sx={{ fontSize: 20 }} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#0f172a]">
                Dojo Manpower Trend
              </h2>

              <p className="text-xs text-[#64748b] mt-0.5">
                Planned vs deployed vs optimal manpower movement
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Chart */}
      <div className="px-4 pb-3 pt-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        <div
          className="h-[230px]"
          style={{
            minWidth: "1600px",
          }}
        >
          <Bar data={chartData} options={options} />
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center items-center gap-5 pb-4">
        {/* Planned */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#13B8FF]"></span>

          <span className="text-xs font-medium text-slate-500">
            Planned
          </span>
        </div>

        {/* Deployed */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0d9488]"></span>

          <span className="text-xs font-medium text-slate-500">
            Deployed
          </span>
        </div>

        {/* Optimal */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>

          <span className="text-xs font-medium text-slate-500">
            Optimal
          </span>
        </div>
      </div>
    </div>
  );
};

export default DojoManpowerTrend;