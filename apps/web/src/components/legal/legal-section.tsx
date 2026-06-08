interface LegalSectionProps {
  title: string;
  children: React.ReactNode;
}

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <div>
      <h2 className="mb-3 text-base font-semibold text-foreground">{title}</h2>
      {children}
    </div>
  );
}
