import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BASE_URL } from "../config";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Dashboard from "../features/dashboard/pages/Dashboard";
import Attendance from "../features/dashboard/pages/Attendance";
import Requirement from "../features/dashboard/pages/Requirement";
import LMS from "../features/lms/pages/LMS";
import L0 from "../features/lms/pages/L0";
import L0Editor from "../features/lms/pages/L0Editor";
import L0Preview from "../features/lms/pages/L0Preview";
import L1 from "../features/lms/pages/L1";
import L1Preview from "../features/lms/pages/L1Preview";
import DepartmentPage from "../features/lms/pages/Department";
import SectionPage from "../features/lms/pages/SectionPage";
import LinesPage from "../features/lms/pages/LinesPage";
import MachinePage from "../features/lms/pages/MachinePage";
import Roles from "../features/lms/pages/Roles";
import LMSDashboard from "../features/lms/pages/LMSDashboard";
import Operators from "../features/lms/pages/OperatorsPage";
import UsersPage from "../features/lms/pages/UsersPage";
import OperatorProfile from "../features/lms/pages/OperatorProfile";
import TrainingEffectivenessPage from "../features/lms/pages/TrainingEffectivenessPage";
import OperatorObservancePage from "../features/lms/pages/OperatorObservancePage";
import SavedPaperPreview from "../features/lms/pages/SavedPaperPreview";


const App = () => {
  return (
    <BrowserRouter basename={BASE_URL}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/attendance" element={<Attendance />} />
        <Route path="/dashboard/requirement" element={<Requirement />} />
        <Route path="/lms" element={<LMS />} />
        <Route path="/lms/dashboard" element={<LMSDashboard />} />
        <Route path="/lms/department" element={<DepartmentPage />} />
        {/* Sub-Departments */}
        <Route path="/lms/subdepartment/:deptId" element={<SectionPage />} />

        {/* Lines */}
        <Route path="/lms/line/:deptId/:subDeptId" element={<LinesPage />} />

        {/* Machines */}
        <Route
          path="/lms/machine/:deptId/:subDeptId/:lineId"
          element={<MachinePage />}
        />

      

        <Route path="/lms/roles" element={<Roles />} />

        <Route path="/lms/operators" element={<Operators />} />

        <Route path="/lms/users" element={<UsersPage />} />

        <Route path="/lms/operator/:id" element={<OperatorProfile />} />

        <Route path="/lms/l0" element={<L0 />} />

        <Route path="/lms/l0/editor" element={<L0Editor />} />
        <Route path="/lms/l0/preview" element={<L0Preview />} />

        <Route path="/lms/l1" element={<L1 />} />

        <Route path="/lms/l1/preview" element={<L1Preview />} />
        <Route path="/lms/paper/preview/:id" element={<SavedPaperPreview />} />
                <Route path="/lms/training" element={<TrainingEffectivenessPage />} />
                <Route path="/lms/operator-observance" element={<OperatorObservancePage />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
