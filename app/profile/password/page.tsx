import AppHeader from '../../../components/AppHeader'
import ChangePasswordForm from './ChangePasswordForm'

export default function ChangePasswordPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <AppHeader />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Change Password
          </h1>

          <p className="text-slate-500 mt-2 mb-6">
            Update your JobCore login password.
          </p>

          <ChangePasswordForm />
        </div>
      </div>
    </main>
  )
}