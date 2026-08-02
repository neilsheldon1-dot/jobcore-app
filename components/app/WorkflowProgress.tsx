type WorkflowProgressProps = {
  currentStep: number
  totalSteps: number
  label: string
}

export default function WorkflowProgress({
  currentStep,
  totalSteps,
  label,
}: WorkflowProgressProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="mb-6">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        Step {currentStep} of {totalSteps}
      </p>

      <p className="mt-1 text-base font-bold text-slate-700">
        {label}
      </p>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-orange-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}