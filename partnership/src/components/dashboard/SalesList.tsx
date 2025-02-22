import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useEffect, useState } from "react";
import axios from "axios"; // Axios for API requests
import { ToastContainer, toast } from "react-toastify"; // For notifications
import "react-toastify/dist/ReactToastify.css";

interface Sale {
  bet: number;
  players: number;
  createdAt: number;
  game_type: number;
  total_amount: number;
  cut: number;
  player_won: number;
  branch_name: string;
  call: string;
  winners: string;
  cashier: string; 
}

export function SalesList() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [sortOrder, setSortOrder] = useState("");
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(""); // Error state

  // Fetch sales data
  const fetchSales = async () => {
    try {
      const token = localStorage.getItem("token"); // Get the token from localStorage
      const response = await axios.get("https://backend-api.hageregnabingo.com/api/sales-list", {
        headers: {
          Authorization: token, // Send the token in the header
        },
      });

      setSales(response.data); // Update state with fetched sales
      setLoading(false); // Set loading to false
    } catch (error: any) {
      console.error("Error fetching sales:", error);
      setError("Failed to fetch sales data. " + (error.response?.data?.message || error.message));
      toast.error(error.message); // Show error notification
      setLoading(false); // Set loading to false
    }
  };

  useEffect(() => {
    fetchSales(); // Fetch sales data on component mount
  }, []);

  // Handle sorting
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sortValue = e.target.value;
    setSortOrder(sortValue);

    let sortedSales = [...sales];
    if (sortValue === "newest") {
      sortedSales.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortValue === "oldest") {
      sortedSales.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
    setSales(sortedSales);
  };

  // Calculate the total sum of cuts
  const totalCuts: number = sales.reduce((sum: number, sale) => sum + Number(sale.cut), 0);

  if (loading) return <div>Loading...</div>; // Loading state
  if (error) return <div>Error: {error}</div>; // Error state

  return (
    <div>
      <ToastContainer /> {/* Toast container for notifications */}
      <div className="flex justify-between items-center mb-4 pt-4">
        <h2 className="text-xl text-blue-500 font-semibold">Sales List</h2>
        <select
          className="border px-3 py-1 rounded bg-inherit text-sm"
          value={sortOrder}
          onChange={handleSortChange}
        >
          <option value="">Sort By</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      <Table>
        <TableCaption>A list of sales.</TableCaption>
        <TableHeader className="bg-blue-500">
          <TableRow>
            <TableHead className="text-white">Date</TableHead>
            <TableHead className="text-white">Bet</TableHead>
            <TableHead className="text-white">Players</TableHead>
            <TableHead className="text-white">Total Won</TableHead>
            <TableHead className="text-white">Game Type</TableHead>
            <TableHead className="text-white">Cut</TableHead>
            <TableHead className="text-white">Player Won</TableHead>
            <TableHead className="text-white">Branch</TableHead>
            <TableHead className="text-white">Call</TableHead>
            <TableHead className="text-white">Winners</TableHead>
            <TableHead className="text-white">Cashier</TableHead> {/* New Cashier column */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.createdAt}>
              <TableCell className="font-medium">{new Date(sale.createdAt).toLocaleString()}</TableCell> {/* Updated to show date and time */}
              <TableCell>{sale.bet}</TableCell>
              <TableCell>{sale.players}</TableCell>
              <TableCell>{sale.total_amount}</TableCell>
              <TableCell>{sale.game_type}</TableCell>
              <TableCell className="text-violet-500">{sale.cut}</TableCell>
              <TableCell>{sale.player_won}</TableCell>
              <TableCell>{sale.branch_name}</TableCell>
              <TableCell>{sale.call}</TableCell>
              <TableCell>{sale.winners}</TableCell>
              <TableCell className="text-green-500">@{sale.cashier}</TableCell> {/* Display Cashier data */}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="text-blue-500 font-semibold text-xl" colSpan={11}>Total sales: {totalCuts} Birr</TableCell> {/* Summing cuts instead of sales count */}
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
