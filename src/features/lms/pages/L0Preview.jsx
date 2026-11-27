import { useLocation } from "react-router-dom";
import QuestionPaperPreview from "../components/QuestionPaperPreview";

const L0Preview = () => {
  const location = useLocation();
  return <QuestionPaperPreview level="L0" paper={location.state?.paper || null} />;
};

export default L0Preview;
