import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./MainPage";
import AnalyticsPage from "./AnalyticsPage";
import ViolationDetailPage from "./ViolationDetailPage"; // или путь, где ты его сохранишь
import NavigationTabs from "./components/NavigationTabs";

export default function App() {
    return (
        <BrowserRouter>
            <NavigationTabs />
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/violation/:id" element={<ViolationDetailPage />} />

            </Routes>
        </BrowserRouter>
    );
}
