export default function EmptyState({ title, body }) {
  return (
    <div className="sf-panel rounded-md border border-dashed border-[#d4b98a] px-6 py-10 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#64748b]">{body}</p>
    </div>
  );
}
