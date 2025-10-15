import { Poll } from "../types";

export const WouldYouRatherCard = ({
  poll,
  onVote,
}: {
  poll: Poll;
  onVote: (id: string, index: number) => void;
}) => {
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 shadow-lg text-white">
      <h3 className="text-2xl font-bold mb-2 text-center">
        Would You Rather...
      </h3>
      <h4 className="text-xl mb-6 text-center text-white/90">
        {poll.question}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {poll.options.map((option, index) => {
          const percentage =
            totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          return (
            <button
              key={index}
              onClick={() => onVote(poll._id, index)}
              className="bg-white/20 backdrop-blur-sm p-6 rounded-xl hover:bg-white/30 transition-all">
              <p className="font-semibold text-lg mb-3">{option.text}</p>
              <div className="text-2xl font-bold">{percentage.toFixed(0)}%</div>
              <div className="text-sm opacity-80">{option.votes} votes</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
