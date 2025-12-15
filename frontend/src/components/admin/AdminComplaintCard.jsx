import {
  useGetWardensQuery,
  useAssignComplaintMutation,
} from "../../api/adminApi";
import { useState } from "react";

const AdminComplaintCard = ({ complaint }) => {
  const { data: wardens } = useGetWardensQuery();
  const [assignComplaint] = useAssignComplaintMutation();
  const [selectedWarden, setSelectedWarden] = useState("");

  const handleAssign = async () => {
    if (!selectedWarden) return;

    await assignComplaint({
      complaintId: complaint._id,
      wardenId: selectedWarden,
    });
  };

  return (
    <div className="border rounded p-4 shadow">
      <h2 className="font-semibold text-lg">
        {complaint.title}
      </h2>

      <p className="text-gray-700">
        {complaint.description}
      </p>

      <div className="text-sm text-gray-600 mt-2">
        <p><b>Status:</b> {complaint.status}</p>
        <p><b>Category:</b> {complaint.category}</p>
        <p><b>Student:</b> {complaint.student.name}</p>
      </div>

      {/* ASSIGN ONLY IF UNASSIGNED */}
      {!complaint.assignedTo && (
        <div className="mt-4">
          <select
            value={selectedWarden}
            onChange={(e) => setSelectedWarden(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">Select Warden</option>
            {wardens?.map((warden) => (
              <option key={warden._id} value={warden._id}>
                {warden.name} (Block {warden.block})
              </option>
            ))}
          </select>

          <button
            onClick={handleAssign}
            className="ml-2 bg-blue-600 text-white px-3 py-1 rounded"
          >
            Assign
          </button>
        </div>
      )}

      {/* SHOW ASSIGNED */}
      {complaint.assignedTo && (
        <p className="mt-3 text-sm text-green-700">
          Assigned to: {complaint.assignedTo.name}
        </p>
      )}
    </div>
  );
};

export default AdminComplaintCard;
