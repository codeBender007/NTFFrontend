import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  CHART_COLORS,
  getBarChartOptions,
  createBarDataset,
} from "../../../utils/chartConfig";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

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
    createBarDataset({
      label: "Male",
      data: [45, 55, 40, 60, 50, 34, 60, 45, 55, 40, 60, 50, 34, 60, 55, 45],
      color: CHART_COLORS.primary,
      borderRadius: 0,
      barThickness: 20,
    }),
    createBarDataset({
      label: "Female",
      data: [30, 46, 24, 50, 40, 20, 45, 30, 46, 24, 50, 40, 20, 45, 46, 32],
      color: CHART_COLORS.pink,
      borderRadius: 0,
      barThickness: 20,
    }),
  ],
};

const options = getBarChartOptions({
  yStepSize: 20,
});

const GenderAttendance = () => {
  return (
    <div className="bg-white/85 backdrop-blur-md rounded-2xl md:rounded-3xl border border-[#e2edf2] shadow-[0_4px_24px_rgba(15,23,42,0.03)] p-5 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-[#e6f7f5] border border-[#0d9488]/20 text-[#0d9488] flex items-center justify-center shadow-xs">
            <PeopleAltIcon sx={{ fontSize: 20 }} />
          </div>

          <div>
            <h2 className="text-base font-bold text-[#0f172a] tracking-tight">
              Gender Attendance
            </h2>
            <p className="text-xs text-[#64748b] font-medium">
              Deployed headcount with day-over-day movement
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e6f7f5] text-[#0f766e] border border-[#0d9488]/20 whitespace-nowrap">
            Avg Attendance: 88.6%
          </span>
        </div>
      </div>

      <div className="overflow-x-auto custom-chart-scrollbar pb-2">
        <div
          className="h-[240px]"
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

export default GenderAttendance;
