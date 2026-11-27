import { useLocation } from "react-router-dom";
import QuestionPaperPreview from "../components/QuestionPaperPreview";

const L1Preview = () => {
  const location = useLocation();
  return <QuestionPaperPreview level="L1" paper={location.state?.paper || null} />;
};

export default L1Preview;
