import React, { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import FilterPanel from "./components/FilterPanel.jsx";
import ViolationGrid from "./components/ViolationGrid.jsx";
import MapView from "./Map.jsx";
import ViolationToast from "./components/ViolationToast";
import ViolationDetailModal from "./components/ViolationDetailModal";

export default function MainPage() {
    const [alerts, setAlerts] = useState([]);
    const [search, setSearch] = useState("");
    const [violationFilter, setViolationFilter] = useState("all");
    const [activeFilter, setActiveFilter] = useState("all");
    const [showMap, setShowMap] = useState(true);
    const [visibleCount, setVisibleCount] = useState(12);

    const [toasts, setToasts] = useState([]);
    const [selectedViolation, setSelectedViolation] = useState(null);

    const applyBackendFilter = (filters) => {
        const queryParams = new URLSearchParams();

        if (filters.query) queryParams.append("query", filters.query);
        if (filters.violation && filters.violation !== "all") queryParams.append("violation", filters.violation);
        if (filters.start_time) queryParams.append("start_time", filters.start_time);
        if (filters.end_time) queryParams.append("end_time", filters.end_time);
        if (filters.min_speed) queryParams.append("min_speed", filters.min_speed);
        if (filters.max_speed) queryParams.append("max_speed", filters.max_speed);

        fetch(`http://localhost:8001/violations?${queryParams.toString()}`)
            .then((res) => res.json())
            .then((data) => {
                const transformed = data.map((v) => ({
                    ...v,
                    violation: ["seatbelt", "smoking", "phone"][v.violation_type_id % 3],
                    driver: `Driver ${v.driver_id}`,
                    carId: `${v.car_number}`,
                }));
                setAlerts(transformed);
            })
            .catch(console.error);
    };

    useEffect(() => {
        fetch("http://localhost:8001/violations")
            .then((res) => res.json())
            .then((data) => {
                const transformed = data.map((v, i) => ({
                    ...v,
                    violation: ["seatbelt", "smoking", "phone"][v.violation_type_id % 3], // временно
                    driver: `Driver ${v.driver_id}`,
                    carId: `${v.car_number}`,
                }));
                setAlerts(transformed);
            })
            .catch(console.error);
    }, []);


    const filteredAlerts = alerts.filter((a) =>
        a.driver.toLowerCase().includes(search.toLowerCase()) &&
        (violationFilter === "all" || a.violation === violationFilter)
    );

    const filteredMapAlerts = alerts.filter((a) =>
        activeFilter === "all" || (activeFilter === "active" ? a.active_violation : !a.active_violation)
    );

    return (
        <>
            <div className="max-w-6xl mx-auto grid gap-6">
                <Header/>
                <FilterPanel
                    search={search}
                    setSearch={setSearch}
                    violationFilter={violationFilter}
                    setViolationFilter={setViolationFilter}
                    showMap={showMap}
                    setShowMap={setShowMap}
                    onFilter={applyBackendFilter}
                />


                {showMap && (
                    <div className="bg-white p-4 rounded-xl shadow sticky top-6">
                        <div className="mb-4">
                            <label className="font-semibold mr-2">Show on map:</label>
                            <select
                                className="px-3 py-1 border rounded-md"
                                value={activeFilter}
                                onChange={(e) => setActiveFilter(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="active">Violating</option>
                                <option value="inactive">Not Violating</option>
                            </select>
                        </div>
                        <div className="h-[400px]">
                            <MapView points={filteredMapAlerts}/>
                        </div>
                    </div>
                )}
                <div className={`grid gap-6 ${showMap ? "md:grid-cols-1" : "md:grid-cols-1"}`}>
                    <div>
                        <ViolationGrid
                            alerts={filteredAlerts}
                            visibleCount={visibleCount}
                            setVisibleCount={setVisibleCount}
                            showMap={showMap}
                        />
                    </div>
                </div>
            </div>

            {/* 🔔 Модалка для выбранного уведомления */}
            {selectedViolation && (
                <ViolationDetailModal
                    violation={selectedViolation}
                    onClose={() => setSelectedViolation(null)}
                />
            )}

            {/* 🛎️ Уведомления справа сверху */}
            <div className="fixed top-4 right-4 z-50">
                {toasts.map((toast) => (
                    <ViolationToast
                        key={toast.id}
                        alert={toast}
                        onClick={() => {
                            setSelectedViolation(toast);
                            setToasts((prev) => prev.filter((t) => t.id !== toast.id));
                        }}
                        onClose={() =>
                            setToasts((prev) => prev.filter((t) => t.id !== toast.id))
                        }
                    />
                ))}
            </div>
        </>
    );
}