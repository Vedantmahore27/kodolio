import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosClient from "../utils/axiosClient";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import HeaderPage from "../pages/Header";

const COMPANIES = ["Google", "Amazon", "Microsoft", "Facebook", "Apple", "Netflix", "LinkedIn", "Tesla", "Uber", "Adobe"];

// ================= ZOD SCHEMA =================
const problemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  tags: z.enum(["array", "binary-search", "linkedlist", "stack", "recursion", "queues", "Dynamic Programming", "two pointer", "sliding window", "graph"]),
  company: z.array(z.enum(COMPANIES)).min(1, "Select at least one company"),
  visibleTestCases: z
    .array(
      z.object({
        input: z.string().min(1),
        output: z.string().min(1),
        explanation: z.string().min(1)
      })
    )
    .min(1),
  hiddenTestCases: z
    .array(
      z.object({
        input: z.string().min(1),
        output: z.string().min(1)
      })
    )
    .min(1),
  startCode: z
    .array(
      z.object({
        language: z.enum(["C++", "Java", "JavaScript"]),
        initialCode: z.string().min(1)
      })
    )
    .length(3),
  referenceSolution: z
    .array(
      z.object({
        language: z.enum(["C++", "Java", "JavaScript"]),
        completeCode: z.string().min(1)
      })
    )
    .length(3)
});

// ================= COMPONENT =================
function UpdateProblem() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(problemSchema),
    mode: "onSubmit",
    defaultValues: {
      title: "",
      description: "",
      difficulty: "Easy",
      tags: "array",
      company: [],
      visibleTestCases: [
        { input: "", output: "", explanation: "" }
      ],
      hiddenTestCases: [
        { input: "", output: "" }
      ],
      startCode: [
        { language: "C++", initialCode: "" },
        { language: "Java", initialCode: "" },
        { language: "JavaScript", initialCode: "" }
      ],
      referenceSolution: [
        { language: "C++", completeCode: "" },
        { language: "Java", completeCode: "" },
        { language: "JavaScript", completeCode: "" }
      ]
    }
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } =
    useFieldArray({ control, name: "visibleTestCases" });

  const { fields: hiddenFields, append: appendHidden, remove: removeHidden } =
    useFieldArray({ control, name: "hiddenTestCases" });

  // Fetch problem data on component mount
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("[UpdateProblem] Form validation errors:", errors);
    }
  }, [errors]);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        if (!id) {
          console.error("[UpdateProblem] Problem ID not found in params");
          setError("Problem ID not found");
          setLoading(false);
          return;
        }
        
        console.log("[UpdateProblem] Fetching problem with ID:", id);
        const response = await axiosClient.get(`/problem/getProblemById/${id}`);
        console.log("[UpdateProblem] Fetched problem data:", response.data);
        const problemData = response.data;
        
        // Ensure language values are valid for Zod validation
        const validLanguages = ["C++", "Java", "JavaScript"];
        
        // Fix startCode language values
        const fixedStartCode = (problemData.startCode && Array.isArray(problemData.startCode)) 
          ? problemData.startCode.map((item, idx) => ({
              language: validLanguages[idx] || "C++",
              initialCode: item.initialCode || ""
            }))
          : [
              { language: "C++", initialCode: "" },
              { language: "Java", initialCode: "" },
              { language: "JavaScript", initialCode: "" }
            ];
        
        // Fix referenceSolution language values
        const fixedReferenceSolution = (problemData.referenceSolution && Array.isArray(problemData.referenceSolution))
          ? problemData.referenceSolution.map((item, idx) => ({
              language: validLanguages[idx] || "C++",
              completeCode: item.completeCode || ""
            }))
          : [
              { language: "C++", completeCode: "" },
              { language: "Java", completeCode: "" },
              { language: "JavaScript", completeCode: "" }
            ];
        
        // Reset form with fetched data
        reset({
          title: problemData.title || "",
          description: problemData.description || "",
          difficulty: problemData.difficulty || "Easy",
          tags: problemData.tags || "array",
          company: Array.isArray(problemData.company) ? problemData.company : [problemData.company] || [],
          visibleTestCases: (problemData.visibleTestCases && Array.isArray(problemData.visibleTestCases) && problemData.visibleTestCases.length > 0) ? problemData.visibleTestCases : [
            { input: "", output: "", explanation: "" }
          ],
          hiddenTestCases: (problemData.hiddenTestCases && Array.isArray(problemData.hiddenTestCases) && problemData.hiddenTestCases.length > 0) ? problemData.hiddenTestCases : [
            { input: "", output: "" }
          ],
          startCode: fixedStartCode,
          referenceSolution: fixedReferenceSolution
        });
        
        console.log("[UpdateProblem] Form reset successfully");
        setLoading(false);
      } catch (err) {
        console.error("Error fetching problem:", err);
        let errorMessage = "Failed to fetch problem";
        
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data) {
          errorMessage = typeof err.response.data === 'string' 
            ? err.response.data 
            : JSON.stringify(err.response.data);
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        console.error("[UpdateProblem] Error message:", errorMessage);
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id, reset]);

  const onSubmit = async (data) => {
    console.log("[UpdateProblem] Form validation passed, submitting...");
    console.log("[UpdateProblem] Form data to submit:", {
      title: data.title,
      company: data.company,
      hasVisibleTestCases: Array.isArray(data.visibleTestCases),
      visibleTestCasesCount: data.visibleTestCases?.length,
      hasReferenceSolution: Array.isArray(data.referenceSolution),
      referenceSolutionCount: data.referenceSolution?.length
    });
    
    try {
      if (!id) {
        console.error("[UpdateProblem] Missing ID");
        alert("Problem ID is missing");
        setSubmitting(false);
        return;
      }
      
      console.log("[UpdateProblem] Starting submit with ID:", id);
      setSubmitting(true);
      
      // Show loading for at least 1 second
      const [response] = await Promise.all([
        axiosClient.put(`/problem/update/${id}`, data),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);
      
      console.log("[UpdateProblem] Backend response:", response);
      console.log("[UpdateProblem] Update completed successfully");
      
      // Show success alert
      alert("✅ Problem updated successfully!");
      
      // Reset submitting state and wait a bit before navigation
      setSubmitting(false);
      
      // Give user time to see the success message
      setTimeout(() => {
        console.log("[UpdateProblem] Navigating to admin...");
        navigate("/admin");
      }, 500);
      
    } catch (error) {
      console.error("[UpdateProblem] Caught error:", error);
      console.error("[UpdateProblem] Error response:", error.response);
      setSubmitting(false);
      
      let errorMsg = "Something went wrong";
      let errorDetails = "";
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        } else if (error.response.data.message) {
          errorMsg = error.response.data.message;
        } else {
          errorMsg = JSON.stringify(error.response.data);
        }
        errorDetails = `(Status: ${error.response.status})`;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      console.error("[UpdateProblem] Final error message:", errorMsg, errorDetails);
      alert(`❌ Update failed: ${errorMsg} ${errorDetails}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <HeaderPage />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="loading loading-spinner loading-lg"></span>
            <p className="mt-4 text-gray-400">Loading problem data...</p>
            <p className="text-xs text-gray-500 mt-2">Problem ID: {id}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="max-w-md w-full mx-4">
          <div className="alert alert-error shadow-lg mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m2-2l2 2m-8-2a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
            <div>
              <h3 className="font-bold text-lg">Error Loading Problem</h3>
              <div className="text-xs mt-2">{error}</div>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/admin/update")}
              className="btn btn-outline flex-1"
            >
              Back to Problems
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary flex-1"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderPage />
    <div className="flex-1">
    <div className="bg-base-200 px-4 py-10">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-purple-400 mb-2">
          Update Problem
        </h1>
        <p className="text-gray-400 mb-8">
          Edit and improve the problem details ✏️
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* BASIC INFO */}
          <div className="bg-base-100/80 border border-purple-500/20 rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-orange-400 mb-4">
              🧩 Basic Information
            </h2>

            <input
              {...register("title")}
              placeholder="Problem title"
              className="input input-bordered w-full mb-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
            />
            {errors.title && <span className="text-red-500 text-sm">{errors.title.message}</span>}

            <textarea
              {...register("description")}
              placeholder="Problem description"
              rows={5}
              className="textarea textarea-bordered w-full focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
            />

            <div className="flex gap-4 mt-4">
              <select
                {...register("difficulty")}
                className="select select-bordered w-1/3 focus:border-purple-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <select
                {...register("tags")}
                className="select select-bordered w-2/3 focus:border-purple-500"
              >
                <option value="array">Array</option>
                <option value="binary-search">Binary Search</option>
                <option value="linkedlist">Linked List</option>
                <option value="stack">Stack</option>
                <option value="recursion">Recursion</option>
                <option value="queues">Queues</option>
                <option value="Dynamic Programming">Dynamic Programming</option>
                <option value="two pointer">Two Pointer</option>
                <option value="sliding window">Sliding Window</option>
                <option value="graph">Graph</option>
              </select>
              {errors.tags && <span className="text-red-500 text-sm">{errors.tags.message}</span>}
            </div>

            {/* COMPANY SELECTION */}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-purple-300 mb-3">🏢 Companies (Select Multiple)</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {COMPANIES.map((company) => (
                  <label key={company} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value={company}
                      {...register("company")}
                      className="checkbox checkbox-purple"
                    />
                    <span className="text-sm text-gray-300">{company}</span>
                  </label>
                ))}
              </div>
              {errors.company && <span className="text-red-500 text-sm">{errors.company.message}</span>}
            </div>
          </div>

          {/* VISIBLE TEST CASES */}
          <div className="bg-base-100/80 border border-purple-500/20 rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-orange-400 mb-4">
              👀 Visible Test Cases
            </h2>

            {visibleFields.map((_, index) => (
              <div
                key={index}
                className="bg-base-200/60 border border-base-300 rounded-lg p-4 mb-4"
              >
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">
                    Case #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeVisible(index)}
                    className="text-red-400 text-xs"
                  >
                    Remove
                  </button>
                </div>

                <input
                  {...register(`visibleTestCases.${index}.input`)}
                  placeholder="Input"
                  className="input input-bordered w-full mb-2"
                />
                <input
                  {...register(`visibleTestCases.${index}.output`)}
                  placeholder="Output"
                  className="input input-bordered w-full mb-2"
                />
                <textarea
                  {...register(`visibleTestCases.${index}.explanation`)}
                  placeholder="Explanation"
                  className="textarea textarea-bordered w-full"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                appendVisible({ input: "", output: "", explanation: "" })
              }
              className="btn btn-sm btn-outline btn-primary"
            >
              + Add Visible Case
            </button>
          </div>

          {/* HIDDEN TEST CASES */}
          <div className="bg-base-100/80 border border-purple-500/20 rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-orange-400 mb-4">
              🙈 Hidden Test Cases
            </h2>

            {hiddenFields.map((_, index) => (
              <div
                key={index}
                className="bg-base-200/60 border border-base-300 rounded-lg p-4 mb-4"
              >
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">
                    Case #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeHidden(index)}
                    className="text-red-400 text-xs"
                  >
                    Remove
                  </button>
                </div>

                <input
                  {...register(`hiddenTestCases.${index}.input`)}
                  placeholder="Input"
                  className="input input-bordered w-full mb-2"
                />
                <input
                  {...register(`hiddenTestCases.${index}.output`)}
                  placeholder="Output"
                  className="input input-bordered w-full"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() => appendHidden({ input: "", output: "" })}
              className="btn btn-sm btn-outline btn-primary"
            >
              + Add Hidden Case
            </button>
          </div>

          {/* CODE TEMPLATES */}
          <div className="bg-base-100/80 border border-purple-500/20 rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-orange-400 mb-4">
              💻 Code Templates
            </h2>

            {[0, 1, 2].map((i) => (
              <div key={i} className="mb-6">
                <h3 className="text-purple-400 mb-2">
                  {i === 0 ? "C++" : i === 1 ? "Java" : "JavaScript"}
                </h3>

                <pre className="bg-[#0f172a] border border-purple-500/20 rounded-lg p-4 mb-3">
                  <textarea
                    {...register(`startCode.${i}.initialCode`)}
                    placeholder="Starter code"
                    className="w-full bg-transparent text-green-400 font-mono outline-none"
                    rows={5}
                  />
                </pre>

                <pre className="bg-[#0f172a] border border-orange-500/20 rounded-lg p-4">
                  <textarea
                    {...register(`referenceSolution.${i}.completeCode`)}
                    placeholder="Reference solution"
                    className="w-full bg-transparent text-blue-400 font-mono outline-none"
                    rows={5}
                  />
                </pre>
              </div>
            ))}
          </div>

          {/* SUBMIT */}
          <div className="flex gap-4">
            <div className="flex-1">
              <button
                type="submit"
                disabled={submitting}
                className={`btn w-full bg-gradient-to-r from-purple-400 to-orange-400 text-black font-semibold hover:scale-[1.02] transition-all ${
                  submitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="loading loading-spinner loading-md"></span>
                    <span>Updating...</span>
                  </span>
                ) : (
                  'Update Problem'
                )}
              </button>
              {Object.keys(errors).length > 0 && (
                <div className="text-red-400 text-xs mt-2">
                  <p>⚠️ Please fix form errors before submitting</p>
                  <details className="mt-1 text-yellow-400">
                    <summary>Show errors</summary>
                    <pre className="text-xs bg-red-900/30 p-2 rounded mt-1 overflow-auto max-h-40">
                      {JSON.stringify(errors, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => navigate("/admin")}
              disabled={submitting}
              className="btn btn-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
    </div>
  );
}

export default UpdateProblem;
