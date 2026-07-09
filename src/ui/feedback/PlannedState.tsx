export function PlannedState({ title, description }: { title: string; description: string }) {
  return (
    <section className="planned-state" aria-labelledby="planned-title">
      <p className="eyebrow">Spätere Ausbaustufe</p>
      <h1 id="planned-title">{title}</h1>
      <p>{description}</p>
      <p className="notice">
        Diese Ansicht enthält bewusst keine erfundenen Lern- oder Fortschrittsdaten.
      </p>
    </section>
  );
}
