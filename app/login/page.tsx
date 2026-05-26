import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Sign in to JobCore
        </h1>

        <p className="text-sm text-slate-500 mt-1 mb-6">
          Enter your email and password to continue.
        </p>

        <LoginForm />
      </div>
    </main>
  )
}