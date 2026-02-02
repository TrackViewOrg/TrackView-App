'use client'

import * as React from 'react'
import { Copy, ExternalLink, HelpCircle, Mail } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface SupportDialogProps {
  children: React.ReactNode
}

// 1. Custom Discord Icon Component
function DiscordLogoIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={className}
    >
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2763-3.68-.2763-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.0991.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" />
    </svg>
  )
}

export function SupportDialog({ children }: SupportDialogProps) {
  const [open, setOpen] = React.useState(false)
  const email = 'support@trackview.com'

  const copyEmail = () => {
    navigator.clipboard.writeText(email)
    toast.success('Email address copied to clipboard')
  }

  // 2. JavaScript handler for mailto prevents hydration errors and button nesting issues
  const handleOpenMailClient = () => {
    window.location.href = `mailto:${email}?subject=Support Request`
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="gap-2 sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Contact Support</DialogTitle>
          <DialogDescription>
            Need assistance? Choose one of the channels below to get help from
            our team.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Email Section */}
          <div className="grid gap-2">
            <div className="space-y-2">
              <h4 className="text-sm leading-none font-medium">
                Send us an Email
              </h4>
              <p className="text-muted-foreground text-sm">
                Please send an email to the address below explaining the issue
                you are facing in detail. Our team will get back to you as soon
                as possible.
              </p>
            </div>

            <div className="bg-muted/50 flex items-center gap-2 rounded-sm border p-3">
              <Mail className="text-muted-foreground ml-1 h-4 w-4" />
              <code className="flex-1 text-sm font-medium">{email}</code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={copyEmail}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <Button
              className="w-full"
              // Ensure 'accent' variant exists in your button config, or use 'default'
              variant="accent"
              onClick={handleOpenMailClient}
            >
              Open Email Client
            </Button>
          </div>

          {/* Resources Section */}
          <div className="grid gap-3">
            <h4 className="text-sm leading-none font-medium">
              Self-Service Resources
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" className="justify-start" asChild>
                <a href="/faq" target="_blank" rel="noreferrer">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  FAQ
                  <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
                </a>
              </Button>

              <Button variant="secondary" className="justify-start" asChild>
                <a
                  href="https://discord.gg/bBz4UWBwbc"
                  target="_blank"
                  rel="noreferrer"
                >
                  {/* 3. Used the new Discord Logo Component */}
                  <DiscordLogoIcon className="mr-2 h-4 w-4" />
                  Discord
                  <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
