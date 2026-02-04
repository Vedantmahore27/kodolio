import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosClient from "../utils/axiosClient";
import { useNavigate } from "react-router";

// ================= ZOD SCHEMA =================
const problemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  tags: z.enum(["array", "linkedList", "graph", "dp"]),
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
 function  CreateProblem() {
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
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

  const onSubmit = async (data) => {
    try {
      await axiosClient.post("/problem/create", data);
      alert("Problem created successfully 🚀");
      navigate("/admin");
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-base-200 px-4 py-10">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-purple-400 mb-2">
          Create New Problem
        </h1>
        <p className="text-gray-400 mb-8">
          Build high-quality problems for the Kodolio community 🧠
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

            <textarea
              {...register("description")}
              placeholder="Problem description"
              rows={5}
              className="textarea textarea-bordered w-full focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
            />

            <div className="flex gap-4 mt-4">
              <select
                {...register("difficulty")}
                className="select select-bordered w-1/2 focus:border-purple-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <select
                {...register("tags")}
                className="select select-bordered w-1/2 focus:border-purple-500"
              >
                <option value="array">Array</option>
                <option value="linkedList">Linked List</option>
                <option value="graph">Graph</option>
                <option value="dp">DP</option>
              </select>
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
          <button
            type="submit"
            className="btn  bg-gradient-to-r from-purple-400 to-orange-400 text-black font-semibold hover:scale-[1.02] transition-all"
          >
          Create Problem
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateProblem;
