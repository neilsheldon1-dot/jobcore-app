import test from 'node:test'
import assert from 'node:assert/strict'
import { jobDestinationGroups, scaffoldDestinations, asbestosDestination } from '../lib/jobDestinations.ts'

test('workflow links retain the existing query contracts and separate review route', () => {
  const groups = jobDestinationGroups([{ id: 37, name: 'Awaiting Report' }])
  const destinations = groups.flatMap((group) => group.items)
  assert.equal(destinations.find((item) => item.label === 'Needs Review').href, '/jobs/review')
  assert.equal(destinations.find((item) => item.label === 'Ready Jobs').href, '/jobs?ready=true')
  assert.equal(destinations.find((item) => item.label === 'On Hold').href, '/jobs?onHold=true')
  assert.equal(destinations.find((item) => item.label === 'Allocated Jobs').href, '/jobs?status=Allocated')
  assert.equal(new Set(destinations.map((item) => item.href)).size, destinations.length)
  for (const destination of scaffoldDestinations) {
    const url = new URL(destination.href, 'https://fixture.invalid')
    assert.equal(url.pathname, '/jobs')
    assert.equal(url.searchParams.get('scaffoldPipeline'), destination.stage)
    assert.equal(url.searchParams.has('scaffoldStatus'), false)
  }
  assert.equal(destinations.find((item) => item.label === 'Asbestos Awaiting Report').href, '/jobs?asbestosStatus=37')
})

test('asbestos destinations use supplied IDs, retain order and avoid duplicate labels', () => {
  const groups = jobDestinationGroups([{ id: 91, name: 'Asbestos Removed' }, { id: 12, name: 'Inspection Requested' }])
  assert.deepEqual(groups.at(-1).items, [
    { label: 'Asbestos Removed', href: '/jobs?asbestosStatus=91' },
    { label: 'Asbestos Inspection Requested', href: '/jobs?asbestosStatus=12' },
  ])
  assert.equal(jobDestinationGroups().some((group) => group.label === 'Asbestos'), false)
  assert.deepEqual(asbestosDestination({ id: 5, name: 'ASBESTOS Present' }), { label: 'ASBESTOS Present', href: '/jobs?asbestosStatus=5' })
})
