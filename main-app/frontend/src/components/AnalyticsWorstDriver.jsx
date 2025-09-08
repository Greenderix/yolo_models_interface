import React from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

// Mock data
const worstDriver = {
    name: "Driver 22",
    carId: "CAR122",
    totalViolations: 9,
};

const timeData = Array.from({ length: 12 }, (_, i) => ({
    time: `${i + 8}:00`,
    count: Math.floor(Math.random() * 4 + 1),
}));

export default function AnalyticsWorstDriver() {
    return (
        <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Worst Driver</h2>
            <div className="mb-2 text-red-600 font-bold text-xl">
                🚨 {worstDriver.name} ({worstDriver.carId})
            </div>
            <div className="text-sm text-gray-600 mb-4">
                Total Violations: <strong>{worstDriver.totalViolations}</strong>
            </div>
            <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#f87171" name="Violations" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
