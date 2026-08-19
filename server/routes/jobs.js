import { Router } from 'express';

import {
  listJobs,
  getJob,
  createJob,
  myJobs,
  updateJob
} from '../controllers/jobs.js';

import {
  protect,
  allow
} from '../middleware/auth.js';

const router = Router();


// Public routes

// Find/search jobs
router.get('/', listJobs);

// Get a single job
router.get('/:id', getJob);


// Recruiter routes

// Recruiter's jobs
router.get(
  '/mine',
  protect,
  allow('recruiter'),
  myJobs
);

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

export default router;