export default function UpvcHeader() {
  return (
    <header className="border-b border-black bg-[#101313] shadow-sm">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
        <div>
          <p className="text-xl font-black tracking-tight text-white">
            The UPVC
            <span className="text-orange-500">
              Outlet
            </span>
          </p>

          <p className="text-xs font-semibold text-slate-400">
            Beautiful homes start here
          </p>
        </div>

        <span className="rounded-full border border-orange-500 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400">
          JobCore
        </span>
      </div>
    </header>
  )
}