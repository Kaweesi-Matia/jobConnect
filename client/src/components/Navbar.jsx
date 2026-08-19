import { Briefcase, LogOut, Plus, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <header className="nav">
      <Link to="/" className="brand">
        <span className="logo"><Briefcase size={19} /></span>
        Job<span>Connect</span>
      </Link>

      <nav>
        <Link to="/jobs"><Search size={16} />Find Jobs</Link>
        {user?.role === 'candidate' && <Link to="/applications">Applications</Link>}
        {user?.role === 'recruiter' && (
          <>
            <Link to="/recruiter">Dashboard</Link>
            <Link to="/post-job" className="post"><Plus size={16} />Post a Job</Link>
          </>
        )}
      </nav>

      <div className="nav-user">
        {user ? (
          <>
            <div className="avatar">{user.name[0]}</div>
            <button className="btn ghost small logout-btn" onClick={() => { logout(); nav('/'); }}>
              <LogOut size={16} /> Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="login">Log in</Link>
            <Link to="/register" className="btn small">Get Started</Link>
          </>
        )}
      </div>
    </header>
  );
}
