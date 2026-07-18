import { useEffect, useState } from 'react';
import { api, formatPrice } from '../../api/client';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.allOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state">Loading orders…</div>;

  return (
    <div>
      <h2 style={{ fontSize: '1.6rem', marginBottom: 24 }}>Orders ({orders.length})</h2>

      {orders.length === 0 ? (
        <div className="empty-state">No orders placed yet.</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Placed</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="mono">#{o.id.slice(-8).toUpperCase()}</td>
                <td>{o.items.reduce((sum, i) => sum + i.quantity, 0)} items</td>
                <td className="mono">{formatPrice(o.total_cents)}</td>
                <td>
                  <span className="badge active">{o.status}</span>
                </td>
                <td className="mono">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
