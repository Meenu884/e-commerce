import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, formatPrice } from '../api/client';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { cart, refresh } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    address_line1: '',
    city: '',
    postal_code: '',
    country: '',
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const order = await api.checkout(form);
      await refresh();
      navigate('/order-confirmation', { state: { order } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ padding: '48px 24px 80px', maxWidth: 640 }}>
      <h2 style={{ marginBottom: 8 }}>Checkout</h2>
      <p className="mono" style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginBottom: 24 }}>
        This is a learning project — no real payment is processed. Submitting confirms the order directly.
      </p>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Full name</label>
          <input required value={form.full_name} onChange={update('full_name')} />
        </div>
        <div className="form-field">
          <label>Address</label>
          <input required value={form.address_line1} onChange={update('address_line1')} />
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div className="form-field" style={{ flex: 1 }}>
            <label>City</label>
            <input required value={form.city} onChange={update('city')} />
          </div>
          <div className="form-field" style={{ flex: 1 }}>
            <label>Postal code</label>
            <input required value={form.postal_code} onChange={update('postal_code')} />
          </div>
        </div>
        <div className="form-field">
          <label>Country</label>
          <input required value={form.country} onChange={update('country')} />
        </div>

        <div className="cart-summary" style={{ fontSize: '1rem', marginBottom: 24 }}>
          <span>Order total</span>
          <span>{formatPrice(cart.total_cents)}</span>
        </div>

        <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
          {submitting ? 'Placing order…' : 'Place order'}
        </button>
      </form>
    </div>
  );
}
