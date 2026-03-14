'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from './Button';
import { CheckCircle } from 'lucide-react';

type FormData = {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
};

const INITIAL_FORM_DATA: FormData = {
  name: '',
  email: '',
  phone: '',
  service: '',
  message: '',
};

export function ContactForm() {
  const t = useTranslations('contact.form');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setHasError(false);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        setHasError(true);
        return;
      }

      setSubmitted(true);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-sage-50 p-10 text-center">
        <CheckCircle className="h-12 w-12 text-primary" />
        <h3 className="font-display text-xl font-bold text-foreground">
          {t('successTitle')}
        </h3>
        <p className="text-warm-600">{t('successMessage')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-semibold text-warm-800"
          >
            {t('name')} <span aria-hidden="true" className="text-primary">*</span>
          </label>
          <input
            id="name"
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
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-semibold text-warm-800"
          >
            {t('email')} <span aria-hidden="true" className="text-primary">*</span>
          </label>
          <input
            id="email"
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
        <label
          htmlFor="phone"
          className="mb-1.5 block text-sm font-semibold text-warm-800"
        >
          {t('phone')}
        </label>
        <input
          id="phone"
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
        <label
          htmlFor="service"
          className="mb-1.5 block text-sm font-semibold text-warm-800"
        >
          {t('service')}
        </label>
        <select
          id="service"
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

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="mb-1.5 block text-sm font-semibold text-warm-800"
        >
          {t('message')} <span aria-hidden="true" className="text-primary">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          aria-required="true"
          rows={5}
          placeholder={t('messagePlaceholder')}
          value={formData.message}
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
          disabled={isLoading}
        >
          {isLoading ? t('submitting') : t('submit')}
        </Button>
        <p className="text-xs text-warm-500">{t('privacy')}</p>
      </div>

      {hasError && (
        <p role="alert" className="text-sm text-red-600">
          {t('errorMessage')}
        </p>
      )}
    </form>
  );
}
