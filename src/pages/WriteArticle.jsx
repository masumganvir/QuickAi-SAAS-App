import { Edit, Sparkles } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";

// Axios global config
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || window.location.origin;
axios.defaults.withCredentials = true;

const WriteArticle = () => {
  const lengthOptions = [
    { length: 800, text: "Short (500-800 words)" },
    { length: 1200, text: "Medium (800-1200 words)" },
    { length: 1600, text: "Long (1200+ words)" },
  ];

  const [selectedLength, setSelectedLength] = useState(lengthOptions[0]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  useAuth(); // Clerk session handled via cookies

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!input.trim()) {
      toast.error("Please enter a topic.");
      return;
    }

    try {
      setLoading(true);
      setContent("");

      const articlePrompt = `Write an article about ${input} in ${selectedLength.text}`;
      const targetLength = selectedLength.length;

      console.log("Sending Payload:", {
        prompt: articlePrompt,
        length: targetLength,
      });

      const { data } = await axios.post(
        "/api/ai/generate-article",
        {
          prompt: articlePrompt,
          length: targetLength,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("SERVER RESPONSE:", data);

      if (data.success && data.content) {
        setContent(data.content);
        toast.success("Generated!");
      } else {
        toast.error(data.message || "No content generated");
      }
    } catch (error) {
      console.error("SUBMISSION ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Article generation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* Left */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Article Configuration</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Article Topic</p>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          type="text"
          className="w-full p-2 px-3 mt-2 text-sm rounded-md border border-gray-300"
          placeholder="The future of artificial intelligence is..."
          required
        />

        <p className="mt-4 text-sm font-medium">Article Length</p>
        <div className="mt-3 flex gap-3 flex-wrap">
          {lengthOptions.map((item, index) => (
            <span
              key={index}
              onClick={() => setSelectedLength(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                selectedLength.text === item.text
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "text-gray-500 border-gray-300"
              }`}
            >
              {item.text}
            </span>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 flex justify-center items-center gap-2 bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-2 text-sm rounded-lg disabled:opacity-50"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Edit className="w-5" />
          )}
          Generate article
        </button>
      </form>

      {/* Right */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 min-h-96 max-h-[600px]">
        <div className="flex items-center gap-3 border-b pb-3 mb-3">
          <Edit className="w-5 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Generated article</h1>
        </div>

        {!content && !loading ? (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">
            Enter a topic and click Generate
          </div>
        ) : (
          <div className="overflow-y-auto pr-2 text-sm text-slate-600 leading-relaxed">
            <Markdown>{content}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default WriteArticle;


