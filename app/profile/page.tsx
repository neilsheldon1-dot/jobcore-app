import AppHeader from '../../components/AppHeader'

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <AppHeader />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Profile
          </h1>

          <p className="text-slate-500 mt-2">
            Profile management coming soon.
          </p>
        </div>
      </div>
    </main>
  )
}