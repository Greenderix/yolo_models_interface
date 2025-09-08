import React from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

// Mock data
const bestDriver = {
    name: "Driver 7",
    carId: "CAR107",
    totalViolations: 1,
};

const timeData = Array.from({ length: 10 }, (_, i) => ({
    time: `${i + 10}:00`,
    count: Math.floor(Math.random() * 2),
}));

export default function AnalyticsBestDriver() {
    return (
        <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Best Driver</h2>
            <div className="mb-2 text-green-600 font-bold text-xl">
                🏆 {bestDriver.name} ({bestDriver.carId})
            </div>
            <div className="text-sm text-gray-600 mb-4">
                Total Violations: <strong>{bestDriver.totalViolations}</strong>
            </div>
            <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#4ade80" name="Violations" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
