import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client';

const EMPTY = {
  name: '',
  sku: '',
  description: '',
  category: '',
  price_cents: '',
  stock: '',
  image_url: '',
  material: '',
  is_active: true,
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    api
      .getProduct(id)
      .then((p) =>
        setForm({
          ...p,
          price_cents: (p.price_cents / 100).toFixed(2),
        })
      )
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function update(field) {
    return (e) => {
      const value = field === 'is_active' ? e.target.checked : e.target.value;
      setForm((f) => ({ ...f, [field]: value }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const payload = {
      name: form.name,
      sku: form.sku,
      description: form.description,
      category: form.category,
      price_cents: Math.round(Number(form.price_cents) * 100),
      stock: Number(form.stock),
      image_url: form.image_url || null,
      material: form.material || null,
      is_active: form.is_active,
    };
    try {
      if (isEdit) {
        await api.updateProduct(id, payload);
      } else {
        await api.createProduct(payload);
      }
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="loading-state">Loading product…</div>;

  return (
    <div>
      <h2 style={{ fontSize: '1.6rem', marginBottom: 24 }}>{isEdit ? 'Edit product' : 'Add product'}</h2>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
        <div className="form-field">
          <label>Name</label>
          <input required value={form.name} onChange={update('name')} />
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div className="form-field" style={{ flex: 1 }}>
            <label>SKU</label>
            <input required value={form.sku} onChange={update('sku')} />
          </div>
          <div className="form-field" style={{ flex: 1 }}>
            <label>Category</label>
            <input required value={form.category} onChange={update('category')} />
          </div>
        </div>
        <div className="form-field">
          <label>Description</label>
          <textarea value={form.description} onChange={update('description')} />
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div className="form-field" style={{ flex: 1 }}>
            <label>Price (USD)</label>
            <input required type="number" step="0.01" min="0" value={form.price_cents} onChange={update('price_cents')} />
          </div>
          <div className="form-field" style={{ flex: 1 }}>
            <label>Stock</label>
            <input required type="number" min="0" value={form.stock} onChange={update('stock')} />
          </div>
        </div>
        <div className="form-field">
          <label>Image URL</label>
          <input value={form.image_url || ''} onChange={update('image_url')} placeholder="https://…" />
        </div>
        <div className="form-field">
          <label>Material</label>
          <input value={form.material || ''} onChange={update('material')} />
        </div>
        <div className="form-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" checked={form.is_active} onChange={update('is_active')} style={{ width: 'auto' }} />
          <label style={{ margin: 0 }}>Visible in catalog</label>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/admin')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
