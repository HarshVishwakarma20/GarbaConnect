export default function AdSlot({ placement }: { placement: string }) {
  // Free-tier MVP optimization: We use a placeholder for now.
  // In production, you would drop your Google AdSense or specific ad network code here.
  return (
    <div className="w-full my-6 flex flex-col items-center justify-center bg-card border border-border border-dashed rounded-lg p-4 text-gray-500 opacity-60 text-sm h-[100px]">
      <span>Advertisement</span>
      <span className="text-[10px] uppercase tracking-widest">{placement}</span>
    </div>
  )
}