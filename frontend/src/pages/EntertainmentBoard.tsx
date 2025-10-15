import { useEffect, useState } from "react";
import { Plus, ThumbsUp } from "lucide-react";
import api from "../utils/api";
import { Poll, Confession } from "../types";
import { formatDate } from "../utils/formatDate";
import { toast } from "react-toastify";
import { socketService } from "../services/socketService";
import { PollCard } from "../components/PollCard";
import { WouldYouRatherCard } from "../components/WouldYouRatherCard";

const EntertainmentBoard = () => {
  const [activeTab, setActiveTab] = useState<"polls" | "wyr" | "confessions">(
    "polls"
  );
  const [polls, setPolls] = useState<Poll[]>([]);
  const [wouldYouRather, setWouldYouRather] = useState<Poll[]>([]);
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [showPollModal, setShowPollModal] = useState(false);
  const [showConfessionModal, setShowConfessionModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [confessionText, setConfessionText] = useState("");

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Separate useEffect for socket subscriptions
  useEffect(() => {
    if (activeTab === "polls" || activeTab === "wyr") {
      const pollList = activeTab === "polls" ? polls : wouldYouRather;
      pollList.forEach((poll) => {
        socketService.subscribeToPollUpdates(poll._id, (results) => {
          if (activeTab === "polls") {
            setPolls((currentPolls) =>
              currentPolls.map((p) =>
                p._id === poll._id ? { ...p, ...results } : p
              )
            );
          } else {
            setWouldYouRather((currentPolls) =>
              currentPolls.map((p) =>
                p._id === poll._id ? { ...p, ...results } : p
              )
            );
          }
        });
      });
    } else if (activeTab === "confessions") {
      socketService.subscribeToNewConfessions((confession) => {
        setConfessions((current) => [confession, ...current]);
      });
    }

    return () => {
      // Clean up socket subscriptions
      if (activeTab === "polls" || activeTab === "wyr") {
        const pollList = activeTab === "polls" ? polls : wouldYouRather;
        pollList.forEach((poll) => {
          socketService.getSocket()?.off(`poll:${poll._id}:update`);
        });
      } else if (activeTab === "confessions") {
        socketService.getSocket()?.off("confession:new");
      }
    };
  }, [activeTab, polls, wouldYouRather]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "polls") {
        const res = await api.get("/polls");
        setPolls(res.data.filter((p: Poll) => !p.isWouldYouRather));
      } else if (activeTab === "wyr") {
        const res = await api.get("/polls?type=would-you-rather");
        setWouldYouRather(res.data);
      } else {
        const res = await api.get("/confessions");
        setConfessions(res.data);
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (pollId: string, optionIndex: number) => {
    try {
      const response = await api.post(`/polls/${pollId}/vote`, { optionIndex });
      toast.success("Voted! 🎉");

      // Emit the vote event with updated results
      socketService.emitPollVote(pollId, optionIndex.toString(), response.data);

      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to vote");
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validOptions = pollOptions.filter((opt) => opt.trim());
      if (validOptions.length < 2) {
        toast.error("Please provide at least 2 options");
        return;
      }

      const response = await api.post("/polls", {
        question: pollQuestion,
        options: validOptions.map((text) => ({ text })),
        isWouldYouRather: activeTab === "wyr",
      });

      const newPoll = response.data;

      // Add new poll to the state
      if (activeTab === "wyr") {
        setWouldYouRather((current) => [newPoll, ...current]);
      } else {
        setPolls((current) => [newPoll, ...current]);
      }

      toast.success("Poll created! 🎉");
      setPollQuestion("");
      setPollOptions(["", ""]);
      setShowPollModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create poll");
    }
  };

  const handleCreateConfession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/confessions", { text: confessionText });
      toast.success("Confession posted anonymously! 🤫");
      setConfessionText("");
      setShowConfessionModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to post confession");
    }
  };

  const handleLikeConfession = async (id: string) => {
    try {
      await api.post(`/confessions/${id}/like`);
      fetchData();
    } catch (error) {
      toast.error("Failed to like confession");
    }
  };

  const tabs = [
    { id: "polls", label: "📊 Polls" },
    { id: "wyr", label: "🤔 Would You Rather" },
    { id: "confessions", label: "🤫 Confessions" },
  ];

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Entertainment Board 🎮
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Vote on polls, play Would You Rather, and share anonymous
            confessions
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === tab.id
                  ? "border-b-2 border-primary-500 text-primary-600 dark:text-primary-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Create Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() =>
              activeTab === "confessions"
                ? setShowConfessionModal(true)
                : setShowPollModal(true)
            }
            className="flex items-center space-x-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all">
            <Plus size={20} />
            <span>
              {activeTab === "confessions" ? "Post Confession" : "Create Poll"}
            </span>
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === "polls" &&
              polls.map((poll) => (
                <PollCard key={poll._id} poll={poll} onVote={handleVote} />
              ))}
            {activeTab === "wyr" &&
              wouldYouRather.map((poll) => (
                <WouldYouRatherCard
                  key={poll._id}
                  poll={poll}
                  onVote={handleVote}
                />
              ))}
            {activeTab === "confessions" &&
              confessions.map((confession) => (
                <ConfessionCard
                  key={confession._id}
                  confession={confession}
                  onLike={handleLikeConfession}
                />
              ))}
          </div>
        )}

        {/* Poll Modal */}
        {showPollModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Create {activeTab === "wyr" ? "Would You Rather" : "Poll"}
              </h2>
              <form onSubmit={handleCreatePoll} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Question
                  </label>
                  <input
                    type="text"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    required
                    className="w-full px-4 py-2 border rounded-lg dark:bg-dark-bg dark:border-gray-600 dark:text-white"
                    placeholder="What's your question?"
                  />
                </div>
                {pollOptions.map((option, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Option {index + 1}
                    </label>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...pollOptions];
                        newOptions[index] = e.target.value;
                        setPollOptions(newOptions);
                      }}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-dark-bg dark:border-gray-600 dark:text-white"
                      placeholder={`Option ${index + 1}`}
                    />
                  </div>
                ))}
                {activeTab !== "wyr" && pollOptions.length < 6 && (
                  <button
                    type="button"
                    onClick={() => setPollOptions([...pollOptions, ""])}
                    className="text-primary hover:underline text-sm">
                    + Add Option
                  </button>
                )}
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors">
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPollModal(false)}
                    className="flex-1 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confession Modal */}
        {showConfessionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Anonymous Confession 🤫
              </h2>
              <form onSubmit={handleCreateConfession} className="space-y-4">
                <textarea
                  value={confessionText}
                  onChange={(e) => setConfessionText(e.target.value)}
                  required
                  rows={6}
                  maxLength={1000}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-dark-bg dark:border-gray-600 dark:text-white resize-none"
                  placeholder="Share your secret... (completely anonymous)"
                />
                <p className="text-sm text-gray-500">
                  {confessionText.length}/1000
                </p>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors">
                    Post Anonymously
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfessionModal(false)}
                    className="flex-1 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ConfessionCard = ({
  confession,
  onLike,
}: {
  confession: Confession;
  onLike: (id: string) => void;
}) => {
  return (
    <div className="bg-white dark:bg-dark-card rounded-xl p-6 shadow-md">
      <p className="text-gray-800 dark:text-gray-200 mb-4">{confession.text}</p>
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>{formatDate(confession.createdAt)}</span>
        <button
          onClick={() => onLike(confession._id)}
          className="flex items-center space-x-2 hover:text-red-500 transition-colors">
          <ThumbsUp size={16} />
          <span>{confession.likes}</span>
        </button>
      </div>
    </div>
  );
};

export default EntertainmentBoard;
