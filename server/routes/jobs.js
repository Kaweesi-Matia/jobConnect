import { Router } from 'express';

import {
  listJobs,
  getJob,
  createJob,
  myJobs,
  updateJob,
  deleteJob
} from '../controllers/jobs.js';

import {
  protect,
  allow
} from '../middleware/auth.js';

const router = Router();


// Public routes

// Find/search jobs
router.get('/', listJobs);

// Recruiter routes

// Recruiter's jobs
// NOTE: must be declared before '/:id' below, otherwise Express matches
// GET /jobs/mine to the '/:id' route with id="mine" and throws a CastError.
router.get(
  '/mine',
  protect,
  allow('recruiter'),
  myJobs
);

// Get a single job
router.get('/:id', getJob);

// Create job
router.post(
  '/',
  protect,
  allow('recruiter'),
  createJob
);

// Update job
router.patch(
  '/:id',
  protect,
  allow('recruiter'),
  updateJob
);

// Delete job
router.delete(
  '/:id',
  protect,
  allow('recruiter'),
  deleteJob
);

export default router;