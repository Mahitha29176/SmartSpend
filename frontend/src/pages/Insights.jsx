import { useEffect, useState } from 'react';
import { fetchInsights } from '../services/dashboardService';
import { extractErrorMessage } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function Insights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setInsights(await fetchInsights());
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Spending insights</h1>
          <p>Calculated straight from your data with SQL — no AI involved.</p>
        </div>
      </div>

      <ErrorMessage>{error}</ErrorMessage>

      {loading ? <LoadingSpinner /> : insights.length === 0 ? (
        <div className="empty-state">
          <div className="title">Not enough data yet</div>
          <p>Add a few expenses across different months to unlock insights.</p>
        </div>
      ) : (
        <div>
          {insights.map((text, i) => (
            <div className="insight-item" key={i}>{text}</div>
          ))}
        </div>
      )}
    </>
  );
}
