interface PrintCardProps {
  electionType: "gerais" | "municipais";
  general: Record<string, string>;
  municipal: Record<string, string>;
  activeGeneralOffices: readonly { key: string; label: string }[];
}

const MUNICIPAL_OFFICES = [
  { key: "vereador", label: "Vereador(a)" },
  { key: "prefeito", label: "Prefeito(a)" },
] as const;

export function PrintCard({ electionType, general, municipal, activeGeneralOffices }: PrintCardProps) {
  const rows =
    electionType === "gerais"
      ? activeGeneralOffices.filter(({ key }) => general[key])
      : MUNICIPAL_OFFICES.filter(({ key }) => municipal[key]);

  const activeMap: Record<string, string> = electionType === "gerais" ? general : municipal;
  const subtitle = electionType === "gerais" ? "Eleições Gerais" : "Eleições Municipais";

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", fontFamily: "sans-serif" }}>
      <div style={{ background: "#2e7d5b", color: "#fff", padding: "16px 24px", textAlign: "center", borderRadius: "12px 12px 0 0" }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>Minha Cola Eleitoral</p>
        <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.85 }}>{subtitle} · Smart Politics</p>
      </div>
      <div style={{ border: "2px solid #2e7d5b", borderTop: "none", borderRadius: "0 0 12px 12px", overflow: "hidden" }}>
        {rows.map(({ key, label }) => (
          <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid #e5e7eb" }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280" }}>
              {label}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{activeMap[key]}</span>
          </div>
        ))}
        <div style={{ padding: "12px 20px", textAlign: "center" }}>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>smartpolitics.com.br</span>
        </div>
      </div>
    </div>
  );
}
