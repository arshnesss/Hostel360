import { useState } from "react";
import { useCreateComplaintMutation } from "../api/complaintApi";
import { toast } from "react-hot-toast";
import { Upload, X, Send } from "lucide-react";

export default function SubmitComplaint() {
  // 1. Uniform State Management
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [block, setBlock] = useState("");
  const [image, setImage] = useState(null);

  const [createComplaint, { isLoading }] = useCreateComplaintMutation();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 2. Uniform Validation Logic
    if (!title || !description || !category || !block) {
      toast.error("Please fill all required fields!");
      return;
    }

    try {
      // Sending data including 'block' for the Heatmap analytics
      await createComplaint({ title, description, category, block, image }).unwrap();
      toast.success("Complaint submitted successfully! 🚀");
      
      // Reset all states to initial values
      setTitle(""); 
      setDescription(""); 
      setCategory(""); 
      setBlock("");
      setImage(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to submit");
    }
  };

  return (
    <div className="bg-base-200 border border-base-300 rounded-2xl shadow-lg overflow-hidden transition-all duration-300">
      
      {/* Uniform Header Component */}
      <div className="bg-blue-600 p-5">
        <h2 className="text-xl font-black text-white tracking-tight">Submit a Complaint</h2>
        <p className="text-blue-100 text-xs uppercase font-bold tracking-widest mt-1 opacity-80">
          New Grievance Entry
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* Title Field */}
        <div className="form-control w-full">
          <label className="label text-xs font-black uppercase opacity-60 ml-1">Title</label>
          <input
            type="text"
            placeholder="e.g., Water Leakage in Room 204"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input input-bordered w-full bg-base-100 focus:outline-blue-600 font-medium"
          />
        </div>

        {/* Unified Layout for Block and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label className="label text-xs font-black uppercase opacity-60 ml-1">Affected Block</label>
            <select 
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              className="select select-bordered bg-base-100 w-full focus:outline-blue-600 font-medium"
            >
              <option value="" disabled>Select Location</option>
              <option value="A">Block A</option>
              <option value="B">Block B</option>
              <option value="C">Block C</option>
              <option value="D">Block D</option>
              <option value="MESS">Mess / Canteen</option>
              <option value="GYM">Gym / Sports Complex</option>
            </select>
          </div>

          <div className="form-control w-full">
            <label className="label text-xs font-black uppercase opacity-60 ml-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="select select-bordered w-full bg-base-100 focus:outline-blue-600 font-medium"
            >
              <option value="">Select Type</option>
              <option value="electrical">Electricity</option>
              <option value="plumbing">Plumbing</option>
              <option value="internet">Internet</option>
              <option value="cleanliness">Cleanliness</option>
              <option value="security">Security</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="form-control w-full">
          <label className="label text-xs font-black uppercase opacity-60 ml-1">Detailed Description</label>
          <textarea
            placeholder="Provide as much detail as possible..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea textarea-bordered w-full h-32 bg-base-100 focus:outline-blue-600 font-medium"
          />
        </div>

        {/* Attachment Upload */}
        <div className="form-control w-full">
          <label className="label text-xs font-black uppercase opacity-60 ml-1">Evidence / Attachment (Optional)</label>
          {!image ? (
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-base-300 rounded-xl cursor-pointer hover:bg-base-100 hover:border-blue-400 transition-all">
              <Upload size={24} className="mb-2 text-blue-500" />
              <span className="text-xs font-bold opacity-60">Upload JPEG/PNG</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          ) : (
            <div className="relative group">
              <img src={image} className="w-full h-40 object-cover rounded-xl border border-base-300" alt="Preview" />
              <button 
                type="button"
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full shadow-xl hover:bg-red-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Uniform Blue Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn border-none w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-4 h-auto shadow-md transition-all active:scale-[0.97] disabled:bg-base-300"
        >
          {isLoading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <div className="flex items-center gap-3">
              <Send size={20} />
              Submit Grievance
            </div>
          )}
        </button>
      </form>
    </div>
  );
}