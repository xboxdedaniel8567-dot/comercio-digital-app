import { AppHeader } from "@/components/AppHeader";

type LegalSection = {
  title: string;
  paragraphs: string[];
};

export function LegalPage({
  eyebrow,
  title,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <AppHeader />
      <main className="container section" style={{ maxWidth: 920 }}>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="muted" style={{ fontSize: "1.05rem", lineHeight: 1.7 }}>{intro}</p>
        <div style={{ display: "grid", gap: 14, marginTop: 28 }}>
          {sections.map((section) => (
            <section className="card" key={section.title}>
              <h2 style={{ fontSize: "1.25rem", marginTop: 0 }}>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p className="muted" key={paragraph} style={{ lineHeight: 1.7 }}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
