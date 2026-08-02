type PrimaryButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}

export default function PrimaryButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-2xl bg-orange-500 py-4 text-lg font-black text-white transition hover:bg-orange-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:bg-slate-300 disabled:active:scale-100"
    >
      {children}
    </button>
  )
}