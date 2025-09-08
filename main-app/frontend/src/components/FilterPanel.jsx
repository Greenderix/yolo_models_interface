import React, { useState } from "react";

export default function FilterPanel({
                                        search,
                                        setSearch,
                                        violationFilter,
                                        setViolationFilter,
                                        showMap,
                                        setShowMap,
                                        onFilter,
                                    }) {
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [minSpeed, setMinSpeed] = useState("");
    const [maxSpeed, setMaxSpeed] = useState("");

    const handleFilter = () => {
        onFilter({
            query: search,
            violation: violationFilter,
            start_time: startTime || undefined,
            end_time: endTime || undefined,
            min_speed: minSpeed || undefined,
            max_speed: maxSpeed || undefined,
        });
    };

    const handleReset = () => {
        setSearch("");
        setViolationFilter("all");
        setStartTime("");
        setEndTime("");
        setMinSpeed("");
        setMaxSpeed("");
        onFilter({});
    };

    return (
        <div className="bg-white p-4 rounded shadow mb-4 space-y-4 text-sm text-gray-700">
            <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block font-semibold mb-1">Search by Ticket / Driver / Plate</label>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border px-3 py-2 rounded w-full"
                        placeholder="ID, name, or plate"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1">Violation Type</label>
                    <select
                        value={violationFilter}
                        onChange={(e) => setViolationFilter(e.target.value)}
                        className="border px-3 py-2 rounded w-full"
                    >
                        <option value="all">All</option>
                        <option value="seatbelt">Seatbelt</option>
                        <option value="smoking">Smoking</option>
                        <option value="phone">Phone usage</option>
                    </select>
                </div>
                <div>
                    <label className="block font-semibold mb-1">Start Time</label>
                    <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="border px-3 py-2 rounded w-full"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1">End Time</label>
                    <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="border px-3 py-2 rounded w-full"
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4 items-end">
                <div>
                    <label className="block font-semibold mb-1">Min Speed</label>
                    <input
                        type="number"
                        value={minSpeed}
                        onChange={(e) => setMinSpeed(e.target.value)}
                        className="border px-3 py-2 rounded w-full"
                        placeholder="e.g. 30"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1">Max Speed</label>
                    <input
                        type="number"
                        value={maxSpeed}
                        onChange={(e) => setMaxSpeed(e.target.value)}
                        className="border px-3 py-2 rounded w-full"
                        placeholder="e.g. 120"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 w-full"
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleFilter}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
                    >
                        Filter
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <label className="font-semibold">Show Map:</label>
                    <input
                        type="checkbox"
                        checked={showMap}
                        onChange={() => setShowMap(!showMap)}
                        className="w-5 h-5"
                    />
                </div>
            </div>
        </div>
    );
}
