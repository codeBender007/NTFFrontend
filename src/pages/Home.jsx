import { useNavigate } from "react-router-dom";

import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

// import homeBg from "../assets/images/home-bg.png";

const Home = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Dashboard",
      description: "Get an overview of all key metrics and performance.",
      path: "/dashboard",
      icon: GridViewRoundedIcon,
    },
    {
      title: "LMS",
      description: "Manage learning content, assessments and training.",
      path: "/lms",
      icon: SchoolOutlinedIcon,
    },
    {
      title: "CMS",
      description: "Create, manage and organize content across the platform.",
      path: "/cms",
      icon: DescriptionOutlinedIcon,
    },
  ];

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-cover bg-center bg-no-repeat"
      // style={{
      //   // backgroundImage: `url(${homeBg})`,
      // }}
    >
      <div className="absolute inset-0 bg-white/20" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-5 sm:px-8 py-10">
        <div className="w-full max-w-[1100px]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-10 max-w-[1050px] mx-auto">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="
                    group
                    relative
                    bg-white/95
                    backdrop-blur-sm
                    rounded-xl
                    border
                    border-white/70
                    border-t-[3px]
                    border-t-[#6F4AE7]
                    shadow-[0_8px_25px_rgba(50,40,100,0.12)]
                    px-8
                    py-8
                    min-h-[270px]
                    flex
                    flex-col
                    items-center
                    text-center
                    transition-all
                    duration-300
                    hover:-translate-y-2
                    hover:shadow-[0_16px_35px_rgba(111,74,231,0.20)]
                  "
                >
                  {/* Icon Circle */}
                  <div
                    className="
                      h-16
                      w-16
                      rounded-full
                      bg-[#f0ecff]
                      flex
                      items-center
                      justify-center
                      text-[#6F4AE7]
                      transition-all
                      duration-300
                      group-hover:bg-[#e7e0ff]
                      group-hover:scale-110
                    "
                  >
                    <Icon
                      sx={{
                        fontSize: 32,
                        color: "#6F4AE7",
                      }}
                    />
                  </div>

                  {/* Title */}
                  <h2 className="mt-5 text-xl font-bold text-[#252525]">
                    {card.title}
                  </h2>

                  {/* Description */}
                  <p className="mt-3 text-sm leading-6 text-gray-500 max-w-[230px]">
                    {card.description}
                  </p>

                  {/* Button */}
                  <button
                    onClick={() => card.path && navigate(card.path)}
                    className="
                      mt-auto
                      pt-8
                      w-full
                    "
                  >
                    <div
                      className="
                        w-full
                        h-11
                        rounded-lg
                        bg-gradient-to-r
                        from-[#7B52ED]
                        to-[#6F4AE7]
                        text-white
                        text-sm
                        font-semibold
                        flex
                        items-center
                        justify-center
                        gap-2
                        shadow-[0_4px_10px_rgba(111,74,231,0.25)]
                        hover:opacity-95
                        active:scale-[0.98]
                        transition-all
                      "
                    >
                      Open {card.title}
                      <ArrowForwardOutlinedIcon
                        sx={{
                          fontSize: 18,
                        }}
                        className="
                          transition-transform
                          duration-300
                          group-hover:translate-x-1
                        "
                      />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
