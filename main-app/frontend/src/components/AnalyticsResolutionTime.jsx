import React from "react";

const times = Array.from({ length: 7 }, (_, i) => ({
  day: `Day ${i + 1}`,
  avgMinutes: Math.floor(Math.random() * 60 + 10),
}));

export default function AnalyticsResolutionTime() {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Violation Resolution Time</h2>
      <ul className="space-y-1 text-sm">
        {times.map((t, i) => (
          <li key={i} className="flex justify-between border-b pb-1">
            <span>{t.day}</span>
            <span className="text-blue-600">{t.avgMinutes} min</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
