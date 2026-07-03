import Link from 'next/link'

type FeatureCardProps = {
  title: string
  description: string
  href?: string
  buttonText?: string
  disabled?: boolean
  icon?: string
}

export default function FeatureCard({
  title,
  description,
  href,
  buttonText = 'Open',
  disabled = false,
  icon = '📄',
}: FeatureCardProps) {
  return (
    <div className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-6">
        <div className="flex gap-4">
          <div className="text-3xl leading-none">
            {icon}
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {title}
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              {description}
            </p>
          </div>
        </div>

        {disabled ? (
          <span className="bg-slate-100 text-slate-500 border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap">
            Coming Soon
          </span>
        ) : (
          <Link
            href={href || '#'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition cursor-pointer whitespace-nowrap"
          >
            {buttonText}
          </Link>
        )}
      </div>
    </div>
  )
}