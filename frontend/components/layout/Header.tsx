'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Menu, Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MobileMenu } from './MobileMenu';
import { NAV_LINKS, SERVICE_PAGES, SITE_CONFIG } from '@/lib/constants';
import { clsx } from 'clsx';

interface HeaderProps {
  locale: string;
}

const localeLabels: Record<string, string> = {
  nl: 'NL',
  en: 'EN',
  de: 'DE',
};

export function Header({ locale }: HeaderProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentHash, setCurrentHash] = useState('');

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 10);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    function updateHash() {
      setCurrentHash(window.location.hash);
    }

    // Set the initial hash after mount and whenever the pathname changes
    // to avoid SSR/client mismatches and stale hash state.
    updateHash();

    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, [pathname]);

  // Get current page path without locale prefix for switching
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

  return (
    <>
      <header
        className={clsx(
          'sticky top-0 z-30 transition-all duration-200',
          isScrolled
            ? 'border-b border-border bg-surface/95 shadow-sm backdrop-blur-sm'
            : 'bg-surface/80 backdrop-blur-sm'
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded-md"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <span className="font-display text-lg font-bold text-foreground hidden sm:block">
              {SITE_CONFIG.name}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex md:items-center md:gap-1" aria-label="Main navigation">
            {NAV_LINKS.filter(x => !x.hideDesktop).map((link) => {
              if (link.dropdown) {
                const isServicesActive = pathname.startsWith(`/${locale}/services`);
                return (
                  <div key={link.href} className="group relative">
                    <button
                      type="button"
                      aria-haspopup="true"
                      className={clsx(
                        'flex cursor-pointer items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        isServicesActive
                          ? 'bg-primary-light font-semibold text-primary'
                          : 'text-warm-700 hover:bg-primary-light/50 hover:text-primary'
                      )}
                    >
                      {t(link.labelKey)}
                      <ChevronDown
                        className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
                        aria-hidden="true"
                      />
                    </button>
                    <div className="absolute left-0 top-full z-50 mt-1 hidden w-60 rounded-xl border border-border bg-surface py-2 shadow-lg group-hover:block group-focus-within:block">
                      {SERVICE_PAGES.map((service) => {
                        const serviceHref = `/${locale}/services/${service.slug}`;
                        const isServiceActive = pathname === serviceHref;
                        return (
                          <Link
                            key={service.slug}
                            href={serviceHref}
                            className={clsx(
                              'block px-4 py-2.5 text-sm transition-colors',
                              isServiceActive
                                ? 'bg-primary-light font-semibold text-primary'
                                : 'text-warm-700 hover:bg-primary-light hover:text-primary'
                            )}
                          >
                            {t(`services.${service.id}.title`)}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              const [linkBasePath, linkHash] = link.href.split('#');
              const href = linkHash
                ? `/${locale}${linkBasePath === '/' ? '' : linkBasePath}#${linkHash}`
                : `/${locale}${linkBasePath === '/' ? '' : linkBasePath}`;
              const localizedBase = `/${locale}${linkBasePath === '/' ? '' : linkBasePath}`;
              const isAnchorLink = Boolean(linkHash);
              const anchorNavActive = NAV_LINKS.some((l) => {
                const [lBase, lHash] = l.href.split('#');
                if (!lHash) return false;
                const lLocalizedBase = `/${locale}${lBase === '/' ? '' : lBase}`;
                return pathname === lLocalizedBase && currentHash === `#${lHash}`;
              });
              const isActive = isAnchorLink
                ? pathname === localizedBase && currentHash === `#${linkHash}`
                : link.href === '/'
                  ? pathname === `/${locale}` && !anchorNavActive
                  : pathname === `/${locale}${link.href}`;
              return (
                <Link
                  key={link.href}
                  href={href}
                  onClick={() => setCurrentHash(linkHash ? `#${linkHash}` : '')}
                  className={clsx(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-light text-primary font-semibold'
                      : 'text-warm-700 hover:bg-primary-light/50 hover:text-primary'
                  )}
                >
                  {t(link.labelKey)}
                </Link>
              );
            })}
          </nav>

          {/* Right side: language switcher + CTA */}
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <div className="relative hidden md:flex md:items-center md:gap-1">
              <Globe className="h-4 w-4 text-warm-500" aria-hidden="true" />
              {SITE_CONFIG.locales.map((loc) => (
                <Link
                  key={loc}
                  href={`/${loc}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`}
                  className={clsx(
                    'rounded px-1.5 py-0.5 text-xs font-semibold transition-colors',
                    loc === locale
                      ? 'text-primary'
                      : 'text-warm-500 hover:text-foreground'
                  )}
                  aria-label={`Switch to ${loc.toUpperCase()}`}
                  aria-current={loc === locale ? 'true' : undefined}
                >
                  {localeLabels[loc]}
                </Link>
              ))}
            </div>

            <Button
              href={`/${locale}/contact`}
              variant="primary"
              size="sm"
              className="hidden md:inline-flex"
            >
              {t('hero.ctaPrimary')}
            </Button>

            {/* Mobile CTA — visible on small screens before the hamburger */}
            <Button
              href={`/${locale}/contact`}
              variant="primary"
              size="sm"
              className="inline-flex md:hidden"
            >
              {t('hero.ctaPrimary')}
            </Button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-warm-700 transition-colors hover:bg-warm-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        locale={locale}
      />
    </>
  );
}
