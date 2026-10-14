export default function AuthorBadge({ name }: { name?: string }) {
  return (
    <div className="w-fit max-w-full rounded-xl border border-white/70 bg-white/45 px-4 py-2.5 backdrop-blur-md shadow-[0_2px_12px_rgba(0,33,71,0.04)]">
      <p className="text-sm leading-relaxed text-[#002147]">
        <span className="font-medium text-slate-500">글쓴이 · </span>
        <span className="font-semibold">{name || '작성자'}</span>
      </p>
    </div>
  );
}
