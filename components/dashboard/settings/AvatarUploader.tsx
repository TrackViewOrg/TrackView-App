'use client'

import React, { useState, useRef, ChangeEvent } from 'react'
import Cropper, { Area } from 'react-easy-crop'
import { createClient } from '@/lib/supabase/client'
import { getCroppedImg } from '@/lib/canvas-utils' // The utility from previous step
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2Icon, PencilIcon } from 'lucide-react'
import { toast } from 'sonner'
import { updateProfileAvatar } from '@/lib/auth/settings'

// Define strict types based on your Supabase schema
interface User {
  id: string
  email?: string
}

interface Profile {
  id: string
  avatar_url: string | null
  display_name: string | null
  // Add other profile fields if necessary
}

interface AvatarUploadProps {
  user: User | null
  profile: Profile | null
}

export function AvatarUpload({ user, profile }: AvatarUploadProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // 1. File Selection Handler
  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      // Basic validation
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || null)
        setIsOpen(true)
      })
      reader.readAsDataURL(file)
    }
  }

  // 2. Crop Handler
  const onCropComplete = (_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  // 3. Upload & Save Handler (Optimized)
  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels || !user) return

    setLoading(true)
    try {
      // A. Create Blob from Canvas
      const croppedBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
      )
      if (!croppedBlob) throw new Error('Failed to create image blob')

      const fileExt = 'jpeg'
      const filePath = `${user.id}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedBlob, {
          contentType: 'image/jpeg',
          upsert: true,
        })

      if (uploadError) throw uploadError

      // C. Get Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath)

      // D. Update Profile with Cache Busting
      // We add ?t=timestamp to force the browser to re-fetch the new image
      // instead of using the cached version of the previous image.
      const avatarUrlWithCacheBust = `${publicUrl}?t=${Date.now()}`

      await updateProfileAvatar(avatarUrlWithCacheBust)

      setIsOpen(false)

      // Clean up
      setImageSrc(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error) {
      console.error('Avatar upload error:', error)
      const message =
        error instanceof Error ? error.message : 'Failed to update avatar'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Prevent interaction if no user/profile data (loading state)
  if (!user || !profile) {
    return (
      <div className="bg-muted flex h-20 w-20 items-center justify-center rounded-sm border">
        <Loader2Icon className="text-muted-foreground animate-spin" size={20} />
      </div>
    )
  }

  return (
    <>
      <div className="group relative h-20 w-20 shrink-0 select-none">
        <Avatar className="h-full w-full cursor-pointer rounded-sm border transition-opacity select-none hover:opacity-80">
          <AvatarImage
            src={profile.avatar_url || ''}
            alt={profile.display_name || 'User Avatar'}
            className="object-cover"
          />
          <AvatarFallback className="bg-transparent">
            <Loader2Icon
              className="text-muted-foreground/20 animate-spin"
              size={15}
            />
          </AvatarFallback>
        </Avatar>

        {/* Overlay for upload trigger */}
        <div className="absolute inset-0 flex items-center justify-center">
          <label
            className="bg-background/80 flex h-full w-full cursor-pointer items-center justify-center rounded-sm opacity-0 transition-all duration-200 group-hover:opacity-100"
            title="Change Avatar"
          >
            <PencilIcon className="text-foreground/70 h-5 w-5" />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={onFileChange}
            />
          </label>
        </div>
      </div>

      {/* Cropper Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adjust Image</DialogTitle>
          </DialogHeader>

          <div className="bg-muted relative mt-2 h-[300px] w-full overflow-hidden rounded-sm border">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <span className="w-12 text-xs font-medium">Zoom</span>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(vals) => setZoom(vals[0])}
                className="flex-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button variant={'accent'} onClick={handleSave} disabled={loading}>
              {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
