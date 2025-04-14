import { SuggestedPrompt } from './ChatWindow';

interface PromptButtonsProps {
  prompts: SuggestedPrompt[];
  onPromptClick: (promptText: string) => void;
}

const PromptButtons = ({ prompts, onPromptClick }: PromptButtonsProps) => {
  return (
    <div>
      <p className="text-sm font-medium text-gray-600 mb-2">Suggested follow-up questions:</p>
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => onPromptClick(prompt.text)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
          >
            {prompt.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PromptButtons;
