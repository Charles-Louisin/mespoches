import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'
import { getRequestUserId } from '@/lib/server/request-auth'

const f = createUploadthing()

async function requireUser(req: Request) {
  const userId = await getRequestUserId(req)
  if (!userId) {
    throw new UploadThingError('Non autorisé')
  }
  return { userId }
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
