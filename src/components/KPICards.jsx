const colorStyles = {
  blue: "bg-[#eff6ff] text-[#2563eb] border-[#2563eb]/20",
  green: "bg-[#ecfdf5] text-[#10b981] border-[#10b981]/20",
  orange: "bg-[#fff7ed] text-[#ea580c] border-[#ea580c]/20",
  red: "bg-[#fff1f2] text-[#fb7185] border-[#fb7185]/20",
  purple: "bg-[#f3e8ff] text-[#9333ea] border-[#9333ea]/20",
  teal: "bg-[#e6f7f5] text-[#0d9488] border-[#0d9488]/20",
};

const KPICards = ({ data = [], gridClass }) => {
  return (
    <div
      className={`mb-6 grid gap-4 ${
        gridClass || "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
      }`}
    >
      {data.map((item, index) => {
        const iconStyle = colorStyles[item.color] || colorStyles.teal;

        return (
          <div
            key={index}
            className="group relative overflow-hidden rounded-2xl md:rounded-3xl border border-[#e2edf2] bg-white/85 backdrop-blur-md px-5 py-4 shadow-[0_4px_20px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0d9488]/30 hover:shadow-[0_8px_30px_rgba(13,148,136,0.08)]"
          >
            {/* Main Content */}
            <div className="relative z-10 flex items-center">
              {/* Icon */}
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105 shadow-xs ${iconStyle}`}
              >
                {item.icon}
              </div>

              {/* Text Content */}
              <div className="ml-4 flex flex-col justify-center min-w-0">
                {/* Title */}
                <p className="text-xs font-medium text-[#64748b] truncate">
                  {item.title}
                </p>

                {/* Value */}
                <h2 className="mt-0.5 text-2xl font-bold tracking-tight text-[#0f172a]">
                  {item.value}
                </h2>

                {/* Trend */}
                {item.trend && (
                  <div className="mt-1 flex items-center whitespace-nowrap text-[11px] font-semibold text-[#10b981]">
                    <span className="mr-1">↑</span>
                    <span>{item.trend}</span>
                    <span className="ml-1 font-normal text-[#94a3b8]">
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

