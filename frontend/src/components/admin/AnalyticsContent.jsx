import React from 'react';
import { useGetAnalyticsQuery } from '../../api/adminApi'; 
import { formatHoursToDays } from '../../utils/formatters'; 
import { 
    PieChart, Pie, BarChart, Bar, 
    XAxis, YAxis, Tooltip, ResponsiveContainer, 
    Cell, Legend 
} from 'recharts';
import { Clock, List, LayoutGrid, BarChart3, TrendingUp } from 'lucide-react'; 

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899'];

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (value === 0) return null;
    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
            {value}
        </text>
    );
};

const AnalyticsContent = () => {
  const { data: analyticsData, isLoading, error } = useGetAnalyticsQuery();

  if (isLoading) return <div className="flex justify-center p-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (error) return <div className="alert alert-error m-4">Error loading analytics.</div>;

  const { categoryStats = [], blockStats = [], avgResolutionTime = 0 } = analyticsData || {};
  const categoryChartData = categoryStats.map((item, index) => ({ name: item._id || 'Uncategorized', value: item.count, color: COLORS[index % COLORS.length] }));
  const blockChartData = blockStats.map((item, index) => ({ name: item._id || 'N/A Block', value: item.count, fill: COLORS[index % COLORS.length] }));
  const totalComplaints = categoryChartData.reduce((sum, item) => sum + item.value, 0);

  // Common Tooltip Style
  const tooltipStyle = {
    contentStyle: { 
        backgroundColor: 'hsl(var(--b1))', 
        border: '1px solid hsl(var(--bc) / 0.1)', // ➡️ This makes the border disappear/blend
        borderRadius: '10px',
        color: 'hsl(var(--bc))',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
    },
    itemStyle: { color: 'hsl(var(--bc))' },
    labelStyle: { color: 'hsl(var(--bc))', fontWeight: 'bold' }
  };

  return (
    <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 transition-all duration-300"> 
      
      {/* STATS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border-b border-base-300">
        <div className="stat-card border-l-4 border-l-blue-600 bg-base-200">
          <Clock className="text-blue-600 w-6 h-6" /> 
          <div className="font-bold text-base-content/50 text-xs uppercase tracking-widest">Avg. Resolution</div>
          <div className="text-2xl font-black text-base-content">{formatHoursToDays(avgResolutionTime)}</div>
        </div>

        <div className="stat-card border-l-4 border-l-green-600 bg-base-200">
          <List className="text-green-600 w-6 h-6" />
          <div className="font-bold text-base-content/50 text-xs uppercase tracking-widest">Total Filed</div>
          <div className="text-2xl font-black text-base-content">{totalComplaints}</div>
        </div>

        <div className="stat-card border-l-4 border-l-purple-600 bg-base-200">
          <TrendingUp className="text-purple-600 w-6 h-6" />
          <div className="font-bold text-base-content/50 text-xs uppercase tracking-widest">Categories</div>
          <div className="text-2xl font-black text-base-content">{categoryStats.length}</div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
        <div className="card bg-base-200 p-6 rounded-2xl border border-base-300 shadow-inner">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="text-blue-600" /> Complaints Per Category
          </h3>
          <div className='h-64'>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={CustomPieLabel} labelLine={false}>
                  {categoryChartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card bg-base-200 p-6 rounded-2xl border border-base-300 shadow-inner">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <LayoutGrid className="text-green-600" /> Complaints Per Block
          </h3>
          <div className='h-64'>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={blockChartData}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'currentColor', fontSize: 10 }} 
                  axisLine={{ stroke: 'hsl(var(--bc) / 0.1)' }} // ➡️ Softens the axis lines
                  tickLine={{ stroke: 'hsl(var(--bc) / 0.1)' }}
                />
                <YAxis 
                  tick={{ fill: 'currentColor', fontSize: 10 }} 
                  axisLine={{ stroke: 'hsl(var(--bc) / 0.1)' }}
                  tickLine={{ stroke: 'hsl(var(--bc) / 0.1)' }}
                />
                <Tooltip {...tooltipStyle} cursor={{ fill: 'hsl(var(--bc) / 0.05)' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {blockChartData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
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