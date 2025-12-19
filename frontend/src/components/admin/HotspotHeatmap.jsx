import { useGetHotspotsQuery } from "../../api/adminApi";

const Heatmap = () => {
  const { data: hotspots = [], isLoading } = useGetHotspotsQuery();

  const blocks = [...new Set(hotspots.map(h => h._id.block))];
  const categories = ["plumbing", "electricity", "cleanliness", "internet", "security", "other"];

  // Helper to get color intensity
  const getIntensity = (count) => {
    if (count === 0) return "bg-base-200 opacity-20";
    if (count < 3) return "bg-orange-200 text-orange-800";
    if (count < 6) return "bg-orange-400 text-white";
    return "bg-red-600 text-white animate-pulse"; // "Hot" spot
  };

  if (isLoading) return <span className="loading loading-bars"></span>;

  return (
    <div className="bg-base-200 p-8 rounded-[2rem] border border-base-300 shadow-xl">
      <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
        <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
        Hostel Trouble Hotspots
      </h2>

      <div className="overflow-x-auto">
        <table className="table-fixed w-full border-separate border-spacing-2">
          <thead>
            <tr>
              <th className="w-24"></th>
              {categories.map(cat => (
                <th key={cat} className="text-[10px] uppercase font-black opacity-40">{cat}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {blocks.map(block => (
              <tr key={block}>
                <td className="font-black text-lg">Block {block}</td>
                {categories.map(cat => {
                  const data = hotspots.find(h => h._id.block === block && h._id.category === cat);
                  const count = data ? data.count : 0;
                  return (
                    <td 
                      key={cat} 
                      className={`h-16 rounded-2xl text-center font-black transition-all hover:scale-105 cursor-help ${getIntensity(count)}`}
                      title={`${count} complaints in ${cat}`}
                    >
                      {count > 0 ? count : ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex gap-4 text-[10px] font-bold opacity-50 uppercase">
          <div className="flex items-center gap-1"><span className="w-3 h-3 bg-base-300 rounded"></span> Quiet</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-400 rounded"></span> Active</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-600 rounded"></span> Critical Hotspot</div>
      </div>
    </div>
  );
};
export default Heatmap;