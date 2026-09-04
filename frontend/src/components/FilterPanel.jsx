import { CATEGORIES, PAYMENT_METHODS } from '../utils/constants';

export default function FilterPanel({ filters, onChange, onReset }) {
  function set(field, value) {
    onChange({ ...filters, [field]: value });
  }

  return (
    <div className="filter-panel">
      <div className="field">
        <label>Search description</label>
        <input type="text" placeholder="e.g. groceries" value={filters.search || ''} onChange={(e) => set('search', e.target.value)} />
      </div>

      <div className="field">
        <label>Category</label>
        <select value={filters.category || ''} onChange={(e) => set('category', e.target.value)}>
          <option value="">All</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="field">
        <label>Payment method</label>
        <select value={filters.payment_method || ''} onChange={(e) => set('payment_method', e.target.value)}>
          <option value="">All</option>
          {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="field">
        <label>From</label>
        <input type="date" value={filters.start_date || ''} onChange={(e) => set('start_date', e.target.value)} />
      </div>

      <div className="field">
        <label>To</label>
        <input type="date" value={filters.end_date || ''} onChange={(e) => set('end_date', e.target.value)} />
      </div>

      <div className="field">
        <label>Min ₹</label>
        <input type="number" min="0" value={filters.min_amount || ''} onChange={(e) => set('min_amount', e.target.value)} />
      </div>

      <div className="field">
        <label>Max ₹</label>
        <input type="number" min="0" value={filters.max_amount || ''} onChange={(e) => set('max_amount', e.target.value)} />
      </div>

      <div className="field">
        <label>Sort by</label>
        <select value={filters.sort_by || 'date'} onChange={(e) => set('sort_by', e.target.value)}>
          <option value="date">Date</option>
          <option value="amount">Amount</option>
        </select>
      </div>

      <div className="field">
        <label>Order</label>
        <select value={filters.sort_dir || 'desc'} onChange={(e) => set('sort_dir', e.target.value)}>
          <option value="desc">Newest / highest first</option>
          <option value="asc">Oldest / lowest first</option>
        </select>
      </div>

      <div className="field" style={{ justifyContent: 'flex-end' }}>
        <label>&nbsp;</label>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onReset}>Clear filters</button>
      </div>
    </div>
  );
}
