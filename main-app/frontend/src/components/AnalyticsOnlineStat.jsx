import React from "react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#22c55e", "#ef4444"]; // green, red

// Mock summary data
const pieData = [
  { name: "Active", value: 28 },
  { name: "Inactive", value: 22 },
];

// Mock time series data
const timeData = Array.from({ length: 12 }, (_, i) => ({
  time: `${i + 1}:00`,
  active: Math.floor(Math.random() * 15 + 10),
  inactive: Math.floor(Math.random() * 15 + 5),
}));

export default function AnalyticsOnlineStat() {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Online Stat</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={pieData} dataKey="value" outerRadius={60} label>
              {pieData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={timeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="active" stroke="#22c55e" name="Active" />
            <Line type="monotone" dataKey="inactive" stroke="#ef4444" name="Inactive" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        Currently online: <strong>{pieData[0].value}</strong> — Offline: <strong>{pieData[1].value}</strong>
      </div>
    </div>
  );
}
