import { useNavigate } from "react-router-dom";
import QuestionPaperPage from "../components/QuestionPaperPage";

const L0Editor = () => {
  const navigate = useNavigate();
  return (
    <QuestionPaperPage
      level="L0"
      onBack={() => navigate("/lms/dojo-hiring")}
    />
  );
};

export default L0Editor;
