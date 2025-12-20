import React from "react";
import { useGetAnalyticsQuery, useGetHotspotsQuery } from "../../api/adminApi";
import { formatHoursToDays } from "../../utils/formatters";

import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

import {
  Clock,
  List,
  LayoutGrid,
  BarChart3,
  TrendingUp,
} from "lucide-react";

/* ------------------ CONSTANTS ------------------ */

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#6366F1",
  "#EC4899",
];

/* ------------------ CUSTOM PIE LABEL ------------------ */

const CustomPieLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  value,
}) => {
  if (!value) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs font-bold"
    >
      {value}
    </text>
  );
};

/* ------------------ MAIN COMPONENT ------------------ */

const AnalyticsContent = () => {
  const {
    data: analyticsData,
    isLoading,
    error,
  } = useGetAnalyticsQuery();

  const { data: aggregatedHotspots = [] } = useGetHotspotsQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error m-4">Error loading analytics.</div>;
  }

  const {
    categoryStats = [],
    avgResolutionTime = 0,
  } = analyticsData || {};

  /* ------------------ DATA MAPPING ------------------ */

  // 1. Category Data (Keep this as is)
  const categoryChartData = categoryStats.map((item, index) => ({
    name: item._id || "Uncategorized",
    value: item.count,
    color: COLORS[index % COLORS.length],
  }));

  // 2. 🚨 FIX: Re-aggregate Block Data to prevent duplicate blocks
  const blockMap = aggregatedHotspots.reduce((acc, item) => {
    const blockName = `Block ${item._id.block}`;
    if (!acc[blockName]) {
      acc[blockName] = 0;
    }
    acc[blockName] += item.count;
    return acc;
  }, {});

  // Convert the map back to an array for Recharts
  const blockChartData = Object.keys(blockMap).map((blockName, index) => ({
    name: blockName,
    value: blockMap[blockName],
    fill: COLORS[index % COLORS.length],
  }));

  const totalComplaints = categoryChartData.reduce(
    (sum, item) => sum + item.value,
    0
  );
  /* ------------------ TOOLTIP STYLE ------------------ */

  const tooltipProps = {
    contentStyle: {
      backgroundColor: "hsl(var(--b1))",
      border: "1px solid hsl(var(--bc) / 0.1)",
      borderRadius: "10px",
      color: "hsl(var(--bc))",
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    },
    itemStyle: { color: "hsl(var(--bc))" },
    labelStyle: { fontWeight: "bold" },
  };

  /* ------------------ UI ------------------ */

  return (
    <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300">

      {/* STATS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border-b border-base-300">

        <div className="stat-card bg-base-200 border-l-4 border-l-blue-600">
          <Clock className="text-blue-600 w-6 h-6" />
          <div className="text-xs font-bold uppercase tracking-widest text-base-content/50">
            Avg. Resolution
          </div>
          <div className="text-2xl font-black">
            {formatHoursToDays(avgResolutionTime)}
          </div>
        </div>

        <div className="stat-card bg-base-200 border-l-4 border-l-green-600">
          <List className="text-green-600 w-6 h-6" />
          <div className="text-xs font-bold uppercase tracking-widest text-base-content/50">
            Total Filed
          </div>
          <div className="text-2xl font-black">{totalComplaints}</div>
        </div>

        <div className="stat-card bg-base-200 border-l-4 border-l-purple-600">
          <TrendingUp className="text-purple-600 w-6 h-6" />
          <div className="text-xs font-bold uppercase tracking-widest text-base-content/50">
            Categories
          </div>
          <div className="text-2xl font-black">{categoryStats.length}</div>
        </div>

      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">

        {/* PIE CHART */}
        <div className="card bg-base-200 p-6 rounded-2xl border border-base-300 shadow-inner">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="text-blue-600" />
            Complaints Per Category
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={CustomPieLabel}
                  labelLine={false}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...tooltipProps} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BAR CHART */}
        <div className="card bg-base-200 p-6 rounded-2xl border border-base-300 shadow-inner">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <LayoutGrid className="text-green-600" />
            Complaints Per Block
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={blockChartData}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  axisLine={{ stroke: "hsl(var(--bc) / 0.1)" }}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  axisLine={{ stroke: "hsl(var(--bc) / 0.1)" }}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--bc) / 0.05)" }}
                  {...tooltipProps}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {blockChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
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
