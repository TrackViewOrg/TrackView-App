'use client'

import * as React from 'react'
import {
  ExternalLink,
  HelpCircle,
  Loader2,
  MessageSquare,
  Send,
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator' // Ensure you have this shadcn component
import { toast } from 'sonner'

interface SupportDialogProps {
  children: React.ReactNode
}

export function SupportDialog({ children }: SupportDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const [formData, setFormData] = React.useState({
    subject: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Connect to your FastAPI endpoint: await api.post('/support/ticket', formData)
      console.log('Sending to support@trackview.com', formData)

      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success('Support ticket sent successfully.')
      setOpen(false)
      setFormData({ subject: '', message: '' })
    } catch (error) {
      console.error('Support ticket error:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Contact Support</DialogTitle>
          <DialogDescription>
            Have a question? Check our resources or send us a message.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 py-2 md:grid-cols-5">
          {/* Support Links Section */}
          <div className="flex flex-col gap-4 md:col-span-2">
            <div className="space-y-3">
              <h4 className="text-sm leading-none font-medium">Quick Help</h4>
              <p className="text-muted-foreground text-xs">
                Try these first for faster answers.
              </p>

              <div className="grid gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="/faq" target="_blank" rel="noreferrer">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Read FAQ
                    <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
                  </a>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <a
                    href="https://discord.gg/yourlink"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Join Discord
                    <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
                  </a>
                </Button>
              </div>
            </div>

            <Separator />

            <div className="text-muted-foreground text-[11px]">
              Direct email: <br />
              <span className="text-primary font-medium">
                support@trackview.com
              </span>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="grid gap-4 md:col-span-3">
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Session sync issue"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Describe the issue..."
                className="min-h-[100px] resize-none"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>

            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} variant="accent">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Ticket
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
