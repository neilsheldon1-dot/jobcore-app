'use client'

import MobileCard from '../../../../components/app/MobileCard'
import PrimaryButton from '../../../../components/app/PrimaryButton'
import WorkflowProgress from '../../../../components/app/WorkflowProgress'
import PhotoUploadForm from '../../../jobs/[jobId]/PhotoUploadForm'

type WorkflowPhoto = {
  id: string
  file_url: string
  category?: string | null
  photo_group?: string | null
  created_at?: string
  uploaded_by?: string | null
}

type AfterPhotosStepProps = {
  jobId: string
  jobAddress: string
  photos: WorkflowPhoto[]
  onUploadComplete: (
    uploadedPhotos: WorkflowPhoto[]
  ) => void
  onContinue: () => void
}

export default function AfterPhotosStep({
  jobId,
  jobAddress,
  photos,
  onUploadComplete,
  onContinue,
}: AfterPhotosStepProps) {
  return (
    <MobileCard>
      <WorkflowProgress
        currentStep={4}
        totalSteps={7}
        label="After Photos"
      />

      <p className="text-sm leading-6 text-slate-600">
        Take photographs showing the completed work.
      </p>

      {photos.length > 0 ? (
        <div className="mt-6">
          <p className="mb-3 text-sm font-bold text-slate-700">
            {photos.length}{' '}
            {photos.length === 1
              ? 'photo attached'
              : 'photos attached'}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo) => (
              <img
                key={photo.id}
                src={photo.file_url}
                alt="Completed work"
                className="h-32 w-full rounded-xl border border-slate-200 object-cover"
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border-2 border-dashed border-slate-300 p-8 text-center">
          <p className="font-semibold text-slate-700">
            No after photos
          </p>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <PhotoUploadForm
          jobId={jobId}
          jobAddress={jobAddress}
          defaultPhotoGroup="After"
          buttonLabel="Add After Photos"
          modalTitle="Add After Photos"
          lockPhotoGroup
          reloadOnComplete={false}
          onUploadComplete={onUploadComplete}
        />
      </div>

      {photos.length > 0 && (
        <div className="mt-3">
          <PrimaryButton onClick={onContinue}>
            Continue
          </PrimaryButton>
        </div>
      )}
    </MobileCard>
  )
}