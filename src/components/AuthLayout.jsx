import logo from "../assets/images/NTF_logo_black.png";
import bgImage from "../assets/images/bg_image.png";

const AuthLayout = ({ welcomeTitle, welcomeText, title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex bg-[#F7F7F5]">
      {/* Left Side */}
      <div
        className="hidden lg:flex w-1/2 relative bg-cover bg-center rounded-r-3xl overflow-hidden"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 flex flex-col justify-center px-14 text-white">
          <h1 className="text-3xl font-bold mb-4">{welcomeTitle}</h1>
          <p className="text-base leading-7 max-w-md text-white/90">{welcomeText}</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-white px-6">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="logo" className="h-20" />
          </div>

          <h2 className="text-3xl font-bold text-[#171717] mb-2">{title}</h2>
          <p className="text-sm text-[#666666] mb-6">{subtitle}</p>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
