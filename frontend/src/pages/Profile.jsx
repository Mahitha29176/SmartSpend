import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/format';

export default function Profile() {
  const { user } = useAuth();

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Profile</h1>
          <p>Your account details.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 460 }}>
        <div className="field">
          <label>Name</label>
          <input type="text" value={user?.name || ''} disabled />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="text" value={user?.email || ''} disabled />
        </div>
        {user?.created_at && (
          <div className="field">
            <label>Member since</label>
            <input type="text" value={formatDate(user.created_at)} disabled />
          </div>
        )}
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 8 }}>
          Profile editing isn't wired up yet — this page shows what's on file.
        </p>
      </div>
    </>
  );
}
