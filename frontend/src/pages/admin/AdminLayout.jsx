import { NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="container admin-shell">
      <nav className="admin-nav">
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          Admin
        </div>
        <NavLink to="/admin" end>
          Products
        </NavLink>
        <NavLink to="/admin/products/new">Add product</NavLink>
        <NavLink to="/admin/orders">Orders</NavLink>
      </nav>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
