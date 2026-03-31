import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthGuard } from './components/auth/AuthGuard'
import { RoleGuard } from './components/auth/RoleGuard'

import { LandingPage } from './pages/landing/LandingPage'
import { RecruiterLogin, RecruiterRegister } from './pages/auth/RecruiterAuth'
import { JobSeekerLogin, JobSeekerRegister } from './pages/auth/JobSeekerAuth'

import { RecruiterLayout } from './layouts/RecruiterLayout'
import { JobSeekerLayout } from './layouts/JobSeekerLayout'

import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard'
import { JobPostingCreate } from './pages/recruiter/JobPostingCreate'
import { JobPostingEdit } from './pages/recruiter/JobPostingEdit'
import { JobApplicants } from './pages/recruiter/JobApplicants'
import { RecruiterProfile } from './pages/recruiter/RecruiterProfile'

import { JobSeekerDashboard } from './pages/seeker/JobSeekerDashboard'
import { JobDiscovery } from './pages/seeker/JobDiscovery'
import { JobDetail } from './pages/seeker/JobDetail'
import { MyApplications } from './pages/seeker/MyApplications'
import { JobSeekerProfile } from './pages/seeker/JobSeekerProfile'

import { ScreeningTest } from './pages/assessment/ScreeningTest'
import { AptitudeTest } from './pages/assessment/AptitudeTest'
import { CodingTest } from './pages/assessment/CodingTest'
import { AssessmentView } from './pages/assessment/AssessmentView'

import { InterviewLobby } from './pages/interview/InterviewLobby'
import { InterviewRoom } from './pages/interview/InterviewRoom'

import { MessagingInbox } from './pages/messaging/MessagingInbox'
import { ForumView } from './pages/forum/ForumView'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* Auth — role-specific */}
      <Route path="/auth/recruiter/login" element={<RecruiterLogin />} />
      <Route path="/auth/recruiter/register" element={<RecruiterRegister />} />
      <Route path="/auth/job-seeker/login" element={<JobSeekerLogin />} />
      <Route path="/auth/job-seeker/register" element={<JobSeekerRegister />} />

      {/* Recruiter */}
      <Route
        path="/recruiter"
        element={
          <AuthGuard>
            <RoleGuard role="recruiter">
              <RecruiterLayout />
            </RoleGuard>
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
        <Route path="dashboard" element={<RecruiterDashboard />} />
        <Route path="jobs/new" element={<JobPostingCreate />} />
        <Route path="jobs/:id/edit" element={<JobPostingEdit />} />
        <Route path="jobs/:id/applicants" element={<JobApplicants />} />
        <Route path="profile" element={<RecruiterProfile />} />
      </Route>

      {/* Job Seeker */}
      <Route
        path="/seeker"
        element={
          <AuthGuard>
            <RoleGuard role="job_seeker">
              <JobSeekerLayout />
            </RoleGuard>
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="/seeker/dashboard" replace />} />
        <Route path="dashboard" element={<JobSeekerDashboard />} />
        <Route path="jobs" element={<JobDiscovery />} />
        <Route path="jobs/:id" element={<JobDetail />} />
        <Route path="applications" element={<MyApplications />} />
        <Route path="profile" element={<JobSeekerProfile />} />
      </Route>

      {/* Assessments — accessible during flow */}
      <Route path="/assessment/screening/:applicationId" element={<ScreeningTest />} />
      <Route path="/assessment/aptitude/:applicationId" element={<AptitudeTest />} />
      <Route path="/assessment/coding/:applicationId" element={<CodingTest />} />
      <Route path="/assessment/:assessmentId" element={<AssessmentView />} />

      {/* HR Interview */}
      <Route path="/interview/lobby/:applicationId" element={<AuthGuard><InterviewLobby /></AuthGuard>} />
      <Route path="/interview/room/:applicationId" element={<AuthGuard><InterviewRoom /></AuthGuard>} />

      {/* Shared */}
      <Route path="/messages" element={<AuthGuard><MessagingInbox /></AuthGuard>} />
      <Route path="/forum" element={<ForumView />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
