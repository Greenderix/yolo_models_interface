import React from "react";

const mockData = [
  { day: "Mon", hours: [1, 2, 3, 5, 4, 2, 1, 0, 1, 3, 4, 6, 7, 3, 2, 4, 5, 3, 2, 1, 0, 1, 2, 1] },
  { day: "Tue", hours: [0, 1, 1, 3, 4, 5, 6, 7, 6, 4, 3, 2, 3, 4, 5, 6, 4, 3, 2, 1, 0, 1, 1, 0] },
  { day: "Wed", hours: [2, 3, 1, 0, 0, 1, 2, 3, 4, 6, 7, 8, 6, 4, 3, 2, 3, 4, 4, 3, 2, 2, 1, 1] },
  { day: "Thu", hours: [1, 0, 0, 1, 2, 3, 5, 6, 7, 8, 9, 6, 4, 2, 2, 1, 2, 3, 2, 1, 0, 0, 1, 2] },
  { day: "Fri", hours: [2, 2, 3, 4, 5, 7, 8, 8, 9, 10, 8, 6, 5, 4, 3, 3, 2, 1, 0, 0, 1, 2, 3, 2] },
  { day: "Sat", hours: [3, 4, 5, 6, 8, 7, 6, 4, 3, 3, 2, 1, 0, 0, 1, 2, 3, 5, 6, 7, 6, 4, 3, 2] },
  { day: "Sun", hours: [1, 1, 2, 3, 5, 6, 6, 5, 4, 4, 3, 2, 2, 3, 4, 5, 5, 4, 3, 3, 2, 2, 1, 0] }
];

export default function AnalyticsViolationHeatmap() {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Violation Heatmap by Hour</h2>
      <div className="overflow-x-auto">
        <table className="table-auto text-sm text-center border-collapse">
          <thead>
            <tr>
              <th className="px-2 py-1 border">Day</th>
              {Array.from({ length: 24 }, (_, i) => (
                <th key={i} className="px-1 py-1 border">{i}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockData.map((row) => (
              <tr key={row.day}>
                <td className="px-2 py-1 border font-semibold">{row.day}</td>
                {row.hours.map((v, i) => (
                  <td key={i} className="px-1 py-1 border"
                      style={{ backgroundColor: `rgba(59, 130, 246, ${v / 10})` }}>
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
