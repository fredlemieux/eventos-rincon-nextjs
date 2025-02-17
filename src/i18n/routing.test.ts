import { routing } from './routing';
import { createNavigation } from 'next-intl/navigation';

describe('routing behavior', () => {
  it('should return the correct default locale when no locale matches', () => {
    const { defaultLocale } = routing;
    expect(defaultLocale).toBe('en');
  });

  it('should support the defined locales', () => {
    const { locales } = routing;
    expect(locales).toContain('en');
    expect(locales).toContain('es');
  });
});

describe('navigation behavior', () => {
  const { Link, redirect, usePathname, useRouter } = createNavigation(routing);

  it('should create navigation components', () => {
    expect(Link).toBeDefined();
    expect(redirect).toBeDefined();
    expect(usePathname).toBeDefined();
    expect(useRouter).toBeDefined();
  });
});
