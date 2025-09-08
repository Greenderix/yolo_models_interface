import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const redIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const greenIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

export default function MapView({ points }) {
    return (
        <MapContainer center={[55.75, 37.62]} zoom={11} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
            <TileLayer
                attribution=""
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            <MarkerClusterGroup>
                {points.map((p) => (
                    <Marker
                        key={p.id}
                        position={[p.lat, p.lon]}
                        icon={p.active_violation ? redIcon : greenIcon}
                    >
                        {/*<Popup>*/}
                        {/*    <div>*/}
                        {/*        <strong>ID:</strong> {p.id}<br />*/}
                        {/*        <strong>Speed:</strong> {p.speed} km/h<br />*/}
                        {/*        <strong>Active Violation:</strong> {p.active_violation ? "Yes" : "No"}*/}
                        {/*    </div>*/}
                        {/*</Popup>*/}
                        <Popup longitude={p.lon} latitude={p.lat} onClose={() => setSelected(null)} anchor="top">
                            <div className="text-sm space-y-1">
                                <div><strong>ID:</strong> {p.id}</div>
                                <div><strong>Driver:</strong> {p.driver}</div>
                                <div><strong>Car:</strong> {p.carId}</div>
                                <div><strong>Speed:</strong> {p.speed} km/h</div>
                                <div><strong>Violation:</strong> {p.violation}</div>
                                <div><strong>Passengers:</strong> {p.passengers}</div>
                                <div><strong>Active Violation:</strong> {p.active_violation ? "Yes" : "No"}</div>

                                <a
                                    href={`/violation/${p.id}`}
                                    className="text-blue-600 underline block mt-1"
                                >
                                    View Violation →
                                </a>
                            </div>
                        </Popup>

                    </Marker>
                ))}
            </MarkerClusterGroup>
        </MapContainer>
    );
}
