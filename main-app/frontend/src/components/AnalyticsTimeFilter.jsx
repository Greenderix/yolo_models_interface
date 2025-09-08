import React, { useState } from "react";

export default function AnalyticsTimeFilter() {
  const [range, setRange] = useState("24h");

  return (
    <div className="flex items-center gap-4">
      <label className="font-semibold">Time Range:</label>
      <select
        value={range}
        onChange={(e) => setRange(e.target.value)}
        className="border px-3 py-1 rounded"
      >
        <option value="1h">Last 1 Hour</option>
        <option value="24h">Last 24 Hours</option>
        <option value="7d">Last 7 Days</option>
        <option value="30d">Last 30 Days</option>
      </select>
    </div>
  );
}
