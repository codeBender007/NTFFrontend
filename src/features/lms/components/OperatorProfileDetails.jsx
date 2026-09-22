/* ============================================================
   OLD DESIGN - KEPT COMMENTED
   Refer to this block before reverting the UI.
   ============================================================ */

/*
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PinDropOutlinedIcon from "@mui/icons-material/PinDropOutlined";
import FamilyRestroomOutlinedIcon from "@mui/icons-material/FamilyRestroomOutlined";
import WcOutlinedIcon from "@mui/icons-material/WcOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import KPICards from "../../../components/KPICards";
import profileBg from "../../../assets/images/profile-bg.png";

const defaultOperator = {
  name: "RAM",
  employeeId: "FNG",
  department: "HR",
  section: "80",
  line: "N/A",
  subSection: "N/A",
  station: "N/A",
  level: "L1",
  efficiency: "0%",
  status: "ON LEAVE",
  email: "fng@fme-minda.co.in",
  phone: "N/A",
  designation: "Operator",
  contractor: "N/A",
  employeeType: "Regular",
  shift: "N/A",
  todayShift: "N/A",
  courses: "N/A",
  progress: "N/A",
  submission: "N/A",
  testAvg: "N/A",
  fatherHusband: "—",
  gender: "MALE",
  dob: "—",
  qualification: "Not Specified",
  joiningDate: "—",
  district: "—",
  pinCode: "—",
  busRoute: "Self / Not Assigned",
  desk: "—",
  pktCode: "—",
  gradeRule: "Self / Not Assigned",
};

const getInitials = (name = "") => {
  const parts = String(name).trim().split(/\s+/);
  const initials = parts
    .slice(0, 2)
    .map((p) => p.charAt(0))
    .join("")
    .toUpperCase();

  return initials || "OP";
};

const OperatorProfileDetails = ({ operator = defaultOperator }) => {
  const data = {
    ...defaultOperator,
    ...operator,
  };

  const normalizedStatus = (data.status || "").toUpperCase();

  const statusClasses =
    normalizedStatus === "ACTIVE"
      ? "border-[#7BD6A4] bg-[#EEFBF4] text-[#16864A]"
      : normalizedStatus === "ON LEAVE"
        ? "border-[#FFD9A8] bg-[#FFF4E5] text-[#E6920B]"
        : normalizedStatus === "LEFT"
          ? "border-[#FFD3D3] bg-[#FFF0EE] text-[#E74C3C]"
          : "border-[#E4E7EC] bg-[#F9FAFB] text-[#344054]";

  const statusDotClasses =
    normalizedStatus === "ACTIVE"
      ? "bg-[#16864A]"
      : normalizedStatus === "ON LEAVE"
        ? "bg-[#E6920B]"
        : normalizedStatus === "LEFT"
          ? "bg-[#E74C3C]"
          : "bg-[#9AA3AF]";

  return (
    <div className="space-y-4 p-3 md:p-4 lg:p-5">
      {/* =========================================================
          TOP PROFILE HEADER
      ========================================================= * /}
      <section className="relative overflow-hidden rounded-2xl border border-[#E8EAF0] bg-white shadow-[0_2px_10px_rgba(16,24,40,0.04)]">
        {/* Background image * /}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${profileBg})` }}
        />

        <div className="relative z-10 flex flex-col gap-5 p-6 md:p-7 xl:flex-row xl:items-center xl:justify-between">
          {/* LEFT PROFILE * /}
          <div className="flex items-center gap-4 md:gap-5">
            {/* Avatar * /}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#DDD5FF] bg-[#F4F1FF] text-xl font-bold text-[#6F4AE7] md:h-20 md:w-20 md:text-2xl">
              {getInitials(data.name)}
            </div>

            {/* Identity * /}
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-[#101828] md:text-3xl">
                {data.name}
              </h1>

              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[#667085]">
                <span className="text-[#8B93A7]">Employee ID</span>
                {data.employeeId}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-[#DDD5FF] bg-[#F4F1FF] px-3 py-1 text-xs font-semibold text-[#5B3BE6]">
                  {data.level}
                </span>

                <span className="inline-flex items-center rounded-full border border-[#DDD5FF] bg-[#F4F1FF] px-3 py-1 text-xs font-semibold text-[#5B3BE6]">
                  {data.department}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${statusDotClasses}`}
                  />
                  {data.status || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT ACTIONS * /}
          <div className="flex items-center gap-2 self-start xl:self-center">
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-[#E4E7EC] bg-white px-4 py-2.5 text-xs font-semibold text-[#344054] transition hover:bg-[#F9FAFB]"
            >
              <RefreshOutlinedIcon sx={{ fontSize: 16 }} />
              Refresh Data
            </button>

            <button
              type="button"
              className="flex h-10 w-9 items-center justify-center rounded-lg border border-[#E4E7EC] bg-white text-[#667085] transition hover:bg-[#F9FAFB]"
            >
              <MoreVertOutlinedIcon sx={{ fontSize: 19 }} />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          MAIN PROFILE AREA
      ========================================================= * /}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[240px_minmax(0,1fr)]">
        {/* =====================================================
            PRIMARY DETAILS
        ===================================================== * /}
        <section className="overflow-hidden rounded-2xl border border-[#E8EAF0] bg-white shadow-[0_2px_10px_rgba(16,24,40,0.04)]">
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#6F4AE7] to-[#9A7CF5] px-4 py-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-white">
              <PersonOutlineOutlinedIcon sx={{ fontSize: 20 }} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-white">Primary Details</h2>
              <p className="text-[11px] font-medium text-white/80">
                Contact information
              </p>
            </div>
          </div>

          <div className="space-y-2.5 p-4">
            <div className="flex items-center gap-3 rounded-xl border border-[#EEF0F5] bg-[#FBFCFE] p-3 transition hover:border-[#DDD5FF] hover:bg-white hover:shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F4F1FF] text-[#6F4AE7] ring-1 ring-[#E9E3FF]">
                <EmailOutlinedIcon sx={{ fontSize: 20 }} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium text-[#8B93A7]">
                  Email Address
                </p>

                <p className="mt-0.5 truncate text-sm font-semibold text-[#252B3A]">
                  {data.email || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[#EEF0F5] bg-[#FBFCFE] p-3 transition hover:border-[#DDD5FF] hover:bg-white hover:shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F4F1FF] text-[#6F4AE7] ring-1 ring-[#E9E3FF]">
                <PhoneOutlinedIcon sx={{ fontSize: 20 }} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium text-[#8B93A7]">
                  Mobile Number
                </p>

                <p className="mt-0.5 truncate text-sm font-semibold text-[#252B3A]">
                  {data.phone || "—"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            DETAILED PROFILE
        ===================================================== * /}
        <section className="min-w-0 overflow-hidden rounded-2xl border border-[#E8EAF0] bg-white shadow-[0_2px_10px_rgba(16,24,40,0.04)]">
          {/* Header * /}
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#6F4AE7] to-[#9A7CF5] px-4 py-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-white">
              <BusinessOutlinedIcon sx={{ fontSize: 20 }} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-white">
                Detailed Profile Information
              </h2>
              <p className="text-[11px] font-medium text-white/80">
                Personal, professional & location details
              </p>
            </div>
          </div>

          {/* THREE COLUMNS * /}
          <div className="p-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* PERSONAL * /}
              <div className="rounded-2xl border border-[#EEF0F5] bg-[#FBFCFE] p-4 transition hover:border-[#DDD5FF]">
                <div className="mb-2 flex items-center gap-2.5 border-b border-[#EEF0F5] pb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F4F1FF] text-[#6F4AE7] ring-1 ring-[#E9E3FF]">
                    <FamilyRestroomOutlinedIcon sx={{ fontSize: 18 }} />
                  </div>

                  <h3 className="text-[13px] font-bold text-[#252B3A]">
                    Personal
                  </h3>
                </div>

                <div className="flex items-start gap-3 border-b border-[#F0F2F7] py-3 last:border-b-0">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F4F1FF] text-[#6F4AE7] ring-1 ring-[#E9E3FF]">
                    <FamilyRestroomOutlinedIcon sx={{ fontSize: 17 }} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[#8B93A7]">
                      Father / Husband
                    </p>
                    <p className="mt-1 text-[13px] font-semibold text-[#252B3A]">
                      {data.fatherHusband || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-b border-[#F0F2F7] py-3 last:border-b-0">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F4F1FF] text-[#6F4AE7] ring-1 ring-[#E9E3FF]">
                    <WcOutlinedIcon sx={{ fontSize: 17 }} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[#8B93A7]">
                      Gender / DOB
                    </p>
                    <p className="mt-1 text-[13px] font-semibold text-[#252B3A]">
                      {data.gender} / {data.dob}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-b border-[#F0F2F7] py-3 last:border-b-0">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F4F1FF] text-[#6F4AE7] ring-1 ring-[#E9E3FF]">
                    <SchoolOutlinedIcon sx={{ fontSize: 17 }} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[#8B93A7]">
                      Qualification
                    </p>
                    <p className="mt-1 inline-block rounded-md bg-[#F3F0FF] px-2 py-0.5 text-[13px] font-semibold text-[#5B3BE6]">
                      {data.qualification || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-b border-[#F0F2F7] py-3 last:border-b-0">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F4F1FF] text-[#6F4AE7] ring-1 ring-[#E9E3FF]">
                    <FlagOutlinedIcon sx={{ fontSize: 17 }} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[#8B93A7]">
                      Joining Date
                    </p>
                    <p className="mt-1 text-[13px] font-semibold text-[#252B3A]">
                      {data.joiningDate || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* PROFESSIONAL * /}
              <div className="rounded-2xl border border-[#EEF0F5] bg-white p-4 transition hover:border-[#DDD5FF]">
                <div className="mb-3 flex items-center gap-2.5 border-b border-[#EEF0F5] pb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F4F1FF] text-[#6F4AE7] ring-1 ring-[#E9E3FF]">
                    <AccountTreeOutlinedIcon sx={{ fontSize: 18 }} />
                  </div>

                  <h3 className="text-[13px] font-bold text-[#252B3A]">
                    Professional
                  </h3>
                </div>

                <p className="mb-3 text-[11px] font-bold text-[#344054]">
                  Organizational Assignment Flow
                </p>

                <div className="flex flex-col items-center">
                  {/* Department * /}
                  <div className="flex w-full items-center justify-center gap-2">
                    <div className="w-[115px]">
                      <div className="rounded-lg border border-[#DDD5FF] bg-[#F5F2FF] px-2.5 py-2">
                        <div className="flex items-center gap-1.5">
                          <ApartmentOutlinedIcon
                            sx={{ fontSize: 14 }}
                            className="text-[#6F4AE7]"
                          />

                          <div className="min-w-0">
                            <p className="text-[9px] font-semibold uppercase text-[#8B93A7]">
                              DEPT
                            </p>
                            <p className="text-[11px] font-bold text-[#4F46B5]">
                              {data.department}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <ArrowForwardIosOutlinedIcon
                      sx={{ fontSize: 12, color: "#A5ACBA" }}
                    />

                    <div className="relative w-[115px]">
                      <div className="rounded-lg border border-[#DDD5FF] bg-[#F5F2FF] px-2.5 py-2">
                        <div className="flex items-center gap-1.5">
                          <AccountTreeOutlinedIcon
                            sx={{ fontSize: 14 }}
                            className="text-[#6F4AE7]"
                          />

                          <div className="min-w-0">
                            <p className="text-[9px] font-semibold uppercase text-[#8B93A7]">
                              SECTION
                            </p>
                            <p className="text-[11px] font-bold text-[#4F46B5]">
                              {data.section}
                            </p>
                          </div>
                        </div>
                      </div>

                      <span className="absolute -right-2 -top-2 rounded-full bg-[#6F4AE7] px-1.5 py-0.5 text-[7px] font-bold text-white">
                        Primary
                      </span>
                    </div>
                  </div>

                  {/* Connector * /}
                  <div className="h-4 w-px border-l border-dashed border-[#A5ACBA]" />

                  {/* Line * /}
                  <div className="flex w-full justify-center">
                    <div className="rounded-lg border border-[#D6E1FF] bg-[#F2F6FF] px-2.5 py-2">
                      <div className="flex items-center gap-1.5">
                        <ApartmentOutlinedIcon
                          sx={{ fontSize: 14 }}
                          className="text-[#5575D9]"
                        />

                        <div className="min-w-0">
                          <p className="text-[9px] font-semibold uppercase text-[#8B93A7]">
                            LINE
                          </p>
                          <p className="text-[11px] font-bold text-[#4457A8]">
                            {data.line}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-4 w-px border-l border-dashed border-[#A5ACBA]" />

                  {/* Sub section * /}
                  <div className="flex w-full justify-center">
                    <div className="rounded-lg border border-[#DDD5FF] bg-[#F5F2FF] px-2.5 py-2">
                      <div className="flex items-center gap-1.5">
                        <LayersOutlinedIcon
                          sx={{ fontSize: 14 }}
                          className="text-[#6F4AE7]"
                        />

                        <div className="min-w-0">
                          <p className="text-[9px] font-semibold uppercase text-[#8B93A7]">
                            SUB-SECT
                          </p>
                          <p className="text-[11px] font-bold text-[#4F46B5]">
                            {data.subSection}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-4 w-px border-l border-dashed border-[#A5ACBA]" />

                  {/* Station + Level * /}
                  <div className="grid w-full grid-cols-2 gap-2">
                    <div className="rounded-lg border border-[#FFD3D3] bg-[#FFF4F4] px-2.5 py-2">
                      <div className="flex items-center gap-1.5">
                        <SettingsOutlinedIcon
                          sx={{ fontSize: 14 }}
                          className="text-[#FF4D4D]"
                        />

                        <div className="min-w-0">
                          <p className="text-[9px] font-semibold uppercase text-[#8B93A7]">
                            STATION
                          </p>
                          <p className="text-[11px] font-bold text-[#FF4D4D]">
                            {data.station}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-[#DDD5FF] bg-[#F5F2FF] px-2.5 py-2">
                      <div className="flex items-center gap-1.5">
                        <LayersOutlinedIcon
                          sx={{ fontSize: 14 }}
                          className="text-[#6F4AE7]"
                        />

                        <div className="min-w-0">
                          <p className="text-[9px] font-semibold uppercase text-[#8B93A7]">
                            LEVEL
                          </p>
                          <p className="text-[11px] font-bold text-[#4F46B5]">
                            {data.level}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-3 w-px border-l border-dashed border-[#A5ACBA]" />

                  {/* Efficiency * /}
                  <div className="w-1/2 min-w-[100px]">
                    <div className="rounded-lg border border-[#C7EED8] bg-[#EEFBF4] px-2.5 py-2">
                      <div className="flex items-center gap-1.5">
                        <SettingsOutlinedIcon
                          sx={{ fontSize: 14 }}
                          className="text-[#1DA65B]"
                        />

                        <div className="min-w-0">
                          <p className="text-[9px] font-semibold uppercase text-[#8B93A7]">
                            EFFICIENCY
                          </p>
                          <p className="text-[11px] font-bold text-[#16864A]">
                            {data.efficiency}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* LOCATION & TRANSIT * /}
              <div className="rounded-2xl border border-[#EEF0F5] bg-[#FBFCFE] p-4 transition hover:border-[#DDD5FF]">
                <div className="mb-2 flex items-center gap-2.5 border-b border-[#EEF0F5] pb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F4F1FF] text-[#6F4AE7] ring-1 ring-[#E9E3FF]">
                    <LocationOnOutlinedIcon sx={{ fontSize: 18 }} />
                  </div>

                  <h3 className="text-[13px] font-bold text-[#252B3A]">
                    Location & Transit
                  </h3>
                </div>

                <div className="flex items-start gap-3 border-b border-[#F0F2F7] py-3 last:border-b-0">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F4F1FF] text-[#6F4AE7] ring-1 ring-[#E9E3FF]">
                    <LocationOnOutlinedIcon sx={{ fontSize: 17 }} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[#8B93A7]">
                      District & State
                    </p>
                    <p className="mt-1 text-[13px] font-semibold text-[#252B3A]">
                      {data.district || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-b border-[#F0F2F7] py-3 last:border-b-0">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F4F1FF] text-[#6F4AE7] ring-1 ring-[#E9E3FF]">
                    <PinDropOutlinedIcon sx={{ fontSize: 17 }} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[#8B93A7]">
                      PIN Code
                    </p>
                    <p className="mt-1 text-[13px] font-semibold text-[#252B3A]">
                      {data.pinCode || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* =========================================================
          SHIFT SCHEDULE
      ========================================================= * /}
      <section className="overflow-hidden rounded-2xl border border-[#E8EAF0] bg-white shadow-[0_2px_10px_rgba(16,24,40,0.04)]">
        <div className="flex items-center gap-3 bg-gradient-to-r from-[#6F4AE7] to-[#9A7CF5] px-4 py-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-white">
            <ScheduleOutlinedIcon sx={{ fontSize: 20 }} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-white">Shift Schedule</h2>
            <p className="text-[11px] font-medium text-white/80">
              Default and today&apos;s working shift
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          {/* DEFAULT SHIFT * /}
          <div className="flex items-center gap-3 rounded-xl border border-[#EEF0F5] bg-[#FBFCFE] p-4 transition hover:border-[#DDD5FF] hover:bg-white">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#F4F1FF] text-[#6F4AE7] ring-1 ring-[#E9E3FF]">
              <CalendarMonthOutlinedIcon sx={{ fontSize: 22 }} />
            </div>

            <div>
              <p className="text-[11px] font-medium text-[#8B93A7]">
                Default Shift
              </p>
              <p className="mt-0.5 text-sm font-bold text-[#252B3A]">
                {data.shift || "—"}
              </p>
            </div>
          </div>

          {/* TODAY'S SHIFT * /}
          <div className="flex items-center gap-3 rounded-xl border border-[#EEF0F5] bg-[#FBFCFE] p-4 transition hover:border-[#DDD5FF] hover:bg-white">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#F4F1FF] text-[#6F4AE7] ring-1 ring-[#E9E3FF]">
              <TodayOutlinedIcon sx={{ fontSize: 22 }} />
            </div>

            <div>
              <p className="text-[11px] font-medium text-[#8B93A7]">
                Today&apos;s Shift
              </p>
              <p className="mt-0.5 text-sm font-bold text-[#252B3A]">
                {data.todayShift || "—"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LEARNING / TRAINING CARD * /}
      <KPICards
        data={[
          {
            title: "Courses",
            value: data.courses || "—",
            color: "indigo",
            icon: <MenuBookOutlinedIcon sx={{ fontSize: 24 }} />,
          },
          {
            title: "Progress",
            value: data.progress || "—",
            color: "green",
            icon: <TrendingUpOutlinedIcon sx={{ fontSize: 24 }} />,
          },
          {
            title: "Submission",
            value: data.submission || "—",
            color: "blue",
            icon: <TaskAltOutlinedIcon sx={{ fontSize: 24 }} />,
          },
          {
            title: "Test Avg",
            value: data.testAvg || "—",
            color: "orange",
            icon: <FactCheckOutlinedIcon sx={{ fontSize: 24 }} />,
          },
        ]}
      />
    </div>
  );
};

export default OperatorProfileDetails;
*/

import {
  Award,
  BadgeCheck,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Droplets,
  Hash,
HeartPulse,
  Layers,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  RefreshCw,
  TrendingUp,
  User,
  Users,
Wallet,
} from "lucide-react";
import profileBg from "../../../assets/images/profile-bg.png";

const defaultOperator = {
  sno: "—",
  name: "—",
  employeeId: "—",
  cardNo: "—",
  designation: "—",
  department: "—",
  status: "",
  level: "—",
  companyName: "—",
  subDepartment: "—",
  category: "—",
  grade: "—",
  line: "—",
  machine: "—",
  shift: "—",
  plant: "—",
  plantLocation: "—",
  isDojo: "—",
  fatherHusband: "—",
  gender: "—",
  dob: "—",
  bloodGroup: "—",
  maritalState: "—",
  email: "—",
  phone: "—",
  joiningDate: "—",
  leavingDate: "—",
  firstOfDate: "—",
  salary: "—",
  courses: "—",
  progress: "—",
  submission: "—",
  testAvg: "—",
};

const getInitials = (name = "") => {
  const parts = String(name).trim().split(/\s+/);
  const initials = parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

return initials || "OP";
};

const InfoCard = ({ title, subtitle, icon: Icon, children }) => (
  <section className="overflow-hidden rounded-2xl border border-[#e6e8ef] bg-white shadow-[0_2px_10px_rgba(16,24,40,0.04)]">
    <div className="border-b border-[#F0F2F7] px-4 py-3.5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F4F1FF] text-[#6F4AE7]">
          <Icon size={18} />
        </div>

        <div>
          <h2 className="text-sm font-bold text-[#101828]">{title}</h2>

          {subtitle && (
            <p className="text-[11px] font-medium text-[#8B93A7]">{subtitle}</p>
          )}
        </div>
      </div>
    </div>

    <div className="grid gap-2.5 p-4 sm:grid-cols-2 xl:grid-cols-1">
      {children}
    </div>
  </section>
);

const Field = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 rounded-xl border border-[#EEF0F5] bg-[#FBFCFE] px-3 py-3 transition hover:border-[#DDD5FF] hover:bg-white">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F4F1FF] text-[#6F4AE7] ring-1 ring-[#E9E3FF]">
      <Icon size={17} />
    </div>

    <div className="min-w-0">
      <p className="text-[11px] font-medium text-[#8B93A7]">{label}</p>
      <p className="mt-0.5 truncate text-[13px] font-semibold text-[#252B3A]">
        {value || "—"}
      </p>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-[#e6e8ef] bg-white p-4 shadow-[0_2px_10px_rgba(16,24,40,0.04)]">
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}
    >
      <Icon size={20} />
    </div>

    <div className="min-w-0">
      <p className="text-[11px] font-medium text-[#8B93A7]">{label}</p>
      <p className="truncate text-lg font-extrabold text-[#101828]">{value}</p>
    </div>
  </div>
);

const OperatorProfileDetails = ({ operator = defaultOperator }) => {
  const data = { ...defaultOperator, ...operator };
  const initials = getInitials(data.name);
  const normalizedStatus = String(data.status || "").toUpperCase();

const statusClasses =
    normalizedStatus === "ACTIVE"
      ? "border-[#BFEBD4] bg-[#EEFBF4] text-[#16864A]"
      : normalizedStatus === "ON LEAVE"
        ? "border-[#FFD9A8] bg-[#FFF4E5] text-[#E6920B]"
        : normalizedStatus === "LEFT"
          ? "border-[#FFD3D3] bg-[#FFF0EE] text-[#E74C3C]"
          : "border-[#E4E7EC] bg-[#F9FAFB] text-[#344054]";

  const statusDotClasses =
    normalizedStatus === "ACTIVE"
      ? "bg-[#16864A]"
      : normalizedStatus === "ON LEAVE"
        ? "bg-[#E6920B]"
        : normalizedStatus === "LEFT"
          ? "bg-[#E74C3C]"
          : "bg-[#9AA3AF]";

  const stats = [
    {
      label: "Courses",
      value: data.courses,
      icon: BookOpen,
      accent: "bg-[#F4F1FF] text-[#6F4AE7]",
    },
    {
      label: "Progress",
      value: data.progress,
      icon: TrendingUp,
      accent: "bg-[#EEFBF4] text-[#16864A]",
    },
    {
      label: "Submission",
      value: data.submission,
      icon: CheckCircle2,
      accent: "bg-[#EFF6FF] text-[#2563EB]",
    },
    {
      label: "Test Avg",
      value: data.testAvg,
      icon: Award,
      accent: "bg-[#FFF4E5] text-[#E6920B]",
    },
  ];

  return (
    <div className="mx-auto max-w-[1320px] space-y-5 p-4 md:p-6 lg:p-7">
      {/* =========================================================
          PROFILE HEADER
      ========================================================= */}
<section className="relative overflow-hidden rounded-2xl border border-[#E8EAF0] bg-white shadow-[0_2px_10px_rgba(16,24,40,0.04)]">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${profileBg})` }}
        />

        <div className="relative z-10 flex flex-col gap-5 p-6 md:p-7 xl:flex-row xl:items-center xl:justify-between">
          {/* LEFT PROFILE */}
          <div className="flex items-center gap-4 md:gap-5">
            {/* Avatar */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#DDD5FF] bg-[#F4F1FF] text-xl font-bold text-[#6F4AE7] md:h-20 md:w-20 md:text-2xl">
              {initials}
            </div>

            {/* Identity */}
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-[#101828] md:text-3xl">
                {data.name}
              </h1>

              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[#667085]">
                <span className="text-[#8B93A7]">Employee ID</span>
                {data.employeeId}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-[#DDD5FF] bg-[#F4F1FF] px-3 py-1 text-xs font-semibold text-[#5B3BE6]">
                  {data.level}
                </span>

                <span className="inline-flex items-center rounded-full border border-[#DDD5FF] bg-[#F4F1FF] px-3 py-1 text-xs font-semibold text-[#5B3BE6]">
                  {data.department}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${statusDotClasses}`}
                  />
                  {data.status || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2 self-start xl:self-center">
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-[#E4E7EC] bg-white px-4 py-2.5 text-xs font-semibold text-[#344054] transition hover:bg-[#F9FAFB]"
            >
              <RefreshCw size={16} />
              Refresh Data
            </button>

            <button
              type="button"
              className="flex h-10 w-9 items-center justify-center rounded-lg border border-[#E4E7EC] bg-white text-[#667085] transition hover:bg-[#F9FAFB]"
            >
              <MoreVertical size={19} />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          QUICK STATS
      ========================================================= */}
      {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            accent={stat.accent}
          />
        ))}
      </div> */}

      {/* =========================================================
          DETAILED INFORMATION
      ========================================================= */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* PERSONAL */}
        <InfoCard title="Personal Information" subtitle="Personal details" icon={User}>
          <Field icon={Users} label="Father / Husband" value={data.fatherHusband} />
          <Field icon={HeartPulse} label="Gender" value={data.gender} />
          <Field icon={CalendarDays} label="Date of Birth" value={data.dob} />
          <Field icon={Droplets} label="Blood Group" value={data.bloodGroup} />
          <Field icon={BadgeCheck} label="Marital State" value={data.maritalState} />
        </InfoCard>

        {/* JOB & ORGANIZATION */}
        <InfoCard title="Job & Organization" subtitle="Company and role" icon={Briefcase}>
          <Field icon={Building2} label="Company" value={data.companyName} />
          <Field icon={Layers} label="Department" value={data.department} />
          <Field icon={Hash} label="Sub Department" value={data.subDepartment} />
          <Field icon={BadgeCheck} label="Designation" value={data.designation} />
          <Field icon={Award} label="Grade" value={data.grade} />
          <Field icon={TrendingUp} label="Skill Level" value={data.level} />
        </InfoCard>

        {/* WORKSPACE & SHIFT */}
        <InfoCard title="Workspace & Shift" subtitle="Line, machine and shift" icon={MapPin}>
          <Field icon={Building2} label="Plant" value={data.plant} />
          <Field icon={MapPin} label="Plant Location" value={data.plantLocation} />
          <Field icon={Hash} label="Line / Machine" value={[data.line, data.machine].filter(Boolean).join(" / ")} />
          <Field icon={Clock} label="Shift" value={data.shift} />
          <Field icon={BadgeCheck} label="Is Dojo" value={data.isDojo} />
          <Field icon={Users} label="Category" value={data.category} />
        </InfoCard>
      </div>

      {/* =========================================================
          CONTACT & TIMELINE
      ========================================================= */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <InfoCard title="Contact Details" subtitle="How to reach" icon={Phone}>
          <Field icon={Mail} label="Email Address" value={data.email} />
          <Field icon={Phone} label="Mobile Number" value={data.phone} />
          <Field icon={Layers} label="Pay Code" value={data.employeeId} />
          <Field icon={CreditCard} label="Card No" value={data.cardNo} />
        </InfoCard>

        <InfoCard title="Employment Timeline" subtitle="Dates and compensation" icon={CalendarDays}>
          <Field icon={CalendarDays} label="Joining Date" value={data.joiningDate} />
          <Field icon={CalendarDays} label="Leaving Date" value={data.leavingDate} />
          <Field icon={CalendarDays} label="First Of Date" value={data.firstOfDate} />
          <Field icon={Wallet} label="Salary" value={data.salary} />
        </InfoCard>
      </div>
    </div>
  );
};

export default OperatorProfileDetails;
