import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const isProtectedRoute = createRouteMatcher([
  ':local/events/create',
  ':local/events/(.*)/update',
  ':local/profile',
]);

// /api routes will handle their own auth if necessary
const isApiRoute = createRouteMatcher(['/api/(.*)']);

const handleI18nRouting = createMiddleware(routing);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Exclude api/ routes from i18n routing
  if (isApiRoute(req)) {
    console.log('API route accessed');
    return; // Let the API route handle the response
  }

  return handleI18nRouting(req);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
