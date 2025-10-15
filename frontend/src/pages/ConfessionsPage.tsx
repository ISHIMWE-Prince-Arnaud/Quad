import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import api from "../utils/api";
import { Confession } from "../types";
import { toast } from "react-toastify";
import { socketService } from "../services/socketService";
import { ConfessionCard } from "../components/ConfessionCard";

const ConfessionsPage = () => {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfessionModal, setShowConfessionModal] = useState(false);
  const [confessionText, setConfessionText] = useState("");

  useEffect(() => {
    fetchData();

    // Subscribe to new confessions
    socketService.subscribeToNewConfessions((confession) => {
      setConfessions((current) => [confession, ...current]);
    });

    return () => {
      socketService.getSocket()?.off("confession:new");
    };
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/confessions");
      setConfessions(res.data);
    } catch (error) {
      toast.error("Failed to load confessions");
    } finally {
      setIsLoading(false);
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

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Confessions</h1>
          <p className="text-base-content/70">
            Share your thoughts anonymously with the community
          </p>
        </div>

        {/* Create Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowConfessionModal(true)}
            className="btn btn-primary">
            <Plus size={20} />
            Share Confession
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <div className="grid gap-4">
            {confessions.map((confession) => (
              <ConfessionCard
                key={confession._id}
                confession={confession}
                onLike={handleLikeConfession}
              />
            ))}
          </div>
        )}

        {/* Confession Modal */}
        {showConfessionModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h2 className="text-xl font-bold mb-4">Share Your Confession</h2>
              <form onSubmit={handleCreateConfession} className="space-y-4">
                <textarea
                  value={confessionText}
                  onChange={(e) => setConfessionText(e.target.value)}
                  required
                  rows={6}
                  maxLength={1000}
                  className="textarea textarea-bordered w-full"
                  placeholder="Share your thoughts anonymously..."
                />
                <p className="text-sm opacity-70">
                  {confessionText.length}/1000
                </p>
                <div className="modal-action">
                  <button type="submit" className="btn btn-primary">
                    Post Anonymously
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfessionModal(false)}
                    className="btn">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
            <div
              className="modal-backdrop"
              onClick={() => setShowConfessionModal(false)}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfessionsPage;
