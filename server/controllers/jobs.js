import Job from '../models/Job.js';


// GET /api/jobs
// Public - find/search jobs
export const listJobs = async (req, res) => {
  try {
    const {
      q,
      type,
      location,
      experience,
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const filter = {
      status: 'open'
    };

    // Search by title, company, description or location
    if (q && q.trim()) {
      filter.$or = [
        {
          title: {
            $regex: q.trim(),
            $options: 'i'
          }
        },
        {
          company: {
            $regex: q.trim(),
            $options: 'i'
          }
        },
        {
          description: {
            $regex: q.trim(),
            $options: 'i'
          }
        },
        {
          location: {
            $regex: q.trim(),
            $options: 'i'
          }
        }
      ];
    }

    // Job type filter
    if (type && type.trim()) {
      filter.type = type.trim();
    }

    // Location filter
    if (location && location.trim()) {
      filter.location = {
        $regex: location.trim(),
        $options: 'i'
      };
    }

    // Experience filter
    if (experience && experience.trim()) {
      filter.experience = experience.trim();
    }

    // Sorting
    let sortObj = {
      createdAt: -1
    };

    if (sort === 'oldest') {
      sortObj = {
        createdAt: 1
      };
    }

    if (sort === 'salary') {
      sortObj = {
        salaryMax: -1
      };
    }

    // Pagination
    const currentPage = Math.max(Number(page) || 1, 1);
    const perPage = Math.min(
      Math.max(Number(limit) || 12, 1),
      100
    );

    const skip = (currentPage - 1) * perPage;

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate(
          'recruiter',
          'name company avatar'
        )
        .sort(sortObj)
        .skip(skip)
        .limit(perPage),

      Job.countDocuments(filter)
    ]);

    res.json({
      success: true,
      jobs,
      total,
      page: currentPage,
      pages: Math.ceil(total / perPage)
    });

  } catch (error) {
    console.error('List jobs error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to load jobs',
      error: error.message
    });
  }
};


// GET /api/jobs/:id
// Public - get one job
export const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate(
        'recruiter',
        'name company website bio'
      );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      job
    });

  } catch (error) {
    console.error('Get job error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to load job',
      error: error.message
    });
  }
};


// POST /api/jobs
// Recruiter only
export const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      description,
      location,
      type,
      experience,
      salaryMin,
      salaryMax,
      skills
    } = req.body;

    if (
      !title ||
      !description ||
      !location
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Title, description and location are required.'
      });
    }

    const job = await Job.create({
      title: title.trim(),

      company:
        company?.trim() ||
        req.user.company ||
        req.user.name,

      description: description.trim(),

      location: location.trim(),

      type: type || 'Full-time',

      experience:
        experience || 'Mid-level',

      salaryMin:
        salaryMin !== undefined &&
        salaryMin !== ''
          ? Number(salaryMin)
          : undefined,

      salaryMax:
        salaryMax !== undefined &&
        salaryMax !== ''
          ? Number(salaryMax)
          : undefined,

      skills: Array.isArray(skills)
        ? skills
        : [],

      recruiter: req.user._id,

      applicants: 0,

      featured: false,

      // IMPORTANT:
      // Every newly posted job is open.
      status: 'open'
    });

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      job
    });

  } catch (error) {
    console.error('Create job error:', error);

    res.status(400).json({
      success: false,
      message: 'Failed to create job',
      error: error.message
    });
  }
};


// GET /api/jobs/mine
// Recruiter only
export const myJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      recruiter: req.user._id
    })
      .sort({
        createdAt: -1
      });

    res.json({
      success: true,
      jobs
    });

  } catch (error) {
    console.error('My jobs error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to load your jobs',
      error: error.message
    });
  }
};


// PATCH /api/jobs/:id
// Recruiter only
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      {
        _id: req.params.id,
        recruiter: req.user._id
      },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      message: 'Job updated successfully',
      job
    });

  } catch (error) {
    console.error('Update job error:', error);

    res.status(400).json({
      success: false,
      message: 'Failed to update job',
      error: error.message
    });
  }
};