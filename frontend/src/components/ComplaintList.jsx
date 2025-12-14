import React from "react";

export default function ComplaintList({ complaints, isLoading }) {
  if (isLoading) return <p className="text-center my-4">Loading complaints...</p>;
  if (!complaints || complaints.length === 0)
    return <p className="text-center my-4">No complaints submitted yet.</p>;

  return (
    <div className="mt-6 grid gap-4">
      {complaints.map((c) => (
        <div key={c._id} className="p-4 bg-white rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-lg">{c.title}</h3>
            <span
              className={`px-2 py-1 rounded text-white ${
                c.status === "Active" ? "bg-green-500" : "bg-gray-500"
              }`}
            >
              {c.status}
            </span>
          </div>
          <p className="text-gray-700 mb-2">{c.description}</p>
          {c.images?.length > 0 && (
            <div className="flex gap-2 mt-2">
              {c.images.map((img, i) => (
                <img key={i} src={img} alt={`complaint-${i}`} className="w-20 h-20 object-cover rounded" />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
