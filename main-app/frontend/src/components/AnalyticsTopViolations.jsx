import React from "react";
import {
    PieChart, Pie, Cell,
    LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from "recharts";

const COLORS = ["#f87171", "#60a5fa", "#34d399"]; // red, blue, green

// Mock category counts
const pieData = [
    { name: "Seatbelt", value: 18 },
    { name: "Smoking", value: 12 },
    { name: "Phone", value: 20 },
];

// Mock time series by type
const timeData = Array.from({ length: 12 }, (_, i) => ({
    time: `${i + 1}:00`,
    seatbelt: Math.floor(Math.random() * 6),
    smoking: Math.floor(Math.random() * 6),
    phone: Math.floor(Math.random() * 6),
}));

export default function AnalyticsTopViolations() {
    return (
        <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Top Violations</h2>
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
                        <Line type="monotone" dataKey="seatbelt" stroke="#f87171" name="Seatbelt" />
                        <Line type="monotone" dataKey="smoking" stroke="#60a5fa" name="Smoking" />
                        <Line type="monotone" dataKey="phone" stroke="#34d399" name="Phone" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-gray-600 space-y-1">
                <div><strong>Seatbelt:</strong> {pieData[0].value}</div>
                <div><strong>Smoking:</strong> {pieData[1].value}</div>
                <div><strong>Phone:</strong> {pieData[2].value}</div>
            </div>
        </div>
    );
}
