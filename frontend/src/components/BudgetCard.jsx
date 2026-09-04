import { formatCurrency } from '../utils/format';

export default function BudgetCard({ budget, onDelete }) {
  const pct = Math.min(budget.percent_used, 100);
  const over = budget.percent_used >= 100;
  const warning = budget.percent_used >= 80;

  return (
    <div className={`budget-card${over ? ' over' : ''}`}>
      <div className="cat">{budget.category}</div>
      <div className="figures">
        <span className="figure">{formatCurrency(budget.spent)} spent</span>
        <span className="figure">{formatCurrency(budget.budget_amount)} budget</span>
      </div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="figures" style={{ marginTop: 8, marginBottom: 0 }}>
        <span>{budget.percent_used}% used</span>
        <span className="figure">{formatCurrency(budget.remaining)} left</span>
      </div>
      {warning && (
        <div className="warning">
          ⚠ {budget.category} budget is {budget.percent_used}% used{over ? ' — over budget' : ''}.
        </div>
      )}
      <div className="row-actions" style={{ marginTop: 12 }}>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(budget)}>Delete</button>
      </div>
    </div>
  );
}
