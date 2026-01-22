'use client'

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { verifyOtpForLogin, signout } from "@/lib/auth/actions" // Import signout
import { Loader2, ArrowLeft } from "lucide-react"

export function VerifyMfaForm() {
    const [code, setCode] = useState("")
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setError(null)
        formData.set("code", code)
        const result = await verifyOtpForLogin(formData)
        if (result?.error) setError(result.error)
    }

    return (
        <Card className="w-[350px] border-zinc-800 bg-zinc-900 text-white">
            <CardHeader className="text-center">
                <CardTitle>Security Check</CardTitle>
                <CardDescription className="text-zinc-400">
                    Enter the 6-digit code from your authenticator app.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="flex flex-col items-center gap-6">
                    <InputOTP maxLength={6} value={code} onChange={setCode}>
                        <InputOTPGroup>
                            {[...Array(6)].map((_, i) => (
                                <InputOTPSlot key={i} index={i}  />
                            ))}
                        </InputOTPGroup>
                    </InputOTP>

                    {error && <p className="text-sm text-red-500 font-medium animate-pulse">{error}</p>}

                    <div className="flex flex-col w-full gap-2">
                        <SubmitButton />

                        {/* CANCEL BUTTON: Kills session and goes back to login */}
                        <Button
                            variant="ghost"
                            className="w-full text-zinc-400 hover:text-white hover:bg-zinc-800"
                            formAction={signout} // Re-uses your existing signout action
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Login
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify Access"}
        </Button>
    )
}