import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Briefcase, Clock, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const MAX_CV_SIZE = 5 * 1024 * 1024; // must match server/middleware/upload.js
const ALLOWED_EXT = ['.pdf', '.doc', '.docx'];

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [cover, setCover] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ type: '', text: '' }); // type: 'success' | 'error'
  const [submitting, setSubmitting] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`).then(r => setJob(r.data.job));
  }, [id]);

  // If the candidate already applied to this job, show that instead of the form
  useEffect(() => {
    if (user?.role !== 'candidate') return;
    api.get('/applications/mine')
      .then(r => {
        if (r.data.some(a => a.job?._id === id)) setAlreadyApplied(true);
      })
      .catch(() => {});
  }, [user, id]);

  if (!job) return <div className="loading">Loading role…</div>;

  const isClosed = job.status === 'closed';

  const pickFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    const ext = `.${f.name.split('.').pop().toLowerCase()}`;
    if (!ALLOWED_EXT.includes(ext)) {
      setStatus({ type: 'error', text: 'Only PDF, DOC and DOCX files are allowed.' });
      e.target.value = '';
      return;
    }
    if (f.size > MAX_CV_SIZE) {
      setStatus({ type: 'error', text: 'CV must be smaller than 5MB.' });
      e.target.value = '';
      return;
    }
    setStatus({ type: '', text: '' });
    setFile(f);
  };

  const apply = async () => {
    if (!user) return setStatus({ type: 'error', text: 'Please sign in as a candidate to apply.' });
    if (!file) return setStatus({ type: 'error', text: 'Please attach your CV.' });
    setSubmitting(true);
    setStatus({ type: '', text: '' });
    const fd = new FormData();
    fd.append('cv', file);
    fd.append('coverLetter', cover);
    try {
      await api.post(`/applications/job/${id}`, fd);
      setStatus({ type: 'success', text: 'Application submitted successfully.' });
      setAlreadyApplied(true);
    } catch (e) {
      const serverMsg = e.response?.data?.message;
      if (e.response?.status === 409) setAlreadyApplied(true);
      setStatus({ type: 'error', text: serverMsg || 'Unable to submit application. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page detail">
      <Link className="back" to="/jobs"><ArrowLeft size={16} /> Back to jobs</Link>
      <div className="detail-grid">
        <article>
          <div className="detail-hero">
            <div className="company-logo big">{job.company[0]}</div>
            <div>
              <p className="eyebrow">{job.company}</p>
              <h1>{job.title}</h1>
              <div className="chips">
                <span><MapPin size={13} />{job.location}</span>
                <span><Briefcase size={13} />{job.type}</span>
                <span><Clock size={13} />{job.experience}</span>
                {isClosed && <span className="status-toggle status-closed">Closed</span>}
              </div>
            </div>
          </div>
          <section className="prose">
            <h2>About the role</h2>
            <p>{job.description}</p>
            <h2>What you’ll bring</h2>
            <div className="skill-list">{job.skills?.map(s => <span key={s}>{s}</span>)}</div>
          </section>
        </article>

        <aside className="apply-card">
          {isClosed && !alreadyApplied ? (
            <>
              <h3>Applications closed</h3>
              <p>This role is no longer accepting applications. Check back later or browse other open roles.</p>
              <Link className="btn full ghost" to="/jobs">Browse open roles</Link>
            </>
          ) : user?.role === 'candidate' ? (
            alreadyApplied ? (
              <>
                <h3>Application submitted</h3>
                <p>You've already applied to this role. You can track its status from your dashboard.</p>
                <Link className="btn full" to="/applications">View my applications</Link>
              </>
            ) : (
              <>
                <h3>Ready to apply?</h3>
                <p>Show the team why you’re a great fit.</p>
                <label className="upload">
                  <Upload />
                  <span>{file ? file.name : 'Upload your CV'}</span>
                  <input type="file" accept=".pdf,.doc,.docx" onChange={pickFile} />
                </label>
                <textarea value={cover} onChange={e => setCover(e.target.value)} placeholder="Optional cover letter…" />
                <button className="btn full" onClick={apply} disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit application'}
                </button>
              </>
            )
          ) : (
            <>
              <h3>Ready to apply?</h3>
              <p>Show the team why you’re a great fit.</p>
              <Link className="btn full" to="/login">Sign in to apply</Link>
            </>
          )}
          {status.text && (
            <div className={status.type === 'error' ? 'error' : 'notice'}>
              {status.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              {status.text}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
