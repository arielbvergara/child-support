interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function FormSection({ title, subtitle, children }: FormSectionProps) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-6">
        {title}
      </h2>
      {subtitle && (
        <p className="text-warm-600 mb-8">{subtitle}</p>
      )}
      {children}
    </div>
  );
}
