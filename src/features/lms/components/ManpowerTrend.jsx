import ManpowerAvailability from "./ManpowerAvailability";
import BufferManpower from "./BufferManpower";

const ManPowerTrend = () => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Card 1 */}
      <ManpowerAvailability />

      {/* Card 2 */}
      <BufferManpower />
    </div>
  );
};

export default ManPowerTrend;
