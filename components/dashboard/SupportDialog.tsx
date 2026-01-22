"use client"

import * as React from "react"
import { Loader2, Send } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface SupportDialogProps {
    children: React.ReactNode
}

export function SupportDialog({ children }: SupportDialogProps) {
    const [open, setOpen] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)

    // Simple state for form data
    const [formData, setFormData] = React.useState({
        subject: "",
        message: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // TODO: Connect to your FastAPI endpoint here
            // await api.post('/support/ticket', formData)

            console.log("Sending to support@trackview.com", formData)

            // Simulate network delay
            await new Promise((resolve) => setTimeout(resolve, 1000))

            toast.success("Support ticket sent successfully.")
            setOpen(false)
            setFormData({ subject: "", message: "" })
        } catch (error) {
            toast.error("Failed to send message. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="w-300">
                <DialogHeader>
                    <DialogTitle>Contact Support</DialogTitle>
                    <DialogDescription>
                        Need help ? Send us a message or reach out directly at <span className="text-primary font-medium">support@trackview.com</span>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                            id="subject"
                            placeholder="e.g., Session sync issue"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            placeholder="Describe the issue you are facing..."
                            className="min-h-[120px]"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} variant={"accent"}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Ticket
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}