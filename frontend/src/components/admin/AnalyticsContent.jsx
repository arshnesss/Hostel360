import React from 'react';
import { useGetAnalyticsQuery } from '../../api/adminApi'; 
import { formatHoursToDays } from '../../utils/formatters'; 
import { 
    PieChart, Pie, BarChart, Bar, 
    XAxis, YAxis, Tooltip, ResponsiveContainer, 
    Cell, Legend 
} from 'recharts';
import { Clock, List, LayoutGrid, BarChart3, TrendingUp } from 'lucide-react'; 

// Define colors for the charts (use common Tailwind colors)
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899']; // Blue, Green, Yellow, Red, Indigo, Pink

// Helper component for custom chart labels (shows value inside the pie slice)
const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if value > 0
    if (value === 0) return null;

    return (
        <text 
            x={x} 
            y={y} 
            fill="white" 
            textAnchor={x > cx ? 'start' : 'end'} 
            dominantBaseline="central" 
            className="text-xs font-bold"
        >
            {value}
        </text>
    );
};

const AnalyticsContent = () => {
  const { 
    data: analyticsData, 
    isLoading, 
    error 
  } = useGetAnalyticsQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <span className="loading loading-spinner loading-lg text-blue-600"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error my-4 p-4 rounded-lg shadow-md">
        <p className='text-sm'>Error loading analytics data. Please check the server connection and ensure you are logged in as an Admin.</p>
      </div>
    );
  }

  // Destructure data using the confirmed backend field names
  const { 
    categoryStats = [], 
    blockStats = [], 
    avgResolutionTime = 0 
  } = analyticsData || {};
  
  // Format data for Recharts (must have name and value keys)
  const categoryChartData = categoryStats.map((item, index) => ({
      name: item._id || 'Uncategorized',
      value: item.count,
      color: COLORS[index % COLORS.length]
  }));

  const blockChartData = blockStats.map((item, index) => ({
      name: item._id || 'N/A Block',
      value: item.count,
      fill: COLORS[index % COLORS.length]
  }));

  // Calculate total complaints for context
  const totalComplaints = categoryChartData.reduce((sum, item) => sum + item.value, 0);

  return (
    // Removed outer padding to rely on parent dashboard's padding
    <div className="bg-white rounded-xl shadow-lg"> 
      
      {/* STATS BAR: Compact 3-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 mb-4 border-b border-gray-100">
        
        <div className="stat-card">
          <Clock className="text-blue-600 w-6 h-6" /> 
          <div className="font-semibold text-gray-600 text-sm">Avg. Resolution Time</div>
          <div className="text-xl font-bold text-blue-800 mt-1">
            {formatHoursToDays(avgResolutionTime)} 
          </div>
        </div>

        <div className="stat-card">
          <List className="text-green-600 w-6 h-6" />
          <div className="font-semibold text-gray-600 text-sm">Total Complaints Filed</div>
          <div className="text-xl font-bold text-green-800 mt-1">
            {totalComplaints}
          </div>
        </div>

        <div className="stat-card">
          <TrendingUp className="text-purple-600 w-6 h-6" />
          <div className="font-semibold text-gray-600 text-sm">Categories Tracked</div>
          <div className="text-xl font-bold text-purple-800 mt-1">
            {categoryStats.length}
          </div>
        </div>
      </div>

      {/* CHARTS CONTAINER (Main Visualizations) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        
        {/* CHART 1: Complaints Per Category (Pie Chart) */}
        <div className="card bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-100 transition-all duration-300">
          <h3 className="card-title text-xl font-bold mb-3 text-gray-700 flex items-center">
            <BarChart3 className="w-5 h-5 mr-1 text-blue-600" /> 
            Complaints Per Category
          </h3>
          <div className='h-64'> {/* Compact Height */}
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80} // Compact Radius
                  labelLine={false}
                  label={CustomPieLabel} // Show value inside
                  animationDuration={1500}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '12px' }} /> 
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Complaints Per Block/Floor (Bar Chart) */}
        <div className="card bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-100 transition-all duration-300">
          <h3 className="card-title text-xl font-bold mb-3 text-gray-700 flex items-center">
            <LayoutGrid className="w-5 h-5 mr-1 text-green-600" /> 
            Complaints Per Block/Floor
          </h3>
          <div className='h-64'> {/* Compact Height */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={blockChartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" angle={-30} textAnchor="end" height={50} tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="value" name="Total Complaints" animationDuration={1500}>
                  {blockChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsContent;