import { Area } from 'react-easy-crop'

/**
 * Creates an HTMLImageElement from a given URL.
 * This helper function wraps the image loading process in a Promise.
 *
 * @param url - The source URL of the image.
 * @returns A Promise that resolves with the loaded HTMLImageElement.
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous') // needed to avoid CORS issues on CodeSandbox
    image.src = url
  })

/**
 * Generates a cropped image blob from a source image and crop coordinates.
 * This function draws the cropped area onto a canvas and converts it to a Blob.
 *
 * @param imageSrc - The source URL of the image to crop.
 * @param pixelCrop - The crop area coordinates (x, y, width, height) in pixels.
 * @returns A Promise that resolves with the cropped image Blob, or null if context creation fails.
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob | null> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  // Set width to match the crop area (ensures high quality)
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  // Draw the cropped portion of the image onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  // Convert the canvas content to a JPEG blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'))
          return
        }
        resolve(blob)
      },
      'image/jpeg',
      0.2 // Quality setting for JPEG
    )
  })
}
