// Helper function for status badge styling
const getStatusClasses = (status) => {
  switch (status) {
    case "Open":
      return "bg-red-100 text-red-800 border-red-200";
    case "In Progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Resolved":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function ComplaintList({ complaints = [], isLoading }) {
  if (isLoading) return <p className="text-center text-lg py-6">Loading complaints...</p>;

  if (!complaints.length)
    return <p className="text-center text-gray-500 text-lg py-6">No complaints found in this category.</p>;

  return (
    <div className="space-y-6">
      {complaints.map((c) => (
        <div
          key={c._id}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300"
        >
          {/* Complaint Header */}
          <div className="flex justify-between items-start mb-3 border-b pb-3">
            <h3 className="text-xl font-bold text-gray-800">{c.title}</h3>
            <span 
                className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getStatusClasses(c.status)}`}
            >
                {c.status}
            </span>
          </div>

          {/* Core Info */}
          <div className="mb-4 text-sm space-y-1">
            <p>
              <strong className="text-gray-700">Category:</strong> {c.category}
            </p>
            <p>
              <strong className="text-gray-700">Assigned Warden:</strong> {c.warden?.name || "Pending Assignment"}
            </p>
          </div>
          
          {/* --- TIMELINE INTEGRATION --- */}
          <div className="pt-3 border-t border-gray-100 mt-4 space-y-1">
            <h4 className="font-bold text-sm text-gray-700 mb-1">Process Timeline:</h4>
            
            <p className="text-xs text-gray-600">
                <span className="font-semibold">Filed:</span> {new Date(c.createdAt).toLocaleString()}
            </p>

            {c.assignedAt && (
                <p className="text-xs text-blue-600">
                    <span className="font-semibold">Assigned:</span> {new Date(c.assignedAt).toLocaleString()}
                </p>
            )}

            {c.resolvedAt && (
                <p className="text-xs text-green-600 font-bold">
                    <span className="font-semibold">Resolved:</span> {new Date(c.resolvedAt).toLocaleString()}
                </p>
            )}
          </div>
          {/* --- END TIMELINE INTEGRATION --- */}


          {/* COMMENTS (VISIBLE TO STUDENT) */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <h4 className="font-bold text-sm text-gray-700 mb-2">
              Resolution History
            </h4>

            <ul className="text-sm text-gray-600 space-y-2 bg-gray-50 p-3 rounded-lg border">
              {c.comments?.length ? (
                c.comments.map((com, i) => (
                  <li key={i} className="border-b pb-1 last:border-b-0 last:pb-0">
                    <p>
                        • <b>{com.user?.name}:</b> {com.text}
                    </p>
                    <span className="text-xs text-gray-400">
                        {new Date(com.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-gray-400 italic text-xs">No comments or updates yet.</li>
              )}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}