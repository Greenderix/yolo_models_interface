import React from "react";

const offenders = [
  { name: "Driver 5", carId: "CAR105", count: 4 },
  { name: "Driver 12", carId: "CAR112", count: 3 },
  { name: "Driver 22", carId: "CAR122", count: 3 },
  { name: "Driver 31", carId: "CAR131", count: 2 },
];

export default function AnalyticsRepeatOffenders() {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Repeat Offenders</h2>
      <ul className="space-y-2">
        {offenders.map((d, i) => (
          <li key={i} className="flex justify-between text-sm border-b pb-1">
            <span>{d.name} ({d.carId})</span>
            <span className="text-red-600 font-medium">{d.count} violations</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
