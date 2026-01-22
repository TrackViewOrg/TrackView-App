'use client'

import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export default function ToastTestPage() {
  // Simulator for the "Upload -> Python Analysis" workflow
  const simulateUpload = () => {
    return new Promise<{ session_id: string }>((resolve, reject) => {
      setTimeout(() => {
        // Randomly succeed or fail for testing purposes
        if (Math.random() > 0.3) {
          resolve({ session_id: 'STINT_001' })
        } else {
          reject(new Error('Python API Timeout'))
        }
      }, 2000)
    })
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-8 py-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Notification System Check
        </h1>
        <p className="text-muted-foreground">
          Validate toast styles and behaviors for Trackview.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Standard States */}
        <div className="bg-card/50 space-y-4 rounded-lg border p-4">
          <h3 className="text-muted-foreground font-mono text-sm uppercase">
            Status Indicators
          </h3>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => toast('Telemetry Recording Started')}
            >
              Default
            </Button>
            <Button
              variant="outline"
              className="border-green-500/20 hover:bg-green-500/10 hover:text-green-500"
              onClick={() =>
                toast.success('Session Data Saved', {
                  description: 'Stint #4 has been indexed successfully.',
                })
              }
            >
              Success
            </Button>
            <Button
              variant="outline"
              className="border-red-500/20 hover:bg-red-500/10 hover:text-red-500"
              onClick={() =>
                toast.error('Connection Failed', {
                  description: 'Supabase authentication rejected the token.',
                })
              }
            >
              Error
            </Button>
            <Button
              variant="outline"
              className="border-yellow-500/20 hover:bg-yellow-500/10 hover:text-yellow-500"
              onClick={() =>
                toast.warning('High Latency Detected', {
                  description: 'Data stream delayed by 150ms.',
                })
              }
            >
              Warning
            </Button>
          </div>
        </div>

        {/* Complex Workflows */}
        <div className="bg-card/50 space-y-4 rounded-lg border p-4">
          <h3 className="text-muted-foreground font-mono text-sm uppercase">
            Workflows
          </h3>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => {
                toast.promise(simulateUpload, {
                  loading: 'Processing Telemetry...',
                  success: (data) => `Analysis Ready: ${data.session_id}`,
                  error: 'Processing Failed',
                })
              }}
            >
              Promise (Upload Sim)
            </Button>

            <Button
              variant="secondary"
              onClick={() =>
                toast('Update Available', {
                  description: 'Desktop client v1.2.0 is ready.',
                  action: {
                    label: 'Download',
                    onClick: () => console.log('Download triggered'),
                  },
                })
              }
            >
              With Action
            </Button>

            <Button
              variant="ghost"
              onClick={() =>
                toast.info('Session Notes', {
                  description: 'Tire pressures were high in Sector 3.',
                  duration: 10000, // Long duration for reading
                })
              }
            >
              Info (Long Duration)
            </Button>
          </div>
        </div>

        {/* Custom Layouts */}
        <div className="bg-card/50 space-y-4 rounded-lg border p-4">
          <h3 className="text-muted-foreground font-mono text-sm uppercase">
            Data Layouts
          </h3>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={() =>
                toast.custom(() => (
                  <div className="bg-background border-border w-full rounded-md border p-4 shadow-lg">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-bold">Lap Invalidated</span>
                      <span className="font-mono text-xs text-red-500">
                        T4 EXCEED
                      </span>
                    </div>
                    <div className="text-muted-foreground font-mono text-xs">
                      Gap: +0.423s <br />
                      Vel: 210 km/h
                    </div>
                  </div>
                ))
              }
            >
              Custom JSX (Lap Invalid)
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
