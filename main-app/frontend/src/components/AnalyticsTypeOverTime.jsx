import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const data = Array.from({ length: 10 }, (_, i) => ({
  time: `Day ${i + 1}`,
  seatbelt: Math.floor(Math.random() * 10),
  smoking: Math.floor(Math.random() * 10),
  phone: Math.floor(Math.random() * 10),
}));

export default function AnalyticsTypeOverTime() {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Violation Type Over Time</h2>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="seatbelt" stackId="1" stroke="#60a5fa" fill="#bfdbfe" />
          <Area type="monotone" dataKey="smoking" stackId="1" stroke="#f87171" fill="#fecaca" />
          <Area type="monotone" dataKey="phone" stackId="1" stroke="#34d399" fill="#bbf7d0" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
