export const CANNOT_START_REASONS = [
  {
    code: 'needs_scaffolding',
    label: 'Needs Scaffolding',
    selected: 'border-amber-500 bg-amber-50',
    hover: 'hover:border-amber-300',
  },
  {
    code: 'possible_asbestos',
    label: 'Possible Asbestos',
    selected: 'border-red-500 bg-red-50',
    hover: 'hover:border-red-300',
  },
  {
    code: 'no_access',
    label: 'No Access',
    selected: 'border-yellow-500 bg-yellow-50',
    hover: 'hover:border-yellow-300',
  },
  {
    code: 'tenant_refused',
    label: 'Tenant Refused Access',
    selected: 'border-yellow-500 bg-yellow-50',
    hover: 'hover:border-yellow-300',
  },
  {
    code: 'materials_required',
    label: 'Materials Required',
    selected: 'border-blue-500 bg-blue-50',
    hover: 'hover:border-blue-300',
  },
  {
    code: 'unsafe_conditions',
    label: 'Unsafe Conditions',
    selected: 'border-orange-500 bg-orange-50',
    hover: 'hover:border-orange-300',
  },
  {
    code: 'incorrect_information',
    label: 'Incorrect Job Information',
    selected: 'border-purple-500 bg-purple-50',
    hover: 'hover:border-purple-300',
  },
  {
    code: 'other',
    label: 'Other',
    selected: 'border-slate-500 bg-slate-100',
    hover: 'hover:border-slate-300',
  },
] as const