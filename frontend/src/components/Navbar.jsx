import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" className="brand">
          Foundry<span className="brand-mark">Goods</span>
        </NavLink>
        <div className="nav-links">
          <NavLink to="/" end>
            Catalog
          </NavLink>
          {user && (
            <NavLink to="/cart">
              Cart{itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </NavLink>
          )}
          {isAdmin && <NavLink to="/admin">Admin</NavLink>}
          {user ? (
            <button
              className="btn btn-outline"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Sign out
            </button>
          ) : (
            <NavLink to="/login" className="btn btn-outline">
              Sign in
            </NavLink>
          )}
        </div>
      </div>
    </div>
  );
}
