import { createMocks } from 'node-mocks-http';
import middleware from '@/middleware';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

jest.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: (handler: unknown) => handler,
  createRouteMatcher: (routes: string[]) => (req: NextRequest) => {
    const url = new URL(` http://localhost:3000${req.url}`);
    return routes.some((route) =>
      new RegExp(route.replace(':local', '')).test(url.pathname)
    );
  },
}));

jest.mock('next-intl/middleware', () => () => () => {
  return NextResponse.next();
});

describe('middleware', () => {
  it('should protect protected routes', async () => {
    const { req } = createMocks({
      method: 'GET',
      url: '/en/events/create',
    });

    const auth = {
      ...createMocks().req,
      protect: jest.fn(),
    };

    await middleware(auth, req as unknown as NextFetchEvent);

    expect(auth.protect).toHaveBeenCalled();
  });

  it('should bypass i18n routing for API routes', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/api/uploadthing/some-endpoint',
    });

    const auth = {
      ...createMocks().req,
      protect: jest.fn(),
    };

    await middleware(auth, req as unknown as NextFetchEvent);

    expect(auth.protect).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200);
  });

  it('should apply i18n routing for non-API routes', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/some-page',
    });

    const auth = {
      ...createMocks().req,
      protect: jest.fn(),
    };

    await middleware(auth, req as unknown as NextFetchEvent);

    expect(auth.protect).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200);
  });
});
