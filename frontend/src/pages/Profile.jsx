import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { User, Mail, Shield, ArrowLeft, Calendar } from "lucide-react";

export default function Profile() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base-100 text-base-content transition-colors duration-300">
      <Navbar />

      <div className="max-w-3xl mx-auto p-6 md:p-12">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm font-bold opacity-60 hover:opacity-100 mb-8 transition-all"
        >
          <ArrowLeft size={16} /> BACK TO DASHBOARD
        </button>

        <div className="bg-base-200 rounded-3xl shadow-2xl border border-base-300 overflow-hidden">
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-end px-8 pb-4">
            <div className="w-24 h-24 rounded-2xl bg-base-100 border-4 border-base-200 flex items-center justify-center shadow-lg -mb-12">
              <User size={48} className="text-blue-600" />
            </div>
          </div>

          {/* User Details Section */}
          <div className="pt-16 p-8 space-y-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight">{user?.name}</h1>
              <p className="text-sm font-bold text-blue-500 uppercase tracking-widest mt-1">
                {user?.role} Account
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email Card */}
              <div className="bg-base-100 p-5 rounded-2xl border border-base-300 flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black opacity-40 uppercase">Email Address</p>
                  <p className="font-bold truncate">{user?.email}</p>
                </div>
              </div>

              {/* Role Card */}
              <div className="bg-base-100 p-5 rounded-2xl border border-base-300 flex items-center gap-4">
                <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black opacity-40 uppercase">Access Level</p>
                  <p className="font-bold capitalize">{user?.role}</p>
                </div>
              </div>

              {/* User ID Card */}
              
            </div>

            {/* Account Management Actions */}
            
          </div>
        </div>

        {/* Informational Footer */}
        <p className="text-center mt-8 text-xs opacity-40 font-medium">
          If your details are incorrect, please contact the Hostel Admin Office.
        </p>
      </div>
    </div>
  );
}