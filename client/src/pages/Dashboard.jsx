import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Briefcase, Clock3, ArrowUpRight } from 'lucide-react';
import api from '../lib/api.js';

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    api.get('/jobs/mine').then(r => setJobs(r.data.jobs));
  }, []);

  const toggleStatus = async (job) => {
    const nextStatus = job.status === 'open' ? 'closed' : 'open';
    setUpdatingId(job._id);
    try {
      const r = await api.patch(`/jobs/${job._id}`, { status: nextStatus });
      setJobs(prev => prev.map(j => (j._id === job._id ? r.data.job : j)));
    } catch (err) {
      console.error('Failed to update job status', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="page">
      <div className="dash-head">
        <div>
          <p className="eyebrow">RECRUITER WORKSPACE</p>
          <h1>Good hiring starts here.</h1>
          <p>Manage your roles and keep every candidate moving.</p>
        </div>
        <Link className="btn" to="/post-job"><Plus size={17} /> Post a job</Link>
      </div>

      <div className="metric-grid">
        <div>
          <span><Briefcase />Open roles</span>
          <b>{jobs.filter(j => j.status === 'open').length}</b>
          <small>Across your team</small>
        </div>
        <div>
          <span><Users />Applicants</span>
          <b>{jobs.reduce((a, j) => a + (j.applicants || 0), 0)}</b>
          <small>Total applications</small>
        </div>
        <div>
          <span><Clock3 />Active listings</span>
          <b>{jobs.length}</b>
          <small>Recently published</small>
        </div>
      </div>

      <section className="table-card">
        <div className="table-head">
          <h2>Your job listings</h2>
          <span>{jobs.length} roles</span>
        </div>
        {jobs.length ? (
          <div className="job-table">
            {jobs.map(j => (
              <div className="table-row" key={j._id}>
                <div className="row-title">
                  <div className="company-logo">{j.company[0]}</div>
                  <div>
                    <b>{j.title}</b>
                    <span>{j.location} · {j.type}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className={`status-toggle status-${j.status}`}
                  onClick={() => toggleStatus(j)}
                  disabled={updatingId === j._id}
                  title={`Click to mark as ${j.status === 'open' ? 'closed' : 'open'}`}
                >
                  {updatingId === j._id ? 'Updating…' : j.status}
                </button>

                <span>{j.applicants || 0} applicants</span>
                <Link to={`/jobs/${j._id}`} className="arrow"><ArrowUpRight /></Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">No jobs yet. Publish your first role.</div>
        )}
      </section>
    </main>
  );
}
