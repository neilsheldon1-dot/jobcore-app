type BuilderSettingRowProps = {
  title: string
  description?: string
  checked: boolean
  onChange: () => void
}

export default function BuilderSettingRow({
  title,
  description,
  checked,
  onChange,
}: BuilderSettingRowProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="w-full flex items-center justify-between gap-4 border-b border-slate-100 py-3 text-left cursor-pointer hover:bg-slate-50 transition"
    >
      <div>
        <p className="text-sm font-bold text-slate-900">
          {title}
        </p>

        {description && (
          <p className="text-xs text-slate-500 mt-0.5">
            {description}
          </p>
        )}
      </div>

      <span
        className={`w-9 h-5 rounded-full border flex items-center px-0.5 transition ${
          checked
            ? 'bg-sky-600 border-blue-600 justify-end'
            : 'bg-slate-100 border-slate-300 justify-start'
        }`}
      >
        <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
      </span>
    </button>
  )
}