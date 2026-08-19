import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import api from '../lib/api.js';
import JobCard from '../components/JobCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appliedIds, setAppliedIds] = useState(new Set());

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};

      if (q.trim()) {
        params.q = q.trim();
      }

      if (type) {
        params.type = type;
      }

      if (location.trim()) {
        params.location = location.trim();
      }

      if (experience) {
        params.experience = experience;
      }

      const response = await api.get('/jobs', {
        params
      });

      setJobs(response.data.jobs || []);
    } catch (err) {
      console.error('Failed to load jobs:', err);

      setJobs([]);

      setError(
        err.response?.data?.message ||
        'Unable to load jobs. Please make sure the server and database are running.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [type, experience]);

  // Know which jobs this candidate already applied to, so cards can show "Applied"
  useEffect(() => {
    if (user?.role !== 'candidate') {
      setAppliedIds(new Set());
      return;
    }
    api.get('/applications/mine')
      .then(r => setAppliedIds(new Set(r.data.map(a => a.job?._id))))
      .catch(() => {});
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadJobs();
  };

  return (
    <main className="page">

      <div className="jobs-heading">
        <div>
          <p className="eyebrow">OPPORTUNITIES</p>

          <h1>Find work that moves you forward.</h1>

          <p>
            Search thousands of roles from teams hiring right now.
          </p>
        </div>
      </div>

      <form className="searchbar" onSubmit={handleSearch}>

        <Search />

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, company or keyword"
        />

        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All job types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
          <option value="Remote">Remote</option>
        </select>

        <select
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
        >
          <option value="">All experience levels</option>
          <option value="Entry-level">Entry-level</option>
          <option value="Mid-level">Mid-level</option>
          <option value="Senior">Senior</option>
          <option value="Lead">Lead</option>
        </select>

        <button className="btn" type="submit">
          <SlidersHorizontal size={16} />
          Search
        </button>

      </form>

      <div className="results-head">
        <b>
          {jobs.length} position{jobs.length !== 1 ? 's' : ''}
        </b>

        <span>
          Curated opportunities for ambitious people
        </span>
      </div>

      {loading && (
        <div className="loading">
          Loading opportunities…
        </div>
      )}

      {!loading && error && (
        <div className="empty">
          <h3>Unable to load jobs</h3>

          <p>{error}</p>

          <button
            className="btn"
            onClick={loadJobs}
            type="button"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div className="empty">
          <h3>No jobs found</h3>

          <p>
            There are currently no open jobs matching your search.
          </p>

          {(q || type || location || experience) && (
            <button
              className="btn"
              type="button"
              onClick={() => {
                setQ('');
                setType('');
                setLocation('');
                setExperience('');
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {!loading && !error && jobs.length > 0 && (
        <div className="jobs-list">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              user={user}
              applied={appliedIds.has(job._id)}
            />
          ))}
        </div>
      )}

    </main>
  );
}