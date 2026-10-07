// Disposable, loopback-only Supabase-shaped fixture server. No production configuration is read.
import { createServer } from 'node:http'

export const fixtureUserId = '11111111-1111-4111-8111-111111111111'
export const fixtureOperativeId = '22222222-2222-4222-8222-222222222222'
export const jobId = (index) => `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`
const statuses = ['Ticket', 'Ready', 'Allocated', 'Needs Review', 'Needs Quoting', 'Awaiting Approval', 'Needs Invoicing', 'Complete']
let role = 'office'
let tables
let mutations = []
let photoCount = 3

function reset() {
  role = 'office'
  photoCount = 3
  mutations = []
  const jobs = Array.from({ length: 130 }, (_, i) => ({
    id: jobId(i + 1), job_id: jobId(i + 1), job_number: `DEMO-${i + 1}`,
    property_id: jobId(i + 1), address_line_1: `${i + 1} Preview Avenue`, town: 'Preview Town',
    postcode: 'LL00 0AA', client: 'Cartrefi', description: 'Disposable fixture: inspect and repair gutter',
    status: 'Allocated', status_id: 3, sort_order: i, created_at: `2026-10-01T12:00:00Z`,
    urgent: false, is_on_hold: false, zone: 'Preview Zone', job_type: 'Reactive',
    assigned_user_id: fixtureUserId, assigned_to_name: 'Preview Crew',
    scaffold_status_id: null, asbestos_status_id: i === 0 ? 1 : null,
    asbestos_statuses: i === 0 ? { name: 'Awaiting Report' } : null,
  }))
  const additional = ['Ticket', 'Ready', 'Needs Review', 'Needs Quoting', 'Awaiting Approval', 'Needs Invoicing', 'Complete', 'Allocated']
  additional.forEach((status, i) => jobs.push({ ...jobs[0], id: jobId(131 + i), job_id: jobId(131 + i), address_line_1: `${131 + i} Preview Avenue`, status, status_id: statuses.indexOf(status) + 1, sort_order: 131 + i, is_on_hold: i === 7, asbestos_status_id: null, asbestos_statuses: null }))
  const stages = [
    { quote_requested_date: '2026-10-01' },
    { quote_requested_date: '2026-10-01', quote_received_date: '2026-10-02' },
    { erection_requested_date: '2026-10-03' },
    { erection_requested_date: '2026-10-03', erected_date: '2026-10-04' },
    { erected_date: '2026-10-04', dismantle_requested_date: '2026-10-05' },
  ]
  tables = {
    jobs_view: jobs,
    jobs,
    profiles: [
      { id: fixtureUserId, email: 'preview@example.com', full_name: 'Preview Office', display_name: 'Preview Office', role, is_active: true },
      { id: fixtureOperativeId, email: 'crew@example.com', full_name: 'Preview Crew', display_name: 'Preview Crew', role: 'fitter', is_active: true },
    ],
    job_statuses: statuses.map((name, i) => ({ id: i + 1, name, is_active: true, sort_order: i })),
    scaffold_records: stages.map((stage, i) => ({ id: jobId(i + 201), job_id: jobId(i + 1), ...stage })),
    scaffold_statuses: [],
    asbestos_statuses: [{ id: 1, name: 'Awaiting Report', sort_order: 1 }, { id: 2, name: 'Asbestos Removed', sort_order: 2 }],
    job_types: [{ id: 1, name: 'Reactive', is_active: true }],
    job_type_links: [],
    blocker_types: [{ id: 1, name: 'Scaffold', colour: 'blue', is_active: true, sort_order: 1 }],
    job_blocker_links: [{ id: jobId(501), job_id: jobId(1), blocker_type_id: 1, blocker_types: { name: 'Scaffold', colour: 'blue' } }],
    zone_locations: [{ location_name: 'Preview Zone', sort_order: 1, area_zones: { name: 'Preview Area', sort_order: 1 } }],
    job_notes: [], job_rams: [], completion_reports: [], partner_job_completions: [], asbestos_records: [],
    properties: jobs.map((job) => ({ ...job, id: job.property_id })), photos: [],
  }
}
reset()

function filterRows(rows, searchParams) {
  return rows.filter((row) => [...searchParams].every(([key, value]) => {
    if (['select', 'order', 'limit', 'offset', 'or'].includes(key)) return true
    if (value.startsWith('eq.')) return String(row[key]) === value.slice(3)
    if (value.startsWith('neq.')) return String(row[key]) !== value.slice(4)
    if (value.startsWith('in.(')) return value.slice(4, -1).split(',').map((item) => item.replaceAll('"', '')).includes(String(row[key]))
    if (value === 'is.null') return row[key] == null
    return true
  }))
}

export function startFixtureServer(port = 3101) {
  const server = createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range')
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }
    const url = new URL(req.url, `http://127.0.0.1:${port}`)
    const json = (body, status = 200) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)) }
    let body = ''
    for await (const chunk of req) body += chunk
    const input = body ? JSON.parse(body) : {}
    if (url.pathname === '/__fixture/reset') { reset(); json({ success: true }); return }
    if (url.pathname === '/__fixture/state') { json({ mutations, role, photoCount }); return }
    if (url.pathname === '/__fixture/role') {
      role = input.role
      tables.profiles[0].role = role
      json({ role }); return
    }
    if (url.pathname === '/__fixture/photos') { photoCount = input.count; json({ photoCount }); return }
    const user = { id: fixtureUserId, aud: 'authenticated', role: 'authenticated', email: 'preview@example.com', app_metadata: {}, user_metadata: {}, created_at: '2026-10-01T00:00:00Z' }
    if (url.pathname === '/auth/v1/token') {
      const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url')
      const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: fixtureUserId, exp: Math.floor(Date.now() / 1000) + 86400, role: 'authenticated' })}.fixture-only`
      json({ access_token: token, refresh_token: 'fixture-refresh', expires_in: 86400, token_type: 'bearer', user }); return
    }
    if (url.pathname === '/auth/v1/user') { json(user); return }
    if (url.pathname.startsWith('/photos/')) {
      const n = Number(url.pathname.split('/').pop().split('.')[0])
      if (n === 4) { res.writeHead(404); res.end(); return }
      const colour = n === 1 ? '#0f766e' : n === 2 ? '#1d4ed8' : '#92400e'
      res.writeHead(200, { 'Content-Type': 'image/svg+xml' })
      res.end(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720"><rect width="1200" height="720" fill="#e2e8f0"/><path d="M240 370L600 120L960 370V650H240Z" fill="${colour}"/><path d="M210 380L600 100L990 380" fill="none" stroke="#0f172a" stroke-width="35"/><rect x="400" y="410" width="130" height="180" fill="#fff"/><rect x="670" y="410" width="130" height="100" fill="#fff"/><text x="600" y="690" text-anchor="middle" font-family="Arial" font-size="30" fill="#0f172a">Disposable evidence fixture ${n}</text></svg>`); return
    }
    if (!url.pathname.startsWith('/rest/v1/')) { json({ error: 'Fixture endpoint not found' }, 404); return }
    const table = url.pathname.slice('/rest/v1/'.length)
    const allPhotos = Array.from({ length: photoCount }, (_, i) => ({ id: jobId(301 + i), job_id: jobId(1), file_url: `http://127.0.0.1:${port}/photos/${i + 1}.svg`, photo_group: i === 0 ? 'Before' : 'After', category: `Evidence ${i + 1}`, created_at: `2026-10-0${i + 1}T12:00:00Z`, uploaded_by: 'Preview Crew' }))
    let rows = filterRows(table === 'photos' ? allPhotos : tables[table] || [], url.searchParams)
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      mutations.push({ table, method: req.method, ids: rows.map((row) => row.id), input })
      if (req.method === 'PATCH') rows.forEach((row) => {
        Object.assign(row, input)
        if (table === 'jobs' && input.status_id) row.status = statuses[input.status_id - 1]
        if (table === 'jobs' && 'assigned_user_id' in input) row.assigned_to_name = tables.profiles.find((profile) => profile.id === input.assigned_user_id)?.display_name || null
      })
      else { json({ error: 'This fixture only supports PATCH mutations' }, 405); return }
    }
    const orders = url.searchParams.get('order')?.split(',') || []
    rows = [...rows].sort((a, b) => {
      for (const order of orders) {
        const [key, direction] = order.split('.')
        const comparison = typeof a[key] === 'number' ? a[key] - b[key] : String(a[key] ?? '').localeCompare(String(b[key] ?? ''))
        if (comparison) return direction === 'desc' ? -comparison : comparison
      }
      return 0
    })
    const count = rows.length
    if (url.searchParams.has('limit')) rows = rows.slice(0, Number(url.searchParams.get('limit')))
    res.setHeader('Content-Range', `0-${Math.max(0, count - 1)}/${count}`)
    if (req.method === 'HEAD') { res.writeHead(200); res.end(); return }
    if (req.headers.accept?.includes('application/vnd.pgrst.object+json')) {
      if (rows.length !== 1) { json({ code: 'PGRST116', details: `The result contains ${rows.length} rows`, message: 'Cannot coerce to a single JSON object' }, 406); return }
      json(rows[0]); return
    }
    json(rows)
  })
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)))
}

if (process.argv[1]?.endsWith('/supabase.mjs')) {
  await startFixtureServer(Number(process.env.FIXTURE_PORT || 3101))
  console.log('Disposable fixture data listening on http://127.0.0.1:3101')
}
