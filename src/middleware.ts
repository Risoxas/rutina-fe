import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'es-MX'],
 
  // Used when no locale matches
  defaultLocale: 'es-MX'
});
 
export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(es-MX|en)/:path*']
};
