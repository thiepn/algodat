import { Link } from 'react-router-dom';
import { hrefForResource, labelForResource } from './resource-links';

interface NextLearningActionsProps {
  title?: string;
  actions: Array<{
    resourceId: string;
    reason: string;
  }>;
}

export function NextLearningActions({
  title = 'Nächste sinnvolle Aktionen',
  actions,
}: NextLearningActionsProps) {
  const visible = actions.slice(0, 5);
  if (visible.length === 0) return null;
  return (
    <section className="next-actions" aria-labelledby="next-learning-actions">
      <div>
        <p className="eyebrow">Aktives Lernen</p>
        <h2 id="next-learning-actions">{title}</h2>
      </div>
      <div className="next-actions__grid">
        {visible.map((action) => (
          <Link
            className="next-action-card"
            key={action.resourceId}
            to={hrefForResource(action.resourceId)}
          >
            <strong>{labelForResource(action.resourceId)}</strong>
            <span>{action.reason}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
