import { useState } from "react";
import {
  useUpdateComplaintStatusMutation,
  useAddComplaintCommentMutation,
} from "../../api/complaintApi";


const STATUS_OPTIONS = ["Open", "In Progress", "Resolved"];

const ComplaintCard = ({ complaint }) => {
  const [status, setStatus] = useState(complaint.status);
  const [comment, setComment] = useState("");

  const [updateStatus, { isLoading: statusLoading }] =
    useUpdateComplaintStatusMutation();

  const [addComment, { isLoading: commentLoading }] =
    useAddComplaintCommentMutation();

  const handleStatusUpdate = async () => {
    await updateStatus({
      id: complaint._id,
      status,
    });
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    await addComment({
      id: complaint._id,
      comment,
    });
    setComment("");
  };

  return (
    <div className="border rounded p-4 shadow">
      <h2 className="font-semibold text-lg">
        {complaint.title}
      </h2>

      <p className="text-gray-700 mt-1">
        {complaint.description}
      </p>

      {/* Student info (READ ONLY) */}
      <div className="mt-3 text-sm text-gray-600">
        <p><b>Student:</b> {complaint.student.name}</p>
        <p><b>Room:</b> {complaint.student.room}</p>
        <p><b>Contact:</b> {complaint.student.contact}</p>
      </div>

      {/* Status update */}
      <div className="mt-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <button
          onClick={handleStatusUpdate}
          disabled={statusLoading}
          className="ml-2 bg-blue-600 text-white px-3 py-1 rounded"
        >
          Update Status
        </button>
      </div>

      {/* Comment */}
      <div className="mt-4">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add execution note..."
          className="w-full border p-2 rounded"
          rows={2}
        />

        <button
          onClick={handleAddComment}
          disabled={commentLoading}
          className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
        >
          Add Comment
        </button>
      </div>

      {/* History */}
      <div className="mt-4">
        <h3 className="font-semibold text-sm">History</h3>
        <ul className="text-sm text-gray-600">
          {complaint.comments?.map((c, i) => (
            <li key={i}>• {c.text}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ComplaintCard;
