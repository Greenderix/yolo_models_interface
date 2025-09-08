import React, { useEffect, useState } from "react";
// import "./modal.css"; // optional for transitions

export default function ViolationDetailModal({ violation, onClose }) {
  const [detailed, setDetailed] = useState(null);
  const [history, setHistory] = useState([]);
  const [current, setCurrent] = useState(violation);
  const [transition, setTransition] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // useEffect(() => {
  //   const mockData = {
  //     coordinates: { lat: 55.75, lon: 37.62 },
  //     photoUrl: "https://via.placeholder.com/400x200.png?text=Violation+Photo",
  //     relatedViolations: Array.from({ length: 6 }, (_, i) => ({
  //       id: i + 100,
  //       time: `10:${(i + 10).toString().padStart(2, "0")}`,
  //       type: ["seatbelt", "smoking", "phone"][i % 3],
  //     })),
  //   };
  //   setDetailed(null);
  //   setTimeout(() => setDetailed(mockData), 400);
  // }, [current]);

  const getIcon = (v) =>
      v === "seatbelt" ? "🚌" : v === "smoking" ? "🚬" : v === "phone" ? "📱" : "⚠";

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // const handleOpenRelated = (v) => {
  //   setTransition(true);
  //   setTimeout(() => {
  //     setHistory((prev) => [...prev, current]);
  //     setCurrent({
  //       id: v.id,
  //       driver: current.driver,
  //       carId: current.carId,
  //       location: current.location,
  //       confidence: "82%",
  //       passengers: 2,
  //       time: v.time,
  //       violation: v.type,
  //     });
  //     setTransition(false);
  //   }, 300);
  // };

  // const handleBack = () => {
  //   const prev = history[history.length - 1];
  //   setHistory((prevHist) => prevHist.slice(0, -1));
  //   setCurrent(prev);
  // };

  return (
      <div
          onClick={handleBackdropClick}
          className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50"
      >
        <div
            className={`bg-white p-6 rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto transition-all duration-300 ${
                transition ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}
        >
          <h2 className="text-xl font-bold mb-4">
            Violation: {current.violation} {getIcon(current.violation)}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <p><strong>Driver:</strong> {current.driver}</p>
            <p><strong>Car ID:</strong> {current.carId}</p>
            <p><strong>Location:</strong> {current.location}</p>
            {detailed && (
                <p><strong>Coordinates:</strong> {detailed.coordinates.lat}, {detailed.coordinates.lon}</p>
            )}
            <p><strong>Confidence:</strong> {current.confidence}</p>
            <p><strong>Passengers:</strong> {current.passengers}</p>
            <p><strong>Time:</strong> {current.time}</p>
          </div>

          {detailed && (
              <>
                <div className="mt-4">
                  <img
                      src={detailed.photoUrl}
                      alt="Violation"
                      className="w-full max-h-[200px] object-cover rounded"
                  />
                </div>

                <div className="mt-6">
                  <h3 className="text-md font-semibold mb-2">Other violations by this driver:</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {detailed.relatedViolations.map((v) => (
                        <div
                            key={v.id}
                            className="bg-gray-100 rounded px-3 py-2 flex justify-between items-center hover:bg-gray-200 cursor-pointer"
                            onClick={() => handleOpenRelated(v)}
                        >
                          <span className="font-mono text-sm">TCK-{v.type.slice(0, 3).toUpperCase()}{v.id}</span>
                          <span className="text-sm text-gray-500">{v.time}</span>
                          <span className="text-lg">{getIcon(v.type)}</span>
                        </div>
                    ))}
                  </div>
                </div>
              </>
          )}

          <div className="mt-6 flex justify-between items-center">
            {history.length > 0 ? (
                <button
                    onClick={handleBack}
                    className="text-sm text-blue-600 underline"
                >
                  ← Back
                </button>
            ) : <span></span>}
            <button
                onClick={() => alert("Violation marked as processed")}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Process
            </button>
          </div>
        </div>
      </div>
  );
}
