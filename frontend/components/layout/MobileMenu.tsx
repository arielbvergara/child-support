'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { NAV_LINKS, SERVICE_CATALOG } from '@/lib/constants';
import { getLocalizedPath } from '@/lib/pathnames';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export function MobileMenu({ isOpen, onClose, locale, triggerRef }: MobileMenuProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const [isServicesExpanded, setIsServicesExpanded] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const didOpenRef = useRef(false);

  // Close on ESC key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Focus management: move focus into dialog on open, restore to trigger on close.
  // didOpenRef guards against calling triggerRef.focus() on the initial render
  // when isOpen is already false (which would steal focus from the page).
  useEffect(() => {
    if (isOpen) {
      didOpenRef.current = true;
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
    } else if (didOpenRef.current) {
      triggerRef.current?.focus();
    }
  }, [isOpen, triggerRef]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-warm-900/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.mobileMenuLabel')}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col bg-surface shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <span className="font-display text-lg font-bold text-foreground">
                Menu
              </span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label={t('nav.closeMenu')}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-warm-600 transition-colors hover:bg-warm-100 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto p-6">
              <ul className="space-y-1">
                {NAV_LINKS.filter(x => !x.hideMobile).map((link) => {
                  if (link.dropdown) {
                    const isServicesActive = pathname.startsWith(`/${locale}/services`);
                    return (
                      <li key={link.href}>
                        <button
                          type="button"
                          onClick={() => setIsServicesExpanded((prev) => !prev)}
                          aria-expanded={isServicesExpanded}
                          aria-controls="services-mobile-menu"
                          aria-current={isServicesActive ? 'page' : undefined}
                          className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                            isServicesActive
                              ? 'bg-primary-light text-primary'
                              : 'text-warm-700 hover:bg-warm-100 hover:text-foreground'
                          }`}
                        >
                          {t(link.labelKey)}
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              isServicesExpanded ? 'rotate-180' : ''
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                        {isServicesExpanded && (
                          <ul id="services-mobile-menu" className="mt-1 space-y-0.5 pl-4">
                            {SERVICE_CATALOG.map((service) => {
                              const serviceHref = `/${locale}/services/${service.slug}`;
                              const isServiceActive = pathname === serviceHref;
                              return (
                                <li key={service.slug}>
                                  <Link
                                    href={serviceHref}
                                    onClick={onClose}
                                    className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                                      isServiceActive
                                        ? 'bg-primary-light text-primary'
                                        : 'text-warm-700 hover:bg-warm-100 hover:text-foreground'
                                    }`}
                                  >
                                    {t(`services.${service.id}.title`)}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  }

                  const resolvedPath = getLocalizedPath(link.href, locale);
                  const href = `/${locale}${resolvedPath === '/' ? '' : resolvedPath}`;
                  const isActive = pathname === href || (link.href === '/' && pathname === `/${locale}`);
                  return (
                    <li key={link.href}>
                      <Link
                        href={href}
                        onClick={onClose}
                        aria-current={isActive ? 'page' : undefined}
                        className={`block rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                          isActive
                            ? 'bg-primary-light text-primary'
                            : 'text-warm-700 hover:bg-warm-100 hover:text-foreground'
                        }`}
                      >
                        {t(link.labelKey)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* CTA */}
            <div className="border-t border-border p-6">
              <Button
                href={`/${locale}${getLocalizedPath('/make-an-appointment', locale)}`}
                variant="primary"
                size="md"
                className="w-full"
                onClick={onClose}
              >
                {t('nav.bookConsultation')}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
