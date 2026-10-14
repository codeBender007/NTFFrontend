import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import UserProfileDetails from "../components/UserProfileDetails";
import UserApi from "../services/UserApi";
import { lmsMenus } from "../data/LMSMenu";
import { formatDate } from "../utils/operatorUtils";

const getApiErrorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string" && detail.trim()) return detail;

  if (Array.isArray(detail) && detail.length) {
    const messages = detail.map((item) => item?.msg).filter(Boolean);
    if (messages.length) return messages.join(", ");
  }

  return error?.response?.data?.message || fallback;
};

// Map the backend user response onto the fields the profile view renders.
const mapUserForProfile = (user) => ({
  sno: user?.sno,
  name: user?.empName,
  employeeId: user?.payCode,
  cardNo: user?.cardNo,
  department: user?.departmentName,
  status:
    user?.active === false
      ? "Inactive"
      : user?.leavingDate
        ? "Left"
        : "Active",
  level: user?.skillLevel || user?.grade,
  designation: user?.designation,
  category: user?.category,
  grade: user?.grade,
  companyName: user?.companyName,
  subDepartment: user?.subDepartmentName,
  line: user?.lineName,
  machine: user?.machineName,
  shift: user?.shift,
  plant: user?.plantId != null ? String(user.plantId) : "",
  plantLocation: user?.plantLocation,
  isDojo: user?.isDojo ? "Yes" : "No",
  fatherHusband: user?.fatherName,
  gender: user?.gender,
  dob: formatDate(user?.dob),
  bloodGroup: user?.bloodGroup,
  maritalState: user?.maritalStatus,
  email: user?.email,
  phone: user?.mobileNo,
  joiningDate: formatDate(user?.dateOfJoining),
  leavingDate: formatDate(user?.leavingDate),
  firstOfDate: formatDate(user?.firstOfDay),
  salary: user?.salary,
});

const UserProfile = () => {
  const { id } = useParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Users");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await UserApi.getUser(id);
        if (!cancelled) setUser(mapUserForProfile(response.data));
      } catch (requestError) {
        if (cancelled) return;

        setUser(null);

        // A 404 simply means the record does not exist (not an error state).
        if (requestError.response?.status !== 404) {
          setError(
            getApiErrorMessage(
              requestError,
              "Unable to load this user profile. Please try again.",
            ),
          );
        }

        console.error("Get user API error:", requestError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F7F5]">
      <Sidebar
        menuItems={lmsMenus}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="sticky top-0 z-30 bg-white shadow-sm">
          <Navbar setMobileOpen={setMobileOpen} activeMenu="Users" />
        </div>

        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex min-h-[60vh] items-center justify-center text-[#64748b]">
              <p className="text-sm font-semibold">Loading user profile...</p>
            </div>
          ) : error ? (
            <div className="mx-auto max-w-4xl p-6 sm:p-10">
              <div className="rounded-3xl border border-[#e2edf2] bg-white/90 p-12 text-center shadow-[0_4px_24px_rgba(15,23,42,0.04)] backdrop-blur-md">
                <h2 className="text-xl font-bold text-[#0f172a]">
                  Unable to load profile
                </h2>
                <p className="mt-2 text-sm text-[#64748b]">{error}</p>
                <button
                  onClick={() => setReloadKey((key) => key + 1)}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#14b8a6] px-5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#0d9488]/25 transition hover:from-[#0f766e] hover:to-[#0d9488]"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <UserProfileDetails user={user} />
          )}
        </main>
      </div>
    </div>
  );
};

export default UserProfile;
