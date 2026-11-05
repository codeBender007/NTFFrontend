import ManTrend from "./ManTrend";
import ManInternalRejection from "./ManInternalRejections";

const ManRelatedDefects = () => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Card 1 */}
      <ManTrend />

      {/* Card 2 */}
      <ManInternalRejection />
    </div>
  );
};

export default ManRelatedDefects;
