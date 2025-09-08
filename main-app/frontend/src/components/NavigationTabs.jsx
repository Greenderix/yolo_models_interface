import { Link, useLocation } from "react-router-dom";

function NavigationTabs() {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex justify-center my-6">
            <div className="inline-flex border border-gray-300 rounded overflow-hidden">
                <Link
                    to="/"
                    className={`px-6 py-2 text-sm font-medium ${
                        isActive("/") ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                >
                    Dispatcher Interface
                </Link>
                <Link
                    to="/analytics"
                    className={`px-6 py-2 text-sm font-medium ${
                        isActive("/analytics") ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                >
                    Dashboards
                </Link>
            </div>
        </div>
    );
}
export default NavigationTabs;
