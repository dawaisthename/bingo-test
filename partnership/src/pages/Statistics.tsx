import { useEffect, useState } from "react";
import axios from "axios"; // Axios for API requests
import { VisitorsComponent } from "../components/dashboard/Visitors";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TotalBalance } from "../components/dashboard/TotalBalance";

// Define an interface for the statistics data
interface StatisticsData {
  total_users: number;
  total_balance: number;
  total_sales: number;
  total_games: number;
}

export const Statistics = () => {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem("token"); // Get the token from localStorage
        const response = await axios.get(
          "https://backend-api.hageregnabingo.com/api/partnership/statistics",
          {
            headers: {
              Authorization: token,
            },
          }
        );

        // Update the state with the fetched statistics
        setStatistics(response.data);
      } catch (error: any) {
        console.error("Error fetching statistics:", error);
        toast.error(
          "Failed to fetch statistics. " +
            (error.response?.data?.message || error.message)
        );

        // Optionally reset statistics to default values on error
        setStatistics({
          total_users: 0,
          total_balance: 0,
          total_sales: 0,
          total_games: 0,
        });
      }
    };

    fetchStatistics();
  }, []);
  if (!statistics) {
    return <div>Loading...</div>;
  }
  return (
    <div className="flex relative flex-col gap-4">
      <ToastContainer /> {/* Toast container for displaying messages */}
      {statistics?.total_balance < 1000 ? (
        <div
          className="flex items-center absolute top-5 right-5 p-4 mb-4 text-sm text-red-700 bg-red-200 rounded-lg"
          role="alert"
        >
          <svg
            className="w-5 h-5 mr-2"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 2a1 1 0 011 1v7a1 1 0 11-2 0V3a1 1 0 011-1zm1 14a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
          <span className="font-medium">Warning: </span> <div> </div> Your
          package balance is low.
        </div>
      ) : (
        ""
      )}
      <div className="flex  gap-5 md:justify-evenly flex-col">
        <h1 className="text-xl p-2 pt-3">
          Welcome back{" "}
          <span className="text-blue-500 font-semibold text-2xl">Admin!</span>
        </h1>
        <div className="flex w-full gap-5 md:flex-row flex-col">
          <div className="w-full">
            <VisitorsComponent
              visitors={statistics?.total_users || 0}
              label="Total Users"
            />
          </div>
          <div className="w-full">
            <TotalBalance visitors={statistics?.total_balance || 0} label="Total Balance" />
          </div>
        </div>

        <div className="flex w-full gap-5 md:flex-row flex-col">
          <div className="w-full">
            <VisitorsComponent
              visitors={statistics?.total_sales || 0}
              label="Total Sales"
            />
          </div>
          <div className="w-full">
            <VisitorsComponent
              visitors={statistics?.total_games || 0}
              label="Total Games"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
