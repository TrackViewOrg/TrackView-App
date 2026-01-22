"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export default function ToastTestPage() {
    // Simulator for the "Upload -> Python Analysis" workflow
    const simulateUpload = () => {
        return new Promise<{ session_id: string }>((resolve, reject) => {
            setTimeout(() => {
                // Randomly succeed or fail for testing purposes
                Math.random() > 0.3
                    ? resolve({ session_id: "STINT_001" })
                    : reject(new Error("Python API Timeout"))
            }, 2000)
        })
    }

    return (
        <div className="container mx-auto max-w-4xl py-20 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Notification System Check</h1>
                <p className="text-muted-foreground">
                    Validate toast styles and behaviors for Trackview.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* Standard States */}
                <div className="space-y-4 p-4 border rounded-lg bg-card/50">
                    <h3 className="font-mono text-sm uppercase text-muted-foreground">Status Indicators</h3>
                    <div className="flex flex-col gap-2">
                        <Button
                            variant="outline"
                            onClick={() => toast("Telemetry Recording Started")}
                        >
                            Default
                        </Button>
                        <Button
                            variant="outline"
                            className="border-green-500/20 hover:bg-green-500/10 hover:text-green-500"
                            onClick={() => toast.success("Session Data Saved", {
                                description: "Stint #4 has been indexed successfully."
                            })}
                        >
                            Success
                        </Button>
                        <Button
                            variant="outline"
                            className="border-red-500/20 hover:bg-red-500/10 hover:text-red-500"
                            onClick={() => toast.error("Connection Failed", {
                                description: "Supabase authentication rejected the token."
                            })}
                        >
                            Error
                        </Button>
                        <Button
                            variant="outline"
                            className="border-yellow-500/20 hover:bg-yellow-500/10 hover:text-yellow-500"
                            onClick={() => toast.warning("High Latency Detected", {
                                description: "Data stream delayed by 150ms."
                            })}
                        >
                            Warning
                        </Button>
                    </div>
                </div>

                {/* Complex Workflows */}
                <div className="space-y-4 p-4 border rounded-lg bg-card/50">
                    <h3 className="font-mono text-sm uppercase text-muted-foreground">Workflows</h3>
                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={() => {
                                toast.promise(simulateUpload, {
                                    loading: 'Processing Telemetry...',
                                    success: (data) => `Analysis Ready: ${data.session_id}`,
                                    error: 'Processing Failed',
                                });
                            }}
                        >
                            Promise (Upload Sim)
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={() => toast("Update Available", {
                                description: "Desktop client v1.2.0 is ready.",
                                action: {
                                    label: "Download",
                                    onClick: () => console.log("Download triggered"),
                                },
                            })}
                        >
                            With Action
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={() => toast.info("Session Notes", {
                                description: "Tire pressures were high in Sector 3.",
                                duration: 10000, // Long duration for reading
                            })}
                        >
                            Info (Long Duration)
                        </Button>
                    </div>
                </div>

                {/* Custom Layouts */}
                <div className="space-y-4 p-4 border rounded-lg bg-card/50">
                    <h3 className="font-mono text-sm uppercase text-muted-foreground">Data Layouts</h3>
                    <div className="flex flex-col gap-2">
                        <Button
                            variant="outline"
                            onClick={() => toast.custom((t) => (
                                <div className="bg-background border border-border p-4 rounded-md shadow-lg w-full">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-sm">Lap Invalidated</span>
                                        <span className="text-xs font-mono text-red-500">T4 EXCEED</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground font-mono">
                                        Gap: +0.423s <br/>
                                        Vel: 210 km/h
                                    </div>
                                </div>
                            ))}
                        >
                            Custom JSX (Lap Invalid)
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    )
}