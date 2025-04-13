/\*\*

- AUTH ROUTES
  \*/

// Register a user
POST /api/auth/register
// Login user
POST /api/auth/login
// Verify email with OTP
POST /api/auth/verify-email
// Resend verification OTP
POST /api/auth/resend-otp
// Get current user
GET /api/auth/me

/\*\*

- ADMIN ROUTES
  \*/

// Create a new organization
POST /api/admin/organizations
// Get all organizations
GET /api/admin/organizations
// Get organization by ID
GET /api/admin/organizations/:id
// Update organization
PUT /api/admin/organizations/:id
// Assign committee members
POST /api/admin/organizations/:id/committee

/\*\*

- COMMITTEE ROUTES
  \*/

// Create a new election
POST /api/committee/elections
// Get elections for organization
GET /api/committee/organizations/:orgId/elections
// Get election by ID
GET /api/committee/elections/:id
// Update election details
PUT /api/committee/elections/:id
// Generate registration/nomination/voting links
POST /api/committee/elections/:id/generate-links

// Create posts/positions
POST /api/committee/elections/:id/posts
// Get posts for an election
GET /api/committee/elections/:id/posts
// Update post
PUT /api/committee/posts/:id

// Get nominations for approval
GET /api/committee/elections/:id/nominations
// Approve/reject nomination
PUT /api/committee/nominations/:id/status

// Get election results
GET /api/committee/elections/:id/results
// Export results as PDF/CSV
GET /api/committee/elections/:id/export

/\*\*

- CANDIDATE ROUTES
  \*/

// Submit nomination
POST /api/candidate/nominations
// Upload payment receipt
POST /api/candidate/nominations/:id/payment
// Get nomination status
GET /api/candidate/nominations/status
// Update candidate agenda
PUT /api/candidate/nominations/:id/agenda

/\*\*

- VOTER ROUTES
  \*/

// Register as voter
POST /api/voter/register
// Get election details for voting
GET /api/voter/elections/:link
// Cast vote
POST /api/voter/elections/:id/vote
// Verify if already voted
GET /api/voter/elections/:id/check-vote

├── README.md
├── presentation.pptx
├── client/
│ ├── public/
│ └── src/
│ ├── components/
│ │ ├── common/
│ │ │ ├── Button.jsx
│ │ │ ├── FormInput.jsx
│ │ │ ├── Modal.jsx
│ │ │ ├── Navbar.jsx
│ │ │ └── Sidebar.jsx
│ │ ├── admin/
│ │ │ ├── CreateOrganization.jsx
│ │ │ ├── OrganizationList.jsx
│ │ │ └── AssignCommittee.jsx
│ │ ├── committee/
│ │ │ ├── CreateElection.jsx
│ │ │ ├── ManagePosts.jsx
│ │ │ ├── NominationApproval.jsx
│ │ │ ├── GenerateLinks.jsx
│ │ │ └── ElectionResults.jsx
│ │ ├── candidate/
│ │ │ ├── NominationForm.jsx
│ │ │ ├── PaymentUpload.jsx
│ │ │ └── CandidateProfile.jsx
│ │ └── voter/
│ │ ├── VoterRegistration.jsx
│ │ └── BallotInterface.jsx
│ ├── pages/
│ │ ├── Home.jsx
│ │ ├── Login.jsx
│ │ ├── Register.jsx
│ │ ├── AdminDashboard.jsx
│ │ ├── CommitteeDashboard.jsx
│ │ ├── CandidateDashboard.jsx
│ │ └── VotingPage.jsx
│ ├── context/
│ │ └── AuthContext.jsx
│ ├── services/
│ │ ├── api.js
│ │ ├── auth.service.js
│ │ └── election.service.js
│ ├── utils/
│ │ ├── helpers.js
│ │ └── validators.js
│ ├── App.js
│ └── index.js
└── server/
├── config/
│ ├── db.js
│ └── default.json
├── controllers/
│ ├── admin.controller.js
│ ├── auth.controller.js
│ ├── committee.controller.js
│ ├── candidate.controller.js
│ └── voter.controller.js
├── middleware/
│ ├── auth.middleware.js
│ └── upload.middleware.js
├── models/
│ ├── User.js
│ ├── Organization.js
│ ├── Election.js
│ ├── Post.js
│ ├── Nomination.js
│ └── Vote.js
├── routes/
│ ├── admin.routes.js
│ ├── auth.routes.js
│ ├── committee.routes.js
│ ├── candidate.routes.js
│ └── voter.routes.js
├── utils/
│ ├── linkGenerator.js
│ └── emailService.js
├── app.js
└── server.js
