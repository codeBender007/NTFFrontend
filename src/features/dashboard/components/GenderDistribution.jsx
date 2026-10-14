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

      backgroundColor: "#fb7185",

      // Thin bar + visible gap between Female and Male
      barThickness: 30,
      maxBarThickness: 30,

      // White side border keeps space between bars
      borderColor: "#FFFFFF",
      borderWidth: {
        top: 0,
        bottom: 0,
        left: 3,
        right: 3,
      },

      borderRadius: {
        topLeft: 9,
        topRight: 9,
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

      backgroundColor: "#0d9488",

      // Same thin width as Female
      barThickness: 30,
      maxBarThickness: 30,

      // White side border keeps space between bars
      borderColor: "#FFFFFF",
      borderWidth: {
        top: 0,
        bottom: 0,
        left: 3,
        right: 3,
      },

      borderRadius: {
        topLeft: 9,
        topRight: 9,
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

      /*
        Fixed bar width = 22px

        The white left/right borders create
        a visible gap between Female and Male.

        categoryPercentage controls the spacing
        between date groups and is kept at 0.4
        so the date-group spacing remains.
      */
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

      max: 80,

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

const GenderDistribution = () => {
  return (
    <div className="bg-white/85 backdrop-blur-md rounded-2xl md:rounded-3xl border border-[#e2edf2] shadow-[0_4px_24px_rgba(15,23,42,0.03)] overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-[#e6f7f5] border border-[#0d9488]/20 flex items-center justify-center text-[#0d9488] shadow-xs">
              <PeopleAltIcon sx={{ fontSize: 20 }} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#0f172a]">
                Gender Distribution
              </h2>

              <p className="text-xs text-[#64748b] mt-0.5">
                Deployed headcount with day-over-day movement
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
            minWidth: "2016px",
          }}
        >
          <Bar data={chartData} options={options} />
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center items-center gap-4 pb-4">
        {/* Female */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#fb7185]"></span>

          <span className="text-xs font-medium text-slate-500">
            Female
          </span>
        </div>

        {/* Male */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0d9488]"></span>

          <span className="text-xs font-medium text-slate-500">
            Male
          </span>
        </div>
      </div>
    </div>
  );
};

export default GenderDistribution;