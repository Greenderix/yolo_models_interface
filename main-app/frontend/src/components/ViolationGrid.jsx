import React, { useState } from "react";
import ViolationDetailModal from "./ViolationDetailModal";
import {useNavigate} from "react-router-dom";

export default function ViolationGrid({ alerts, visibleCount, setVisibleCount, showMap }) {
    const navigate = useNavigate();

    const [selectedViolation, setSelectedViolation] = useState(null);
    const loadStep = 6;
    const visibleAlerts = alerts.slice(0, visibleCount);
    const hasMore = visibleCount < alerts.length;

    const generateMapLink = (location) =>
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    const getIcon = (v) =>
        v === "seatbelt" ? "🚌" : v === "smoking" ? "🚬" : v === "phone" ? "📱" : "⚠";
    const getTicketLabel = (prefix, i, v) =>
        `${prefix}-${v.slice(0, 3).toUpperCase()}${i}`;

    return (
        <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-xl font-semibold mb-4">Violations</div>
            <div className="text-sm text-gray-600 mb-2">Total tickets: {alerts.length}</div>
            <div className={`grid gap-4 ${showMap ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                {visibleAlerts.map((alert) => (
                    <div
                        key={alert.id}
                        onClick={() => navigate(`/violation/${alert.id}`)}
                        className="border-l-4 border-red-500 bg-white p-4 rounded shadow cursor-pointer hover:shadow-md transition"
                    >
                        <div className="font-semibold text-lg flex items-center gap-2">
                            <span>{getIcon(alert.violation)}</span>
                            <span>{getTicketLabel("TCK", alert.id, alert.violation)}</span>
                        </div>
                        <div className="text-sm text-gray-600"><strong>Violation:</strong> {alert.violation}</div>
                        <div className="text-sm text-gray-600"><strong>Confidence:</strong> {alert.confidence}</div>
                        <div className="text-sm text-gray-600"><strong>Passengers:</strong> {alert.passengers}</div>
                        <div className="text-sm text-gray-600 mt-2"><strong>Driver:</strong> {alert.driver} | <strong>Car:</strong> {alert.car}</div>
                        <div className="text-sm text-gray-600"><strong>Location:</strong> <a href={generateMapLink(alert.location)} target="_blank" className="text-blue-600 underline">{alert.location}</a></div>
                        <div className="text-sm text-gray-600"><strong>Time:</strong> {alert.time}</div>
                    </div>
                ))}
            </div>
            {hasMore && (
                <div className="text-center mt-6">
                    <button onClick={() => setVisibleCount(prev => prev + loadStep)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Load More</button>
                </div>
            )}
            {selectedViolation && (
                <ViolationDetailModal
                    violation={selectedViolation}
                    onClose={() => setSelectedViolation(null)}
                />
            )}
        </div>
    );
}
