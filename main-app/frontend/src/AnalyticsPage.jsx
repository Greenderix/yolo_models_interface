import React from "react";

import AnalyticsTimeFilter from "./components/AnalyticsTimeFilter";
import AnalyticsOnlineStat from "./components/AnalyticsOnlineStat";
import AnalyticsTopViolations from "./components/AnalyticsTopViolations";
import AnalyticsBestDriver from "./components/AnalyticsBestDriver";
import AnalyticsWorstDriver from "./components/AnalyticsWorstDriver";
import AnalyticsProcessedCount from "./components/AnalyticsProcessedCount";

import AnalyticsViolationHeatmap from "./components/AnalyticsViolationHeatmap";
import AnalyticsTypeOverTime from "./components/AnalyticsTypeOverTime";
import AnalyticsRepeatOffenders from "./components/AnalyticsRepeatOffenders";
import AnalyticsResolutionTime from "./components/AnalyticsResolutionTime";
import AnalyticsAlertsByDay from "./components/AnalyticsAlertsByDay";

export default function AnalyticsPage() {
    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>

            <AnalyticsTimeFilter />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnalyticsOnlineStat />
                <AnalyticsTopViolations />
                <AnalyticsBestDriver />
                <AnalyticsWorstDriver />
                <AnalyticsProcessedCount />
                <AnalyticsViolationHeatmap />
                <AnalyticsTypeOverTime />
                <AnalyticsRepeatOffenders />
                <AnalyticsResolutionTime />
                <AnalyticsAlertsByDay />
            </div>
        </div>
    );
}
