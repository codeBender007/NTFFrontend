import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UserProfileDetails from "../components/UserProfileDetails";
import UserApi from "../services/UserApi";
import { formatDate } from "../utils/operatorUtils";
import { SEED_EMPLOYEES } from "../utils/userSchema";
import { getRoleDesignationOverrides } from "../utils/userUtils";

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
  id: user?.id,
  sno: user?.sno,
  name: user?.empName || user?.name,
  employeeId: user?.payCode,
  cardNo: user?.cardNo,
  department: user?.departmentName || user?.department,
  status:
    user?.active === false
      ? "Inactive"
      : user?.leavingDate
        ? "Left"
        : "Active",
  level: user?.skillLevel || user?.grade,
  designation: user?.designation,
  role: user?.roleName || user?.role,
  category: user?.category,
  grade: user?.grade,
  companyName: user?.companyName,
  subDepartment: user?.subDepartmentName || user?.subDepartment,
  line: user?.lineName || user?.line,
  machine: user?.machineName || user?.machine,
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
  joiningDate: formatDate(user?.dateOfJoining || user?.joiningDate),
  leavingDate: formatDate(user?.leavingDate),
  firstOfDate: formatDate(user?.firstOfDay || user?.firstOfDate),
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
        let rawUser = null;
        try {
          const response = await UserApi.getUser(id);
          rawUser = response?.data?.data || response?.data;
        } catch (apiErr) {
          console.warn("UserApi.getUser failed, checking fallback/seed:", apiErr?.message);
        }

        // Fallback to SEED_EMPLOYEES if backend API is offline or returns 404
        if (!rawUser) {
          const seedMatch = SEED_EMPLOYEES.find(
            (u) =>
              String(u.id) === String(id) ||
              String(u.sno) === String(id) ||
              String(u.payCode) === String(id)
          );
          if (seedMatch) {
            rawUser = { ...seedMatch };
          }
        }

        if (rawUser && !cancelled) {
          const mapped = mapUserForProfile(rawUser);

          // Check role designation overrides matching by ID, payCode, email, or name
          const overrides = getRoleDesignationOverrides();
          const match =
            overrides[id] ||
            overrides[`id_${id}`] ||
            (rawUser.id != null && (overrides[`id_${rawUser.id}`] || overrides[rawUser.id])) ||
            (mapped.employeeId && (overrides[`payCode_${mapped.employeeId}`] || overrides[mapped.employeeId])) ||
            (mapped.email && (overrides[`email_${mapped.email.toLowerCase()}`] || overrides[mapped.email])) ||
            (mapped.name && overrides[`name_${mapped.name.toLowerCase()}`]);

          if (match) {
            const newDesig = typeof match === "object" ? match.designation || match.roleName : match;
            const newRole = typeof match === "object" ? match.roleName : match;
            if (newDesig) mapped.designation = newDesig;
            if (newRole) mapped.role = newRole;
          }

          setUser(mapped);
          return;
        }

        if (!cancelled && !rawUser) {
          setError("Unable to load this user profile. User not found.");
        }
      } catch (requestError) {
        if (!cancelled) {
          setUser(null);
          if (requestError.response?.status !== 404) {
            setError(
              getApiErrorMessage(
                requestError,
                "Unable to load this user profile. Please try again."
              )
            );
          }
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

  // Real-time synchronization of Role Assignments to User Profile page Designation
  useEffect(() => {
    const handleRoleUpdate = (event) => {
      const detail = event?.detail;
      if (!detail) return;

      setUser((prev) => {
        if (!prev) return prev;
        const uId = prev.id != null ? String(prev.id) : String(id);
        const uPayCode = prev.employeeId ? String(prev.employeeId).trim() : "";
        const uEmail = prev.email ? String(prev.email).trim().toLowerCase() : "";
        const uName = (prev.name || "").trim().toLowerCase();

        const isMatch =
          (detail.userId != null && (uId === String(detail.userId) || String(id) === String(detail.userId))) ||
          (detail.payCode && uPayCode === String(detail.payCode).trim()) ||
          (detail.email && uEmail === String(detail.email).trim().toLowerCase()) ||
          (detail.name && uName === String(detail.name).trim().toLowerCase());

        if (isMatch) {
          return {
            ...prev,
            designation: detail.designation || detail.roleName,
            role: detail.roleName,
          };
        }
        return prev;
      });
    };

    window.addEventListener("ntf:user-role-updated", handleRoleUpdate);
    window.addEventListener("storage", handleRoleUpdate);

    return () => {
      window.removeEventListener("ntf:user-role-updated", handleRoleUpdate);
      window.removeEventListener("storage", handleRoleUpdate);
    };
  }, [id]);

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
