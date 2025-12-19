import { useState } from "react";
import { 
  useGetAllStudentsQuery, 
  useGetAllWardensQuery, 
  useCreateWardenMutation, 
  useDeleteWardenMutation,
  useDeleteStudentMutation // Assuming this exists in your API slice
} from "../../api/adminApi";
import { toast } from "react-hot-toast";
import { UserPlus, Trash2, Users, ShieldCheck, X, UserMinus } from "lucide-react";

export default function UserManagement() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", block: "" });

  const { data: students = [] } = useGetAllStudentsQuery();
  const { data: wardens = [] } = useGetAllWardensQuery();
  
  const [createWarden, { isLoading: isCreating }] = useCreateWardenMutation();
  const [deleteWarden] = useDeleteWardenMutation();
  const [deleteStudent] = useDeleteStudentMutation();

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createWarden(formData).unwrap();
      toast.success("Warden created successfully! 👮");
      setFormData({ name: "", email: "", password: "", block: "" });
      setShowModal(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create warden");
    }
  };

  const handleDeleteWarden = async (id) => {
    if (window.confirm("Remove this warden from the system?")) {
      try {
        await deleteWarden(id).unwrap();
        toast.success("Warden removed");
      } catch (err) {
        toast.error("Deletion failed");
      }
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm("Permanently delete this student record?")) {
      try {
        await deleteStudent(id).unwrap();
        toast.success("Student deleted");
      } catch (err) {
        toast.error("Deletion failed");
      }
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn relative">
      
      {/* --- CREATE WARDEN MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-md animate-fadeIn" 
            onClick={() => setShowModal(false)}
          ></div>

          <div className="relative bg-base-100 w-full max-w-md p-8 rounded-3xl shadow-2xl border border-base-300 animate-zoomIn">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-base-200 rounded-full transition-colors"
            >
              <X size={20} className="opacity-50" />
            </button>

            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-indigo-600">
              <UserPlus /> Add New Warden
            </h3>

            <form onSubmit={handleCreate} className="space-y-5">
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Full Name</span></label>
                <input type="text" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input input-bordered w-full bg-base-200 focus:border-indigo-500" required />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Email Address</span></label>
                <input type="email" placeholder="warden@hostel.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input input-bordered w-full bg-base-200 focus:border-indigo-500" required />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Password</span></label>
                <input type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="input input-bordered w-full bg-base-200 focus:border-indigo-500" required />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Assigned Block</span></label>
                <input type="text" placeholder="e.g. Block A" value={formData.block} onChange={(e) => setFormData({...formData, block: e.target.value})} className="input input-bordered w-full bg-base-200 focus:border-indigo-500" required />
              </div>

              <button disabled={isCreating} className="btn bg-indigo-600 hover:bg-indigo-700 text-white w-full border-none shadow-lg mt-2">
                {isCreating ? <span className="loading loading-spinner"></span> : "Confirm & Register"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-indigo-50 dark:bg-indigo-950/20 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-900/30">
        <div>
            <h2 className="text-2xl font-bold tracking-tight text-indigo-900 dark:text-indigo-200">User Directory</h2>
            <p className="text-sm opacity-70">Manage students and personnel access</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="btn bg-indigo-600 hover:bg-indigo-700 text-white border-none px-8 font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
        >
          <UserPlus size={18} className="mr-2" /> Add New Warden
        </button>
      </div>

      {/* --- LISTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Warden List */}
        <div className="bg-base-200 p-6 rounded-3xl border border-base-300 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-emerald-600">
            <ShieldCheck /> Active Wardens ({wardens.length})
          </h3>
          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
            {wardens.map(w => (
              <div key={w._id} className="bg-base-100 p-4 rounded-2xl flex justify-between items-center border border-base-300 hover:border-emerald-500/50 transition-all group">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold">
                        {w.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{w.name}</p>
                      <p className="text-xs opacity-60">Block: {w.block || 'N/A'}</p>
                    </div>
                </div>
                <button onClick={() => handleDeleteWarden(w._id)} className="btn btn-ghost btn-circle btn-sm text-error opacity-0 group-hover:opacity-100 transition-opacity" title="Delete Warden">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Student List */}
        <div className="bg-base-200 p-6 rounded-3xl border border-base-300 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-blue-600">
            <Users /> Registered Students ({students.length})
          </h3>
          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
            {students.map(s => (
              <div key={s._id} className="bg-base-100 p-4 rounded-2xl border border-base-300 flex justify-between items-center hover:border-blue-500/50 transition-all group">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{s.name}</p>
                      <p className="text-xs opacity-60 italic">{s.email}</p>
                    </div>
                </div>
                <button onClick={() => handleDeleteStudent(s._id)} className="btn btn-ghost btn-circle btn-sm text-error opacity-0 group-hover:opacity-100 transition-opacity" title="Delete Student">
                   <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}