import { Poll } from "../types";

export const PollCard = ({
  poll,
  onVote,
}: {
  poll: Poll;
  onVote: (id: string, index: number) => void;
}) => {
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl p-6 shadow-md">
      <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
        {poll.question}
      </h3>
      <div className="space-y-3">
        {poll.options.map((option, index) => {
          const percentage =
            totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          return (
            <button
              key={index}
              onClick={() => onVote(poll._id, index)}
              className="w-full text-left p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary transition-all relative overflow-hidden">
              <div
                className="absolute inset-0 bg-primary/10"
                style={{ width: `${percentage}%` }}
              />
              <div className="relative flex justify-between items-center">
                <span className="font-medium text-gray-800 dark:text-white">
                  {option.text}
                </span>
                <span className="text-sm font-bold text-primary">
                  {option.votes} ({percentage.toFixed(0)}%)
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
        {totalVotes} total votes
      </p>
    </div>
  );
};
