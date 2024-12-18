import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { getUserIdFromSessionClaims } from '@/lib/actions/user.actions';
import { getAuth } from '@clerk/nextjs/server';

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: '4MB' } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      const { sessionClaims } = getAuth(req);

      if (!sessionClaims) throw new Error('No sessionClaims in JWT');

      const userId = await getUserIdFromSessionClaims(sessionClaims);

      if (!userId) throw new Error('Unauthorized');

      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log('Upload complete for userId:', metadata.userId);

      console.log('file url', file.url);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
