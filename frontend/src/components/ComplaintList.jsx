export default function ComplaintList({ complaints = [], isLoading }) {
  if (isLoading) return <p>Loading complaints...</p>;

  if (!complaints.length)
    return <p className="text-center text-gray-500">No complaints found.</p>;

  return (
    <div className="space-y-4">
      {complaints.map((c) => (
        <div
          key={c._id}
          className="bg-white p-4 rounded-xl shadow"
        >
          <p><strong>Title:</strong> {c.title}</p>
          <p><strong>Category:</strong> {c.category}</p>
          <p><strong>Status:</strong> {c.status}</p>

          {/* COMMENTS (VISIBLE TO STUDENT) */}
          <div className="mt-3">
            <h4 className="font-semibold text-sm">
              Warden / Admin Comments
            </h4>

            <ul className="text-sm text-gray-600 space-y-1 mt-1">
              {c.comments?.length ? (
                c.comments.map((com, i) => (
                  <li key={i}>
                    • <b>{com.user?.name}:</b> {com.text}
                  </li>
                ))
              ) : (
                <li>No comments yet.</li>
              )}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
