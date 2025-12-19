import { useState } from "react";
import { useCreateComplaintMutation } from "../api/complaintApi";
import { toast } from "react-hot-toast";
import { Upload, X, Send } from "lucide-react"; 

export default function SubmitComplaint() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
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
    if (!title || !description || !category) {
      toast.error("Please fill all fields!");
      return;
    }

    try {
      await createComplaint({ title, description, category, image }).unwrap();
      toast.success("Complaint submitted successfully! 🚀");
      setTitle(""); setDescription(""); setCategory(""); setImage(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to submit");
    }
  };

  return (
    <div className="bg-base-200 border border-base-300 rounded-xl shadow-lg overflow-hidden">
      {/* Header with solid accent */}
      <div className="bg-primary p-4">
        <h2 className="text-xl font-bold text-primary-content">Submit a Complaint</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        
        {/* Title Field */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold opacity-80">Title</label>
          <input
            type="text"
            placeholder="Enter issue title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input input-bordered w-full bg-base-100 focus:outline-blue-500"
          />
        </div>

        {/* Category Selection */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold opacity-80">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="select select-bordered w-full bg-base-100 focus:outline-blue-500"
          >
            <option value="">Select Category</option>
            <option value="electrical">Electrical</option>
            <option value="plumbing">Plumbing</option>
            <option value="internet">Internet</option>
            <option value="cleanliness">Cleanliness</option>
          </select>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold opacity-80">Description</label>
          <textarea
            placeholder="Describe the problem in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea textarea-bordered w-full h-28 bg-base-100 focus:outline-blue-500"
          />
        </div>

        {/* Image Upload Area */}
        <div className="space-y-2">
          <label className="text-sm font-semibold opacity-80">Attachment (Optional)</label>
          {!image ? (
            <label className="flex items-center justify-center w-full h-12 border-2 border-dashed border-base-300 rounded-lg cursor-pointer hover:bg-base-100 transition-colors">
              <Upload size={18} className="mr-2 text-blue-500" />
              <span className="text-sm font-medium">Click to upload image</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          ) : (
            <div className="relative">
              <img src={image} className="w-full h-32 object-cover rounded-lg border border-base-300" alt="Preview" />
              <button 
                type="button"
                onClick={() => setImage(null)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-lg"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Submit Button - Forced Blue/Indigo */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn border-none w-full bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide uppercase transition-all active:scale-[0.98] disabled:bg-gray-400"
        >
          {isLoading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <div className="flex items-center gap-2">
              <Send size={18} />
              Submit Grievance
            </div>
          )}
        </button>
      </form>
    </div>
  );
}