interface LegalPageProps {
  tag: string;
  title: string;
  lastUpdate: string;
  children: React.ReactNode;
}

export function LegalPage({ tag, title, lastUpdate, children }: LegalPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">{tag}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">Última atualização: {lastUpdate}</p>
      </div>
      <div className="flex flex-col gap-8 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  );
}
