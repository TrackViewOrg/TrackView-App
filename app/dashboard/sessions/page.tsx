import React from 'react'
import Section from '@/components/Section'
import SessionDataGrid from '@/components/sessions/SessionDataGrid'

function Page() {
    return (
      <Section
        title={'Your Sessions'}
        description={'Recent telemetry sessions'}
        className={'px-50'}
      >
        <SessionDataGrid/>
      </Section>
    )
}

export default Page
