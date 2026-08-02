type MobileCardProps = {
  children: React.ReactNode
  className?: string
}

export default function MobileCard({
  children,
  className = '',
}: MobileCardProps) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </section>
  )
}