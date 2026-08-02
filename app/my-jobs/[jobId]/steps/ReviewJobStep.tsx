'use client'

import MobileCard from '../../../../components/app/MobileCard'
import PrimaryButton from '../../../../components/app/PrimaryButton'


type ReviewJobStepProps = {
  saving: boolean
  error: string
  onSelect: () => void
}

export default function ReviewJobStep({
  saving,
  error,
  onSelect,
}: ReviewJobStepProps) {
  return (
    <MobileCard>
      <p className="mb-4 text-base font-bold text-slate-700">
  Review Job
</p>

      <PrimaryButton
        onClick={onSelect}
        disabled={saving}
      >
        {saving ? 'Starting...' : 'Select'}
      </PrimaryButton>

      {error && (
        <p className="mt-4 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}
    </MobileCard>
  )
}