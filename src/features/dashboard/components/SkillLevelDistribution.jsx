import EqualizerIcon from "@mui/icons-material/Equalizer";
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

const labels = ["L0", "L1", "L2", "L3"];

const chartData = {
  labels,

  datasets: [
    {
      label: "Required",
      data: [80, 65, 90, 70],
      backgroundColor: "#EF4444",

      // Bar width
      barThickness: 32,
      maxBarThickness: 32,

      // Space between bars
      borderColor: "#FFFFFF",

      borderWidth: {
        top: 0,
        bottom: 0,
        left: 4,
        right: 4,
      },

      // Rounded only at top.
      // Radius is 9 because chart.js subtracts the 4px side border
      // width, leaving a visible 5px top corner like the other graphs.
      borderRadius: {
        topLeft: 9,
        topRight: 9,
        bottomLeft: 0,
        bottomRight: 0,
      },

      // Bottom remains straight
      borderSkipped: "bottom",
    },

    {
      label: "Allocation",
      data: [65, 50, 72, 58],
      backgroundColor: "#F59E0B",

      // Bar width
      barThickness: 32,
      maxBarThickness: 32,

      // Space between bars
      borderColor: "#FFFFFF",

      borderWidth: {
        top: 0,
        bottom: 0,
        left: 4,
        right: 4,
      },

      // Rounded only at top.
      // Radius is 9 because chart.js subtracts the 4px side border
      // width, leaving a visible 5px top corner like the other graphs.
      borderRadius: {
        topLeft: 9,
        topRight: 9,
        bottomLeft: 0,
        bottomRight: 0,
      },

      // Bottom remains straight
      borderSkipped: "bottom",
    },

    // {
    //   label: "Actual Present",
    //   data: [48, 40, 55, 42],
    //   backgroundColor: "#26B7A0",

    //   barThickness: 32,
    //   maxBarThickness: 32,

    //   borderColor: "#FFFFFF",

    //   borderWidth: {
    //     top: 0,
    //     bottom: 0,
    //     left: 4,
    //     right: 4,
    //   },

    //   borderRadius: {
    //     topLeft: 9,
    //     topRight: 9,
    //     bottomLeft: 0,
    //     bottomRight: 0,
    //   },

    //   borderSkipped: "bottom",
    // },
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

      grid: {
        display: false,
        drawBorder: false,
      },

      border: {
        display: false,
      },

      // Keeps large spacing between L0, L1, L2 and L3
      categoryPercentage: 0.5,

      ticks: {
        color: "#64748B",

        font: {
          size: 12,
          weight: "600",
        },

        padding: 5,
      },
    },

    y: {
      beginAtZero: true,

      ticks: {
        stepSize: 20,

        color: "#64748B",

        font: {
          size: 10,
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

const SkillLevelDistribution = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-[#EF4444]">
              <EqualizerIcon sx={{ fontSize: 20 }} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Skill Level Distribution
              </h2>

              <p className="text-[10px] text-slate-500 mt-0.5">
                Required vs allocation vs actual present by skill level
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Chart */}
      <div className="px-4 pb-4 pt-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        <div
          className="h-[230px]"
          style={{
            minWidth: "800px",
          }}
        >
          <Bar data={chartData} options={options} />
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center items-center gap-4 pb-4">
        {/* Required */}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
          <span className="text-xs font-medium text-slate-500">
             Actual 
          </span>
        </div>

        {/* Allocation */}
        {/* <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>

          <span className="text-xs font-medium text-slate-500">
            Allocation
          </span>
        </div> */}

        {/* Actual Present */}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#26B7A0]"></span>
          <span className="text-xs font-medium text-slate-500">
           Present
          </span>
        </div>
      </div>
    </div>
  );
};

export default SkillLevelDistribution;