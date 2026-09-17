const colorClasses = {
  blue: {
    bg: "bg-[#F0EDFF]",
    text: "text-[#6F4AE7]",
    border: "border-[#E8E1FF]",
    wave: "#E9E3FF",
  },

  green: {
    bg: "bg-[#E8FBF2]",
    text: "text-[#16B364]",
    border: "border-[#DDF4E9]",
    wave: "#D9F7E8",
  },

  red: {
    bg: "bg-[#FFF0F0]",
    text: "text-[#EF2F35]",
    border: "border-[#FBE1E1]",
    wave: "#FFE3E3",
  },

  purple: {
    bg: "bg-[#F5EDFF]",
    text: "text-[#9B4DEB]",
    border: "border-[#E9DCFA]",
    wave: "#EEE1FF",
  },

  orange: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
    wave: "#FEF0C7",
  },

  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-100",
    wave: "#E5E7FF",
  },
};

const KPICards = ({ data = [], gridClass }) => {
  return (
    <div
      className={`mb-6 grid gap-4 ${
        gridClass || "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
      }`}
    >
      {data.map((item, index) => {
        const c = colorClasses[item.color] || colorClasses.purple;

        return (
          <div
            key={index}
            className={`
              group
              relative
              h-[100px]
              overflow-hidden
              rounded-2xl
              border
              ${c.border}
              bg-white
              px-3.5
              py-3
              shadow-[0_2px_8px_rgba(30,41,59,0.05)]
              transition-all
              duration-300
              hover:-translate-y-[2px]
              hover:shadow-[0_6px_18px_rgba(30,41,59,0.08)]
            `}
          >
            {/* Decorative Wave */}
            {/* <div className="pointer-events-none absolute bottom-0 right-0 h-[65px] w-[55%]">
              <svg
                viewBox="0 0 220 100"
                className="h-full w-full"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 82 C25 65 42 70 62 68 C87 65 98 32 122 39 C148 47 151 73 175 67 C193 63 207 48 220 42 L220 100 L0 100 Z"
                  fill={c.wave}
                  opacity="0.55"
                />

                <path
                  d="M0 82 C25 65 42 70 62 68 C87 65 98 32 122 39 C148 47 151 73 175 67 C193 63 207 48 220 42"
                  fill="none"
                  stroke={c.wave}
                  strokeWidth="1.5"
                  opacity="0.65"
                />
              </svg>
            </div> */}

            {/* Main Content */}
            <div className="relative z-10 flex h-full items-center">
              {/* Icon */}
              <div
                className={`
                  flex
                  h-[48px]
                  w-[48px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-[15px]
                  ${c.bg}
                  ${c.text}
                  transition-transform
                  duration-300
                  group-hover:scale-105
                `}
              >
                {item.icon}
              </div>

              {/* Text Content */}
              <div className="ml-3.5 flex h-full flex-col justify-center">
                {/* Title */}
                <p className="text-[12px] font-medium leading-[15px] text-[#64748B]">
                  {item.title}
                </p>

                {/* Value */}
                <h2 className="mt-[3px] text-[21px] font-bold leading-[24px] tracking-tight text-[#172033]">
                  {item.value}
                </h2>

                {/* Trend */}
                {item.trend && (
                  <div className="mt-[7px] flex items-center whitespace-nowrap">
                    <span className="mr-1 text-[11px] font-bold text-[#16B364]">
                      ↗
                    </span>

                    <span className="text-[10px] font-medium text-[#16B364]">
                      {item.trend}
                    </span>

                    <span className="ml-1 text-[10px] font-normal text-[#94A3B8]">
                      vs last 7 days
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KPICards;
