export default function UpvcHeader() {
  return (
  <header className="border-b border-slate-900 bg-slate-950 text-white shadow-sm">
    <div className="mx-auto flex max-w-md items-center justify-between gap-4 px-4 py-4">

      <div className="min-w-0">
        <img
          src="/jobcore-logo.png"
          alt="JobCore"
          className="h-6 w-auto"
        />
      </div>

      <p className="truncate text-sm font-bold text-orange-500">
        UPVCOutlet
      </p>

    </div>
  </header>
)
}