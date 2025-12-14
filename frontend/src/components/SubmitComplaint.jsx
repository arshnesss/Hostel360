import { useState } from "react";
import { useCreateComplaintMutation } from "../api/complaintApi";
import { toast } from "react-hot-toast";

export default function SubmitComplaint() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const [createComplaint, { isLoading }] = useCreateComplaintMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !category) {
      toast.error("Please fill all fields!");
      return;
    }

    try {
      await createComplaint({
        title,
        description,
        category,
      }).unwrap();

      toast.success("Complaint submitted successfully! 🚀");

      setTitle("");
      setDescription("");
      setCategory("");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to submit complaint");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md mb-6"
    >
      <h2 className="text-xl font-bold mb-4">Submit a Complaint</h2>

      {/* Title */}
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border p-2 mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {/* Category */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full border p-2 mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="">Select Category</option>
        <option value="electrical">Electrical</option>
        <option value="plumbing">Plumbing</option>
        <option value="cleanliness">Cleanliness</option>
        <option value="internet">Internet</option>
        <option value="security">Security</option>
        <option value="other">Other</option>
      </select>

      {/* Description */}
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border p-2 mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? "Submitting..." : "Submit Complaint"}
      </button>
    </form>
  );
}
