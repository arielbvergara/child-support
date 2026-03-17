'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronLeft, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import { Button } from './Button';
import { SCHEDULE_CONFIG } from '@/lib/constants';

type TimeSlot = {
  datetime: string;
};

type FormData = {
  name: string;
  email: string;
  phone: string;
  service: string;
  notes: string;
};

const INITIAL_FORM_DATA: FormData = {
  name: '',
  email: '',
  phone: '',
  service: '',
  notes: '',
};

// Reference Sunday (2024-01-07) used to derive locale-aware day-of-week labels.
// Offset by day index to get Sun=0, Mon=1, …, Sat=6.
const REFERENCE_SUNDAY = new Date(2024, 0, 7);

/**
 * Returns a YYYY-MM-DD key for the given date interpreted in the business timezone.
 * Using the business timezone (instead of the visitor's browser timezone) ensures that
 * slots are always bucketed under the correct calendar day, regardless of where the
 * visitor is located. The en-CA locale produces a reliable YYYY-MM-DD format.
 */
function toDateKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SCHEDULE_CONFIG.BUSINESS_TIMEZONE,
  }).format(date);
}

/**
 * Formats a slot time in the business timezone so the displayed time always matches
 * the Amsterdam local time that was booked — independent of the visitor's browser timezone.
 */
function formatTime(isoString: string, locale: string): string {
  return new Date(isoString).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: SCHEDULE_CONFIG.BUSINESS_TIMEZONE,
  });
}

/**
 * Formats a slot date in the business timezone for the same reason as formatTime.
 */
function formatDate(isoString: string, locale: string): string {
  return new Date(isoString).toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: SCHEDULE_CONFIG.BUSINESS_TIMEZONE,
  });
}

function buildCalendarWeeks(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay(); // 0 = Sunday

  const weeks: (Date | null)[][] = [];
  let week: (Date | null)[] = Array(startDow).fill(null);

  for (let d = 1; d <= lastDay.getDate(); d++) {
    week.push(new Date(year, month, d));
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return weeks;
}

export function AppointmentForm() {
  const t = useTranslations('appointment.form');
  const locale = useLocale();

  // Locale-aware day-of-week abbreviations (Sun–Sat) derived from Intl
  const dayLabels = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
      new Date(REFERENCE_SUNDAY.getTime() + i * 24 * 60 * 60 * 1000),
    ),
  );

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [slotsError, setSlotsError] = useState(false);

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDatetime, setSelectedDatetime] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [slotUnavailable, setSlotUnavailable] = useState(false);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${apiUrl}/appointments/availability`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch slots');
        return res.json() as Promise<{ slots: TimeSlot[] }>;
      })
      .then(({ slots: fetchedSlots }) => setSlots(fetchedSlots))
      .catch(() => setSlotsError(true))
      .finally(() => setIsLoadingSlots(false));
  }, []);

  // Build a map: dateKey → slots[]
  const slotsByDate = slots.reduce<Record<string, TimeSlot[]>>((acc, slot) => {
    const key = toDateKey(new Date(slot.datetime));
    if (!acc[key]) acc[key] = [];
    acc[key].push(slot);
    return acc;
  }, {});

  const availableDates = new Set(Object.keys(slotsByDate));

  const today = toDateKey(new Date());

  function handlePrevMonth() {
    setCalendarMonth(({ year, month }) => {
      if (month === 0) return { year: year - 1, month: 11 };
      return { year, month: month - 1 };
    });
  }

  function handleNextMonth() {
    setCalendarMonth(({ year, month }) => {
      if (month === 11) return { year: year + 1, month: 0 };
      return { year, month: month + 1 };
    });
  }

  const handleDateSelect = useCallback((dateKey: string) => {
    setSelectedDate(dateKey);
    setSelectedDatetime(null);
    setSlotUnavailable(false);
  }, []);

  function handleTimeSelect(datetime: string) {
    setSelectedDatetime(datetime);
    setSlotUnavailable(false);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDatetime) return;

    setIsSubmitting(true);
    setHasError(false);
    setSlotUnavailable(false);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, datetime: selectedDatetime }),
      });

      if (response.status === 422) {
        const body = (await response.json()) as { errors: Array<{ field: string }> };
        const isSlotError = body.errors.some((err) => err.field === 'datetime');
        if (isSlotError) {
          setSlotUnavailable(true);
          // Remove the taken slot from local list so UI reflects reality
          setSlots((prev) => prev.filter((s) => s.datetime !== selectedDatetime));
          setSelectedDatetime(null);
        } else {
          setHasError(true);
        }
        return;
      }

      if (!response.ok) {
        setHasError(true);
        return;
      }

      setSubmitted(true);
    } catch {
      setHasError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────

  if (submitted && selectedDatetime) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-sage-50 p-10 text-center">
        <CheckCircle className="h-12 w-12 text-primary" />
        <h3 className="font-display text-xl font-bold text-foreground">
          {t('successTitle')}
        </h3>
        <p className="text-warm-600">{t('successMessage')}</p>
        <p className="mt-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-warm-800 shadow-sm">
          {formatDate(selectedDatetime, locale)} — {formatTime(selectedDatetime, locale)}
        </p>
      </div>
    );
  }

  // ── Loading state ──────────────────────────────────────────────────────────

  if (isLoadingSlots) {
    return (
      <div className="flex items-center gap-3 text-warm-500 py-10">
        <Clock className="h-5 w-5 animate-pulse" />
        <span>{t('loadingSlots')}</span>
      </div>
    );
  }

  if (slotsError || slots.length === 0) {
    return (
      <p className="text-warm-600 py-6">{t('noSlotsAvailable')}</p>
    );
  }

  // ── Calendar grid ──────────────────────────────────────────────────────────

  const { year, month } = calendarMonth;
  const calendarWeeks = buildCalendarWeeks(year, month);
  // Locale-aware full month name for the calendar header
  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long' }).format(
    new Date(year, month, 1),
  );

  // Min/max months for navigation (today → +2 months)
  const now = new Date();
  const minYear = now.getFullYear();
  const minMonth = now.getMonth();
  const maxDate = new Date(now);
  maxDate.setMonth(maxDate.getMonth() + SCHEDULE_CONFIG.BOOKING_WINDOW_MONTHS);
  const maxYear = maxDate.getFullYear();
  const maxMonth = maxDate.getMonth();

  const canGoPrev = year > minYear || (year === minYear && month > minMonth);
  const canGoNext = year < maxYear || (year === maxYear && month < maxMonth);

  const timeSlotsForDate = selectedDate ? (slotsByDate[selectedDate] ?? []) : [];

  return (
    <div className="space-y-8">
      {/* Step 1 — Calendar */}
      <section>
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-warm-500">
          {t('stepDate')}
        </p>

        {/* Month navigation */}
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={!canGoPrev}
            aria-label={t('prevMonth')}
            className="rounded-lg p-1.5 text-warm-600 transition hover:bg-warm-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="font-semibold text-warm-800">
            {monthLabel} {year}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            disabled={!canGoNext}
            aria-label={t('nextMonth')}
            className="rounded-lg p-1.5 text-warm-600 transition hover:bg-warm-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Day-of-week headers — locale-aware abbreviations (Sun … Sat) */}
        <div className="grid grid-cols-7 mb-1">
          {dayLabels.map((label, i) => (
            <div key={i} className="text-center text-xs font-medium text-warm-400 py-1">
              {label}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="rounded-xl border border-border overflow-hidden">
          {calendarWeeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 divide-x divide-border border-b border-border last:border-b-0">
              {week.map((day, di) => {
                if (!day) {
                  return <div key={di} className="bg-warm-50 py-3" />;
                }
                const dateKey = toDateKey(day);
                const isAvailable = availableDates.has(dateKey);
                const isSelected = selectedDate === dateKey;
                const isPast = dateKey < today;

                return (
                  <button
                    key={di}
                    type="button"
                    onClick={() => isAvailable && !isPast && handleDateSelect(dateKey)}
                    disabled={!isAvailable || isPast}
                    aria-label={dateKey}
                    aria-pressed={isSelected}
                    className={[
                      'py-3 text-sm font-medium transition-colors text-center',
                      isSelected
                        ? 'bg-primary text-white'
                        : isAvailable && !isPast
                          ? 'bg-white text-warm-800 hover:bg-sage-50 cursor-pointer'
                          : 'bg-warm-50 text-warm-300 cursor-not-allowed',
                    ].join(' ')}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {/* Step 2 — Time slots (shown after date selection) */}
      {selectedDate && (
        <section>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-warm-500">
            {t('stepTime')}
          </p>
          {timeSlotsForDate.length === 0 ? (
            <p className="text-warm-600 text-sm">{t('noSlotsAvailable')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {timeSlotsForDate.map((slot) => {
                const isSelected = selectedDatetime === slot.datetime;
                return (
                  <button
                    key={slot.datetime}
                    type="button"
                    onClick={() => handleTimeSelect(slot.datetime)}
                    aria-pressed={isSelected}
                    className={[
                      'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                      isSelected
                        ? 'border-primary bg-primary text-white'
                        : 'border-border bg-white text-warm-700 hover:border-primary hover:text-primary',
                    ].join(' ')}
                  >
                    {formatTime(slot.datetime, locale)}
                  </button>
                );
              })}
            </div>
          )}
          {slotUnavailable && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {t('slotUnavailable')}
            </p>
          )}
        </section>
      )}

      {/* Step 3 — Personal details (shown after time selection) */}
      {selectedDatetime && (
        <section>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-warm-500">
            {t('stepDetails')}
          </p>

          {/* Summary chip */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-sage-50 px-4 py-2 text-sm text-warm-700">
            <Clock className="h-4 w-4 text-primary" />
            <span>
              {formatDate(selectedDatetime, locale)} — {formatTime(selectedDatetime, locale)}
            </span>
            <button
              type="button"
              onClick={() => setSelectedDatetime(null)}
              className="ml-1 text-xs text-warm-400 underline hover:text-warm-600"
            >
              {t('changeDate')}
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Name */}
              <div>
                <label htmlFor="appt-name" className="mb-1.5 block text-sm font-semibold text-warm-800">
                  {t('name')} <span aria-hidden="true" className="text-primary">*</span>
                </label>
                <input
                  id="appt-name"
                  name="name"
                  type="text"
                  required
                  aria-required="true"
                  placeholder={t('namePlaceholder')}
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder-warm-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="appt-email" className="mb-1.5 block text-sm font-semibold text-warm-800">
                  {t('email')} <span aria-hidden="true" className="text-primary">*</span>
                </label>
                <input
                  id="appt-email"
                  name="email"
                  type="email"
                  required
                  aria-required="true"
                  placeholder={t('emailPlaceholder')}
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder-warm-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="appt-phone" className="mb-1.5 block text-sm font-semibold text-warm-800">
                {t('phone')}
              </label>
              <input
                id="appt-phone"
                name="phone"
                type="tel"
                placeholder={t('phonePlaceholder')}
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder-warm-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Service */}
            <div>
              <label htmlFor="appt-service" className="mb-1.5 block text-sm font-semibold text-warm-800">
                {t('service')}
              </label>
              <select
                id="appt-service"
                name="service"
                value={formData.service}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">{t('serviceDefault')}</option>
                <option value="individual">{t('serviceOptions.individual')}</option>
                <option value="workshops">{t('serviceOptions.workshops')}</option>
                <option value="assessment">{t('serviceOptions.assessment')}</option>
                <option value="school">{t('serviceOptions.school')}</option>
                <option value="other">{t('serviceOptions.other')}</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="appt-notes" className="mb-1.5 block text-sm font-semibold text-warm-800">
                {t('notes')}
              </label>
              <textarea
                id="appt-notes"
                name="notes"
                rows={3}
                placeholder={t('notesPlaceholder')}
                value={formData.notes}
                onChange={handleChange}
                className="w-full resize-y rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder-warm-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('submitting') : t('submit')}
              </Button>
              <p className="text-xs text-warm-500">{t('privacy')}</p>
            </div>

            {hasError && (
              <p role="alert" className="text-sm text-red-600">
                {t('errorMessage')}
              </p>
            )}
          </form>
        </section>
      )}
    </div>
  );
}
