import { useNavigate } from "react-router-dom";
import QuestionPaperPage from "../components/QuestionPaperPage";

const L1Editor = () => {
  const navigate = useNavigate();
  return (
    <QuestionPaperPage
      level="L1"
      onBack={() => navigate("/lms/dojo-hiring")}
    />
  );
};

export default L1Editor;
