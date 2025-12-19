import {
  useGetWardensQuery,
  useAssignComplaintMutation,
} from "../../api/adminApi";
import { useState } from "react";
import { UserCheck, ClipboardList, User } from "lucide-react";

const AdminComplaintCard = ({ complaint }) => {
  const { data: wardens } = useGetWardensQuery();
  const [assignComplaint, { isLoading: isAssigning }] = useAssignComplaintMutation();
  const [selectedWarden, setSelectedWarden] = useState("");

  const handleAssign = async () => {
    if (!selectedWarden) return;
    await assignComplaint({
      complaintId: complaint._id,
      wardenId: selectedWarden,
    });
  };

  return (
    <div className="bg-base-200 border border-base-300 rounded-2xl p-6 shadow-md transition-all hover:shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <h2 className="font-bold text-xl text-base-content">
          {complaint.title}
        </h2>
        <span className="badge badge-primary badge-outline font-bold uppercase text-[10px]">
          {complaint.category}
        </span>
      </div>

      <p className="text-base-content/70 text-sm mb-6 leading-relaxed">
        {complaint.description}
      </p>

      <div className="grid grid-cols-2 gap-4 text-xs mb-6 p-4 bg-base-100/50 rounded-xl border border-base-300">
        <div className="flex items-center gap-2">
          <ClipboardList size={14} className="opacity-50" />
          <p><span className="font-bold opacity-50 uppercase">Status:</span> {complaint.status}</p>
        </div>
        <div className="flex items-center gap-2">
          <User size={14} className="opacity-50" />
          <p><span className="font-bold opacity-50 uppercase">Student:</span> {complaint.student?.name}</p>
        </div>
      </div>

      {/* ASSIGN ONLY IF UNASSIGNED */}
      {!complaint.assignedTo ? (
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <select
            value={selectedWarden}
            onChange={(e) => setSelectedWarden(e.target.value)}
            className="select select-bordered select-sm bg-base-100 flex-1 text-sm border-base-300"
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
            disabled={!selectedWarden || isAssigning}
            className="btn btn-primary btn-sm px-6 font-bold uppercase tracking-widest text-[10px]"
          >
            {isAssigning ? <span className="loading loading-spinner loading-xs"></span> : "Assign"}
          </button>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2 text-sm text-success font-bold bg-success/10 p-3 rounded-lg border border-success/20">
          <UserCheck size={16} />
          Assigned to: {complaint.assignedTo.name}
        </div>
      )}
    </div>
  );
};

export default AdminComplaintCard;