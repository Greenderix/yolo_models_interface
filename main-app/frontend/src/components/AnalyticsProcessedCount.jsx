import React from "react";

// Mock stats
const total = 50;
const processed = 36;
const pending = total - processed;
const percent = Math.round((processed / total) * 100);

export default function AnalyticsProcessedCount() {
    return (
        <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Processed Violations</h2>
            <div className="text-sm text-gray-700 mb-2">
                <strong>Total:</strong> {total}
            </div>
            <div className="text-sm text-green-600 mb-2">
                <strong>Processed:</strong> {processed}
            </div>
            <div className="text-sm text-red-500 mb-4">
                <strong>Pending:</strong> {pending}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                    className="bg-blue-600 h-4 transition-all"
                    style={{ width: `${percent}%` }}
                />
            </div>
            <div className="text-right text-sm text-gray-500 mt-1">
                {percent}% processed
            </div>
        </div>
    );
}
