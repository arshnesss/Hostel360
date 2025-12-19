import React from 'react';
import { Clock, CheckCircle, User, MessageSquare, Calendar } from 'lucide-react';

// Helper function for status badge styling - Updated for semantic colors
const getStatusClasses = (status) => {
  switch (status) {
    case "Open":
      return "badge-error text-white";
    case "In Progress":
      return "badge-info text-white";
    case "Resolved":
      return "badge-success text-white";
    default:
      return "badge-ghost";
  }
};

export default function ComplaintList({ complaints = [], isLoading }) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!complaints.length) {
    return (
      <div className="bg-base-200 rounded-xl p-10 text-center border border-dashed border-base-300">
        <p className="text-base-content/50 text-lg italic">No complaints found in this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {complaints.map((c) => (
        <div
          key={c._id}
          className="bg-base-200 rounded-2xl shadow-md border border-base-300 overflow-hidden hover:shadow-lg transition-all duration-300"
        >
          {/* 1. Header Section */}
          <div className="p-5 border-b border-base-300 bg-base-300/30 flex justify-between items-center">
            <h3 className="text-lg font-black tracking-tight">{c.title}</h3>
            <span className={`badge badge-md font-bold py-3 px-4 ${getStatusClasses(c.status)}`}>
              {c.status.toUpperCase()}
            </span>
          </div>

          <div className="p-6 space-y-6">
            {/* 2. Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-xs opacity-50 font-bold uppercase">Category</p>
                  <p className="font-semibold capitalize">{c.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-xs opacity-50 font-bold uppercase">Assigned Warden</p>
                  <p className="font-semibold">{c.warden?.name || "Pending..."}</p>
                </div>
              </div>
            </div>

            {/* 3. Visual Timeline Section */}
            <div className="space-y-3">
               <h4 className="text-xs font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                 <Calendar size={14} /> Process Timeline
               </h4>
               <div className="flex flex-col gap-3 ml-2 border-l-2 border-base-300 pl-4 py-1">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-base-content/20 shadow-sm"></div>
                    <p className="text-xs font-medium"><span className="opacity-50">Filed:</span> {new Date(c.createdAt).toLocaleString()}</p>
                  </div>

                  {c.assignedAt && (
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-info shadow-sm"></div>
                      <p className="text-xs font-medium text-info"><span className="opacity-70">Assigned:</span> {new Date(c.assignedAt).toLocaleString()}</p>
                    </div>
                  )}

                  {c.resolvedAt && (
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-success shadow-sm"></div>
                      <p className="text-xs font-bold text-success"><span className="opacity-70">Resolved:</span> {new Date(c.resolvedAt).toLocaleString()}</p>
                    </div>
                  )}
               </div>
            </div>

            {/* 4. Comments Section */}
            <div className="bg-base-100 rounded-xl p-4 border border-base-300">
              <h4 className="text-xs font-black uppercase tracking-widest opacity-40 mb-3 flex items-center gap-2">
                <MessageSquare size={14} /> Resolution Updates
              </h4>

              {c.comments?.length ? (
                <ul className="space-y-3">
                  {c.comments.map((com, i) => (
                    <li key={i} className="text-sm border-l-2 border-primary/30 pl-3">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-primary">{com.user?.name}</span>
                        <span className="text-[10px] opacity-40">{new Date(com.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="mt-1 opacity-80">{com.text}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs opacity-40 italic">Waiting for warden's response...</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}