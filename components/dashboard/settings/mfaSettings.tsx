"use client"

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ActionButton } from "@/components/dashboard/settings/ActionButton"
import { Smartphone, Loader2, Plus, Trash2, Copy, Check, ArrowRight, ShieldCheck } from "lucide-react"
import {
    enrollMFA,
    verifyAndEnableMFA,
    getMFAFactors,
    deleteFactor,
    verifyExistingFactor,
    type Factor
} from "@/lib/auth/settings"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {useUser} from "@/components/providers/user-provider";
import {toast} from "sonner";

type ViewState = 'loading' | 'list' | 'enroll' | 'verify'

type PendingAction =
    | { type: 'add' }
    | { type: 'delete', factorId: string }
    | null

export default function MfaSettings() {
    const [open, setOpen] = useState(false)
    const [view, setView] = useState<ViewState>('loading')

    const {user} = useUser()

    // Data State
    const [factors, setFactors] = useState<Factor[]>([])

    // Action State
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [pendingAction, setPendingAction] = useState<PendingAction>(null)

    // Enroll/Verify State
    const [newDeviceName, setNewDeviceName] = useState("")
    const [enrollStep, setEnrollStep] = useState<'name' | 'qr'>('name')
    const [enrollData, setEnrollData] = useState<{ factorId: string, qrCode: string, secret: string } | null>(null)
    const [code, setCode] = useState("")
    const [isCopied, setIsCopied] = useState(false)

    // --- RESET LOGIC ---
    const resetFlow = useCallback(() => {
        setNewDeviceName("")
        setEnrollStep('name')
        setEnrollData(null)
        setCode("")
        setError(null)
        setOpen(false)
        setPendingAction(null)
    }, [])

    // --- DATA FETCHING ---
    const loadFactors = useCallback(async () => {
        // Only show full loading view if dialog is open, otherwise just set loading state
        if (open) setView('loading')
        setLoading(true)

        try {
            const { factors } = await getMFAFactors()
            setFactors(factors)
            // Determine view based on result
            setView(factors.length > 0 ? 'list' : 'enroll')
        } catch (e) {
            console.error("MFA Load Error", e)
            setView('enroll')
        } finally {
            setLoading(false)
        }
    }, [open])

    // --- INITIAL LOAD ---
    // Fix: Load data immediately on mount so the button label is correct
    useEffect(() => {
        loadFactors()
    }, [])

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen)
        if (!isOpen) {
            setTimeout(resetFlow, 200)
        } else {
            // Refresh data when opening to ensure freshness
            loadFactors()
        }
    }

    // --- GATEKEEPER LOGIC ---
    const initiateSensitiveAction = (action: PendingAction) => {
        if (factors.length === 0) {
            if (action?.type === 'add') setView('enroll')
            return
        }
        setPendingAction(action)
        setCode("")
        setError(null)
        setView('verify')
    }

    const handleGatekeeperVerify = async () => {
        if (code.length !== 6 || factors.length === 0) return
        setLoading(true)
        setError(null)

        try {
            const primaryFactorId = factors[0].id
            const res = await verifyExistingFactor(primaryFactorId, code)

            if (res.error) {
                setError("Invalid code")
            } else {
                if (pendingAction?.type === 'add') {
                    resetFlow()
                    setView('enroll')
                } else if (pendingAction?.type === 'delete') {
                    await handleDelete(pendingAction.factorId)
                }
            }
        } catch (err) {
            setError("Verification failed")
        } finally {
            setLoading(false)
        }
    }

    // --- ACTIONS ---
    const handleGenerateQR = async () => {
        if (!newDeviceName.trim()) return

        setLoading(true)
        setError(null)
        try {
            const res = await enrollMFA(newDeviceName.trim(), user?.email)

            if (res.error) {
                setError(res.error)
            } else if (res.qrCode && res.factorId && res.secret) {
                setEnrollData({
                    factorId: res.factorId,
                    qrCode: res.qrCode,
                    secret: res.secret
                })
                setEnrollStep('qr')
            }
        } catch (err) {
            setError("Failed to start enrollment")
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyEnroll = async () => {
        if (!enrollData || code.length !== 6) return
        setLoading(true)

        try {
            const res = await verifyAndEnableMFA(enrollData.factorId, code)
            if (res.error) {
                setError("Invalid code. Please try again.")
            } else {
                await loadFactors()
                resetFlow()
            }
        } catch (err) {
            setError("Verification failed")
        } finally {
            toast.success("MFA Device Added Successfully !")
            setLoading(false)
        }
    }

    const handleDelete = async (factorId: string) => {
        setLoading(true)
        try {
            const res = await deleteFactor(factorId)
            if (res.error) {
                setError(res.error)
            } else {
                await loadFactors()
                setPendingAction(null)
            }
        } catch (err) {
            setError("Failed to delete device")
        } finally {
            setLoading(false)
        }
    }

    const handleCopySecret = () => {
        if (!enrollData?.secret) return
        navigator.clipboard.writeText(enrollData.secret)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
    }

    // --- VIEWS ---
    const renderList = () => (
        <div className="space-y-4 py-2">
            <div className="space-y-3">
                {factors.map((factor) => (
                    <div
                        key={factor.id}
                        className="flex items-center justify-between p-3 rounded-sm border bg-input/15 text-card-foreground shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-sm flex items-center justify-center">
                                <Smartphone className="h-7 w-7 text-muted-foreground" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium leading-none">
                                    {factor.friendly_name || "Authenticator Device"}
                                </span>
                                <span className="text-xs text-muted-foreground mt-1">
                                    Added {format(new Date(factor.created_at), "MMM d, yyyy")}
                                </span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => initiateSensitiveAction({ type: 'delete', factorId: factor.id })}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                    </div>
                ))}
            </div>
            <Button
                variant="secondary"
                className="w-full border border-dashed gap-2 h-11"
                onClick={() => initiateSensitiveAction({ type: 'add' })}
            >
                <Plus className="h-4 w-4" />
                Add New Device
            </Button>
        </div>
    )

    const renderVerification = () => (
        <div className="space-y-6 py-2">
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="h-12 w-12 rounded-sm bg-accent/20 flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-accent-foreground" />
                </div>
                <div className="space-y-1">
                    <h4 className="font-medium text-sm">Security Check</h4>
                    <p className="text-xs text-muted-foreground max-w-[280px]">
                        Please enter the code from your <strong>{factors[0]?.friendly_name || "primary device"}</strong> to continue.
                    </p>
                </div>
            </div>

            <div className="flex justify-center">
                <InputOTP maxLength={6} value={code} onChange={setCode}>
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>
            </div>
            {error && <p className="text-sm text-center text-red-500 font-medium bg-red-50 dark:bg-red-900/10 p-2 rounded-sm">{error}</p>}
        </div>
    )

    const renderEnrollment = () => (
        <div className="space-y-6 py-2">
            <div className="space-y-2">
                <Label>Device Name</Label>
                <div className="flex gap-2">
                    <Input
                        placeholder="e.g. Personal iPhone"
                        value={newDeviceName}
                        onChange={(e) => setNewDeviceName(e.target.value)}
                        disabled={enrollStep === 'qr' || loading}
                        className="flex-1"
                    />
                    {enrollStep === 'name' && (
                        <Button
                            onClick={handleGenerateQR}
                            disabled={!newDeviceName.trim() || loading}
                            className="shrink-0"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                        </Button>
                    )}
                </div>
            </div>

            {enrollStep === 'qr' && (
                <div className="space-y-6">
                    <div className="flex flex-col items-center gap-4">
                        <div className="bg-white p-1 rounded-sm shadow-sm">
                            {enrollData?.qrCode ? (
                                <Image src={enrollData.qrCode} alt="QR" width={160} height={160} />
                            ) : (
                                <div className="h-[160px] w-[160px] flex items-center justify-center">
                                    <Loader2 className="animate-spin text-muted-foreground" />
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-center w-full">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                Can&#39;t Scan the code ?
                            </span>
                            <button
                                onClick={handleCopySecret}
                                className="flex items-center gap-2 px-3 py-1.5 bg-background hover:bg-muted rounded-sm transition-all text-xs font-mono group"
                            >
                                <span className="truncate max-w-[200px]">{enrollData?.secret}</span>
                                {isCopied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2 text-center w-full flex flex-col items-center">
                        <Label>Enter 6-digit code from app</Label>
                        <div className="flex justify-center">
                            <InputOTP maxLength={6} value={code} onChange={setCode}>
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                    </div>

                    {error && <p className="text-sm text-center text-red-500 font-medium bg-red-50 dark:bg-red-900/10 p-2 rounded-sm">{error}</p>}
                </div>
            )}
        </div>
    )

    // --- MAIN RENDER ---
    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <ActionButton
                    label={factors.length > 0 ? "Manage Devices" : "Setup MFA"}
                    disabled={loading && !open} // Disable while initializing on mount
                />
            </DialogTrigger>

            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle>
                        {view === 'loading' && "Loading..."}
                        {view === 'list' && "Security Devices"}
                        {view === 'enroll' && "Add New Device"}
                        {view === 'verify' && "Verify Identity"}
                    </DialogTitle>
                    <DialogDescription>
                        {view === 'loading' && "Checking security status..."}
                        {view === 'list' && "Manage the authenticator devices linked to your account."}
                        {view === 'enroll' && "Name your device, then scan the QR code to finish setup."}
                        {view === 'verify' && "For security, verify your identity before making changes."}
                    </DialogDescription>
                </DialogHeader>

                {view === 'loading' ? (
                    <div className="h-48 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        {view === 'list' && renderList()}
                        {view === 'enroll' && renderEnrollment()}
                        {view === 'verify' && renderVerification()}
                    </>
                )}

                <DialogFooter className="mt-2">
                    {(view === 'enroll' || view === 'verify') && (
                        <>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    resetFlow()
                                    setView(factors.length > 0 ? 'list' : 'enroll')
                                }}
                            >
                                Cancel
                            </Button>

                            {/* Verify View Button */}
                            {view === 'verify' && (
                                <Button
                                    onClick={handleGatekeeperVerify}
                                    variant={"accent"}
                                    disabled={loading || code.length < 6}
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
                                </Button>
                            )}

                            {/* Enroll View Button */}
                            {view === 'enroll' && enrollStep === 'qr' && (
                                <Button
                                    onClick={handleVerifyEnroll}
                                    disabled={loading || code.length < 6}
                                    variant={"accent"}
                                >
                                    {loading ? "Verifying..." : "Verify & Enable"}
                                </Button>
                            )}
                        </>
                    )}

                    {view === 'list' && (
                        <Button className="w-full sm:w-auto" onClick={() => setOpen(false)}>Done</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}