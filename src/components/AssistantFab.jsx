
// Simple floating Assistant button
export default function AssistantFab({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#2563eb] text-white shadow-lg text-xl"
      aria-label="Ouvrir l’assistant"
      title="Assistant"
    >
      💬
    </button>
  );
}
