'use client'

import { useState } from 'react'
import { createClient } from '../../utils/supabase/client'

export default function ChangePasswordForm() {
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setMessage('')
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSaving(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    setIsSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    setPassword('')
    setConfirmPassword('')
    setMessage('Password updated successfully.')
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 max-w-xl">
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-bold">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-bold">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          New Password
        </label>

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Confirm New Password
        </label>

        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
      >
        {isSaving ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  )
}