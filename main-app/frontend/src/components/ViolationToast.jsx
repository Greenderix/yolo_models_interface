import React, { useEffect } from "react";

export default function ViolationToast({ alert, onClick, onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 7000); // автоудаление
        return () => clearTimeout(timer);
    }, [onClose]);

    const getIcon = (v) =>
        v === "seatbelt" ? "🚌" : v === "smoking" ? "🚬" : v === "phone" ? "📱" : "⚠";

    return (
        <div
            onClick={() => {
                navigate(`/violation/${alert.id}`);
                onClose();
            }}
            className="bg-white rounded shadow-md p-4 border-l-4 border-blue-600 cursor-pointer hover:bg-gray-50 w-72 mb-4"
        >
            <div className="font-semibold text-blue-600 flex items-center gap-2">
                {getIcon(alert.violation)} New Violation
            </div>
            <div className="text-sm text-gray-600 mt-1">
                <strong>Driver:</strong> {alert.driver}<br />
                <strong>Type:</strong> {alert.violation}<br />
                <strong>Time:</strong> {alert.time}
            </div>
        </div>
    );
}
