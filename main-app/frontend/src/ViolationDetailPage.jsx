import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const generateMockViolations = (driver, excludeId) =>
    Array.from({ length: 13 }, (_, i) => {
        const id = 200 + i;
        return {
            id,
            driver,
            car: `CAR${id}`,
            violation: ["seatbelt", "smoking", "phone"][i % 3],
            confidence: `${80 + (i % 10)}%`,
            time: `10:${String((i + 10) % 60).padStart(2, "0")}`,
            location: `Street ${id}`,
            passengers: 1 + (i % 4),
            speed: Math.floor(Math.random() * 90),
            photo_url: `https://via.placeholder.com/140x100.png?text=TCK-${id}`,
        };
    }).filter((v) => v.id !== parseInt(excludeId));

export default function ViolationDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [violation, setViolation] = useState(null);
    const [related, setRelated] = useState([]);
    const [page, setPage] = useState(1);
    const perPage = 2;

    // useEffect(() => {
    //     const mockViolation = {
    //         id,
    //         driver: `Driver ${id}`,
    //         car: `CAR${100 + +id}`,
    //         violation: ["seatbelt", "smoking", "phone"][id % 3],
    //         confidence: "85%",
    //         time: `10:${String(+id % 60).padStart(2, "0")}`,
    //         location: `Street ${id}`,
    //         passengers: 2,
    //         speed: 48,
    //         photoUrl: `http://localhost:9000/violations/aa02679e-0bd5-4848-9008-c8f306141c10.jpg?AWSAccessKeyId=minioadmin&Signature=zVks%2B3PyOtGFvZekvx8Juq4BjP0%3D&Expires=1752905917`,
    //     };
    //     setViolation(mockViolation);
    //
    //     const others = generateMockViolations(mockViolation.driver, id);
    //     setRelated(others);
    //     setPage(1);
    // }, [id]);
    // useEffect(() => {
    //     const fetchViolation = async () => {
    //         try {
    //             const res = await fetch(`http://localhost:8001/violations/${id}`);
    //             const data = await res.json();
    //             setViolation(data.mainViolation);
    //             setRelated(data.relatedViolations || []);
    //             setPage(1);
    //         } catch (err) {
    //             console.error("Failed to fetch violation:", err);
    //         }
    //     };
    //
    //     fetchViolation();
    // }, [id]);


    useEffect(() => {
        const fetchViolation = async () => {
            try {
                const res = await fetch(`http://localhost:8001/violations/${id}`);
                const data = await res.json();

                setViolation(data.mainViolation);
                setRelated(data.relatedViolations);
                setPage(1);
            } catch (err) {
                console.error("Failed to fetch violation:", err);
            }
        };

        fetchViolation();
    }, [id]);


    const getIcon = (v) =>
        v === "seatbelt" ? "🚌" : v === "smoking" ? "🚬" : v === "phone" ? "📱" : "⚠";

    const paginated = related.slice((page - 1) * perPage, page * perPage);
    const totalPages = Math.ceil(related.length / perPage);

    function formatReadableTime(isoString) {
        const date = new Date(isoString);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        })}`;
    }


    const renderCard = (v, isMain = false) => (
        <div
            key={v.id}
            onClick={() => !isMain && navigate(`/violation/${v.id}`)}
            className={`p-4 rounded-xl shadow border-l-4 ${
                isMain ? "bg-blue-50 border-blue-500" : "bg-white border-gray-300 hover:bg-gray-50"
            } cursor-pointer`}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-lg flex items-center gap-2 text-blue-600">
                    {getIcon(v.violation)} <span className="font-mono">TCK-{v.id}</span>
                </div>
                <div className="text-sm text-gray-500">{formatReadableTime(v.time)}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-4">
                <div>
                    <p><strong>Driver:</strong> {v.driver}</p>
                    <p><strong>Car:</strong> {v.car}</p>
                    <p><strong>Violation:</strong> {v.violation}</p>
                </div>
                <div>
                    <p><strong>Confidence:</strong> {v.confidence}</p>
                    <p><strong>Passengers:</strong> {v.passengers}</p>
                    <p><strong>Speed:</strong> {v.speed} km/h</p>
                </div>
                <div className="col-span-2 space-y-1">
                    <p><strong>Location:</strong> {v.location}</p>
                    {v.lat && v.lon && (
                        <p>
                            <strong>Map:</strong>{" "}
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${v.lat},${v.lon}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                            >
                                View on map
                            </a>
                        </p>
                    )}
                </div>
            </div>

            <img
                src={v.photo_url}
                alt="violation"
                className="w-full max-h-[280px] object-cover rounded border"
            />
        </div>
    );



    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <button
                onClick={() => navigate(-1)}
                className="text-blue-600 underline text-sm"
            >
                ← Back
            </button>

            {violation && renderCard(violation, true)}

            <div className="grid gap-4">
                {paginated.map((v) => renderCard(v))}
            </div>

            <div className="flex justify-center gap-2 mt-4 text-sm">
                <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                >
                    &lt;
                </button>
                {[...Array(totalPages)].map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`px-3 py-1 rounded ${
                            page === i + 1
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 hover:bg-gray-200"
                        }`}
                    >
                        {i + 1}
                    </button>
                ))}
                <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                >
                    &gt;
                </button>
            </div>
        </div>
    );
}
