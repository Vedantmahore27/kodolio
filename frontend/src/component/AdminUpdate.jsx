import { useEffect, useState } from "react";
import { Edit, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../utils/axiosClient";
import HeaderPage from "../pages/Header";

const AdminUpdate = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch all problems
  const fetchProblems = async () => {
    try {
      setLoading(true);
      console.log("[AdminUpdate] Fetching all problems...");
      const { data } = await axiosClient.get("/problem/getAllProblem");
      console.log("[AdminUpdate] Fetched problems:", data);
      setProblems(data.problems);
      setError(null);
    } catch (err) {
      console.error("[AdminUpdate] Error fetching problems:", err);
      let errorMsg = "Failed to fetch problems";
      if (err.response?.data) {
        errorMsg = typeof err.response.data === 'string' 
          ? err.response.data 
          : err.response.data.message || JSON.stringify(err.response.data);
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  // Edit handler - navigate to update page
  const handleEdit = (id) => {
    navigate(`/admin/update/${id}`);
  };

  // Loading UI
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <HeaderPage />
        <div className="flex-1">
          <div className="container mx-auto px-4 py-10 flex items-center justify-center">
            <div className="max-w-md w-full">
              <div className="alert alert-error shadow-lg">
                <AlertCircle size={24} />
                <div>
                  <h3 className="font-bold text-lg">Error Loading Problems</h3>
                  <div className="text-sm mt-2">{error}</div>
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => fetchProblems()}
                  className="btn btn-primary flex-1"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate("/admin")}
                  className="btn btn-outline flex-1"
                >
                  Back to Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderPage />
    <div className="flex-1">
    <div className="container mx-auto px-4 py-6">

      {/* Page Title */}
      <h1 className="text-3xl font-bold text-purple-400 mb-2">
        Update Problems
      </h1>
      <p className="text-gray-400 mb-6">
        Select a problem to edit its details
      </p>

      {/* Empty State */}
      {problems.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No problems available</p>
          <p className="text-sm text-gray-500">
            Create some problems first before updating them.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-purple-500/40 bg-[#1a1a2e] shadow-2xl">

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 font-bold text-orange-400 text-sm
                          bg-gradient-to-r from-purple-500/20 to-orange-500/20
                          border-b border-purple-500/40">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Title</div>
            <div className="col-span-3">Tags</div>
            <div className="col-span-2">Difficulty</div>
            <div className="col-span-1 text-center">Action</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-purple-500/20">
            {problems.map((problem, index) => (
              <div
                key={problem._id}
                className="
                  grid grid-cols-12 gap-4 p-4 items-center
                  transition-all duration-300
                  hover:bg-purple-900/10
                  hover:border-l-4 hover:border-purple-500
                "
              >
                <div className="col-span-1 text-gray-400">
                  {index + 1}
                </div>

                <div className="col-span-5 text-purple-400 font-semibold text-sm">
                  {problem.title}
                </div>

                <div className="col-span-3">
                  <span className="text-xs text-gray-200 bg-purple-800/30
                                   px-3 py-1 rounded-full border border-purple-500/50">
                    {problem.tags}
                  </span>
                </div>

                <div className="col-span-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border
                      ${getDifficultyClasses(problem.difficulty)}`}
                  >
                    {problem.difficulty}
                  </span>
                </div>

                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => handleEdit(problem._id)}
                    className="
                      p-2 rounded-lg
                      text-blue-400 border border-blue-500/50
                      transition-all duration-300
                      hover:bg-blue-500/10
                      hover:shadow-[0_0_15px_rgba(59,130,246,0.7)]
                      hover:scale-110
                    "
                    title="Edit this problem"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
    </div>
    </div>
  );
};

// Difficulty badge styles
const getDifficultyClasses = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "text-emerald-400 border-emerald-500/50";
    case "medium":
      return "text-amber-400 border-amber-500/50";
    case "hard":
      return "text-red-400 border-red-500/50";
    default:
      return "text-gray-400 border-gray-500/50";
  }
};

export default AdminUpdate;
