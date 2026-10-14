import { useNavigate } from "react-router-dom";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LogOutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ntfBlackLogo from "../assets/images/NTF_logo_black.png";
import AuthApi from "../features/auth/services/AuthApi";
import { clearSession } from "../features/auth/utils/authStorage";

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await AuthApi.logout();
    } catch {
      // Always clear the local session, even if the server call fails
    } finally {
      clearSession();
      navigate("/");
    }
  };

  const cards = [
    {
      title: "Dashboard",
      description: "Get an overview of all key workforce metrics, attendance, and analytics.",
      path: "/dashboard",
      icon: GridViewRoundedIcon,
      tag: "Analytics",
    },
    {
      title: "LMS",
      description: "Manage learning content, operator evaluations, and training pipelines.",
      path: "/lms",
      icon: SchoolOutlinedIcon,
      tag: "Training",
    },
    {
      title: "CMS",
      description: "Create, manage, and organize organizational content across the platform.",
      path: "/cms",
      icon: DescriptionOutlinedIcon,
      tag: "Management",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="bg-white/85 backdrop-blur-md border-b border-[#e2edf2] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={ntfBlackLogo}
              alt="NTF Logo"
              className="h-10 w-auto object-contain"
            />
            <div className="hidden sm:block h-5 w-px bg-[#e2edf2]" />
            <span className="hidden sm:inline-block text-xs font-semibold text-[#64748b] tracking-wide uppercase">
              Operations Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/90 border border-[#e2edf2] shadow-xs">
              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-[#0d9488] to-[#14b8a6] text-white flex items-center justify-center text-xs font-semibold shadow-xs">
                TA
              </div>
              <span className="text-xs font-semibold text-[#0f172a]">Admin</span>
            </div>

            <button
              onClick={handleLogout}
              className="h-9 w-9 rounded-xl border border-[#e2edf2] bg-white flex items-center justify-center text-[#64748b] hover:text-[#fb7185] hover:bg-[#fff1f2] hover:border-[#fb7185]/30 transition-colors shadow-xs"
              title="Sign Out"
            >
              <LogOutOutlinedIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col justify-center">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-[#e6f7f5] border border-[#0d9488]/20 text-[#0d9488] mb-4 shadow-2xs">
            Enterprise Portal
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0f172a]">
            Operations Management Hub
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#64748b] leading-relaxed">
            Select a core module below to monitor workforce indicators, conduct skill evaluations, or manage organizational systems.
          </p>
        </div>

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto w-full">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="group relative bg-white/85 backdrop-blur-md rounded-2xl md:rounded-3xl border border-[#e2edf2] p-7 flex flex-col justify-between shadow-[0_4px_20px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-1 hover:border-[#0d9488]/40 hover:shadow-[0_12px_32px_rgba(13,148,136,0.12)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    {/* Icon Container */}
                    <div className="h-12 w-12 rounded-xl bg-[#e6f7f5] border border-[#0d9488]/20 flex items-center justify-center text-[#0d9488] transition-colors group-hover:bg-[#0d9488] group-hover:text-white shadow-xs">
                      <Icon sx={{ fontSize: 24 }} />
                    </div>

                    <span className="text-[11px] font-semibold text-[#0d9488] bg-[#e6f7f5] border border-[#0d9488]/20 px-3 py-1 rounded-full">
                      {card.tag}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-[#0f172a]">
                    {card.title}
                  </h2>

                  <p className="mt-2 text-sm text-[#64748b] leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => card.path && navigate(card.path)}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#0f766e] hover:to-[#0d9488] text-white text-sm font-semibold shadow-sm shadow-[#0d9488]/25 hover:shadow-md active:scale-[0.98] transition flex items-center justify-center gap-2"
                  >
                    <span>Open {card.title}</span>
                    <ArrowForwardOutlinedIcon
                      sx={{ fontSize: 16 }}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Home;

