import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UserProfileDetails from "../components/UserProfileDetails";
import UserApi from "../services/UserApi";
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
    <div className="space-y-4">
      {loading ? (
        <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
          <p className="text-sm font-semibold">Loading user profile...</p>
        </div>
      ) : error ? (
        <div className="mx-auto max-w-4xl p-6 sm:p-10">
          <div className="rounded-xl border border-slate-200/90 bg-white p-12 text-center shadow-xs">
            <h2 className="text-xl font-bold text-slate-900">
              Unable to load profile
            </h2>
            <p className="mt-2 text-sm text-slate-500">{error}</p>
            <button
              onClick={() => setReloadKey((key) => key + 1)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0b295c] hover:bg-[#082046] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <UserProfileDetails user={user} />
      )}
    </div>
  );
};

export default UserProfile;
