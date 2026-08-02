type SectionTitleProps = {
  children: React.ReactNode
}

export default function SectionTitle({
  children,
}: SectionTitleProps) {
  return (
    <h2 className="text-xs font-black uppercase tracking-wide text-slate-400">
      {children}
    </h2>
  )
}