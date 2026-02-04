import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import axiosClient from "../utils/axiosClient";

const AdminDelete = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all problems
  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get("/problem/getAllProblem");
      setProblems(data.problems);
    } catch (err) {
      setError("Failed to fetch problems");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  // Delete handler
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "⚠️ This action is permanent.\nAre you sure you want to delete this problem?"
    );

    if (!confirmDelete) return;

    try {
      await axiosClient.delete(`/problem/delete/${id}`);
      setProblems((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError("Failed to delete problem");
    }
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
      <div className="alert alert-error shadow-lg my-4">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">

      {/* Page Title */}
      <h1 className="text-3xl font-bold text-purple-400 mb-6">
        Delete Problems
      </h1>

      {/* Empty State */}
      {problems.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No problems available</p>
          <p className="text-sm text-gray-500">
            All problems have been deleted.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-purple-500/40 bg-[#1a1a2e] shadow-2xl">

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 font-bold text-orange-400 text-sm
                          bg-gradient-to-r from-purple-500/20 to-orange-500/20
                          border-b border-purple-500/40 ">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Title</div>
            <div className="col-span-3">Tags</div>
            <div className="col-span-2">Difficulty</div>
            <div className="col-span-1 text-center ">Action</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-purple-500/20">
            {problems.map((problem, index) => (
              <div
                key={problem._id}
                className="
                  grid grid-cols-12 gap-4 p-4 items-center
                  transition-all duration-300
                  hover:bg-red-900/10
                  hover:border-l-4 hover:border-red-500
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
                    onClick={() => handleDelete(problem._id)}
                    className="
                      p-2 rounded-lg
                      text-red-400 border border-red-500/50
                      transition-all duration-300
                      hover:bg-red-500/10
                      hover:shadow-[0_0_15px_rgba(239,68,68,0.7)]
                      hover:scale-110
                    "
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
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

export default AdminDelete;
