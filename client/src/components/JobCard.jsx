import { Bookmark, MapPin, Clock3, BriefcaseBusiness, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function JobCard({ job, user, applied }) {
  const isCandidate = user?.role === 'candidate';

  let cta;
  if (!user) {
    cta = <Link className="btn small" to="/login">Sign in to apply</Link>;
  } else if (!isCandidate) {
    // Recruiters browsing jobs don't apply
    cta = null;
  } else if (applied) {
    cta = <span className="app-status applied-pill"><CheckCircle2 size={13} /> Applied</span>;
  } else {
    cta = <Link className="btn small" to={`/jobs/${job._id}`}>Apply now <ArrowRight size={14} /></Link>;
  }

  return (
    <article className="job-card">
      <div className="company-logo">{job.company?.[0]}</div>
      <div className="job-main">
        <div className="job-top">
          <div>
            <Link className="job-title" to={`/jobs/${job._id}`}>{job.title}</Link>
            <p className="company">{job.company}</p>
          </div>
          <button className="save"><Bookmark size={18} /></button>
        </div>
        <div className="chips">
          <span>{job.type}</span>
          <span><MapPin size={13} />{job.location}</span>
          {job.experience && <span>{job.experience}</span>}
        </div>
        <p className="salary">{job.salaryMin || job.salaryMax ? `$${job.salaryMin || 0}k – $${job.salaryMax || 0}k` : 'Competitive salary'}</p>
        <div className="card-footer">
          <span><Clock3 size={14} />Posted {new Date(job.createdAt).toLocaleDateString()}</span>
          <span><BriefcaseBusiness size={14} />{job.applicants || 0} applicants</span>
        </div>
      </div>
      {cta && <div className="job-cta">{cta}</div>}
    </article>
  );
}
