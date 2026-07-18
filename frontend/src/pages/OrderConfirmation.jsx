import { Link, useLocation, Navigate } from 'react-router-dom';
import { formatPrice } from '../api/client';

export default function OrderConfirmation() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) return <Navigate to="/" replace />;

  return (
    <div className="container" style={{ padding: '60px 24px 100px', maxWidth: 640 }}>
      <div className="stamp" style={{ marginBottom: 24 }}>
        Order Confirmed
      </div>
      <h2>Thanks — it's on the way.</h2>
      <p className="mono" style={{ color: 'var(--ink-soft)', fontSize: '0.85rem', margin: '12px 0 32px' }}>
        Order #{order.id.slice(-8).toUpperCase()}
      </p>

      {order.items.map((item) => (
        <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
          <span>
            {item.name} <span className="mono" style={{ color: 'var(--ink-soft)' }}>× {item.quantity}</span>
          </span>
          <span className="mono">{formatPrice(item.price_cents * item.quantity)}</span>
        </div>
      ))}

      <div className="cart-summary">
        <span>Total</span>
        <span>{formatPrice(order.total_cents)}</span>
      </div>

      <div style={{ marginTop: 32 }}>
        <Link to="/" className="btn btn-outline">
          Continue browsing
        </Link>
      </div>
    </div>
  );
}
