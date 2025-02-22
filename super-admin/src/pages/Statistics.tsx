import { PiChartComponent } from "../components/dashboard/PiChart";
import { VisitorsComponent } from "../components/dashboard/Visitors";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import axios from "axios";

export const Statistics = () => {

  interface StatisticsData {
    total_partnership: number;
    active_partnership: number;
    inactive_partnership: number;
    total_package: number;
  }

  const [statistics, setStatistics] = useState<StatisticsData | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem("token"); // Get the token from localStorage
        const response = await axios.get("https://backend-api.hageregnabingo.com/api/super-admin/statistics", {
          headers: {
            Authorization: token, // Send the token in the header
          },
        });

        // Update the state with the fetched statistics
        setStatistics(response.data);
      } catch (error: any) {
        console.error("Error fetching statistics:", error);
        toast.error("Failed to fetch statistics. " + (error.response?.data?.message || error.message));

        // Optionally reset statistics to default values on error
        setStatistics({
          total_partnership: 0,
          active_partnership: 0,
          inactive_partnership: 0,
          total_package: 0,
        });
      }
    };

    fetchStatistics();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <ToastContainer />
      {/* VisitorsComponent showing the selected university's data */}
      <div className="flex gap-5 md:justify-evenly flex-col">
        <h1 className="text-xl p-2 pt-3">Welcome back <span className="text-blue-500 font-semibold text-2xl">Super Admin!</span></h1>
        <div className="flex w-full gap-5 md:flex-row flex-col">
          <div className="w-full">
              <VisitorsComponent visitors={statistics?.total_partnership || 0} label="Total Partners" />
          </div>
          <div className="w-full">
              <VisitorsComponent visitors={statistics?.total_package || 0} label="Total Package" />
          </div>
        </div>
        <div className="w-full">
            <PiChartComponent activeUsers={statistics?.active_partnership || 0} deactivatedUsers={statistics?.inactive_partnership || 0} />
        </div>
      </div>
    </div>
  );
};
