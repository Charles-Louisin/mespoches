import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'
import { verifyAuthToken } from '@/lib/server/jwt'
import { AUTH_TOKEN_COOKIE } from '@/lib/server/session-cookies'

const f = createUploadthing()

async function requireUser(req: Request) {
  const cookieHeader = req.headers.get('cookie') ?? ''
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${AUTH_TOKEN_COOKIE}=([^;]+)`)
  )
  const token = match?.[1] ? decodeURIComponent(match[1]) : null

  if (!token) {
    throw new UploadThingError('Non autorisé')
  }

  const payload = await verifyAuthToken(token)
  if (!payload?.id) {
    throw new UploadThingError('Session invalide')
  }

  return { userId: String(payload.id) }
}

export const ourFileRouter = {
  categoryImage: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(async ({ req }) => requireUser(req))
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl }
    }),
  walletImage: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(async ({ req }) => requireUser(req))
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
