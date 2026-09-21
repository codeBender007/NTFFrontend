import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { useNavigate } from "react-router-dom";

const Navbar = ({ activeMenu }) => {
  const navigate = useNavigate();

  return (
    <nav className="bg-white h-14 sm:h-16 shadow-sm flex items-center justify-between px-3 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg bg-primary/10 text-primary transition hover:bg-primary/20"
            title="Go Back"
          >
            <ArrowBackOutlinedIcon sx={{ fontSize: 20 }} />
          </button>
          <h1 className="text-base sm:text-xl font-bold text-gray-800 truncate">
            {activeMenu}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5 shrink-0">
        {/* <div className="relative">
          <button className="p-1.5 sm:p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition">
            <NotificationsNoneOutlinedIcon sx={{ fontSize: 20 }} />
          </button>
          <span className="absolute top-1 right-1 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary"></span>
        </div> */}
        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-primary-light to-primary-dark flex items-center justify-center text-white font-semibold text-sm">
          TA
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
