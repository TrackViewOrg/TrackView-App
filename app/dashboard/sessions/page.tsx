import React, { Suspense } from 'react'
import Section from '@/components/Section'
import SessionDataGrid from '@/features/sessions/components/SessionDataGrid'
import { SessionErrorToaster } from '@/features/sessions/components/SessionErrorToaster'

function Page() {
  return (
    <Section
      title={'Your Sessions'}
      description={'Recent telemetry sessions'}
      className={'px-50'}
    >
      <Suspense>
        <SessionErrorToaster />
      </Suspense>
      <SessionDataGrid />
    </Section>
  )
}

export default Page
