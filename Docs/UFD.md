User Flow Document
Product: EduChain ID
1. User Types

EduChain ID supports three main user roles:

Students
Institutions
Recruiters

Each role has different goals and navigation paths.

2. Student User Flow

Students are the primary users of the platform.

Their journey focuses on:

building a verified academic identity

showcasing achievements

collaborating with peers

Student Journey Overview
Signup
 ↓
Institution Verification
 ↓
Profile Setup
 ↓
Explore Students
 ↓
Collaborate
 ↓
Build Verified Profile
Flow 1: Student Registration

Goal: Create an account.

Open App
 ↓
Click "Sign Up"
 ↓
Enter Email + Password
 ↓
Verify Email
 ↓
Select Institution
 ↓
Account Created

System actions:

Create user account
Generate student profile
Assign role: student

Outcome:

Student account successfully created
Flow 2: Institution Verification

Goal: Confirm student belongs to an institution.

Student selects institution
 ↓
Enter student ID / institution email
 ↓
Submit verification request
 ↓
Institution approves
 ↓
Student marked as verified

System actions:

Verification request stored
Institution admin notified
Verification status updated

Outcome:

Student receives "Institution Verified" badge
Flow 3: Profile Setup

Goal: Build the student's digital identity.

Open Profile
 ↓
Add Bio
 ↓
Add Skills
 ↓
Add Projects
 ↓
Add Achievements
 ↓
Save Profile

System actions:

Update student profile
Store skills/projects/achievements

Outcome:

Student profile becomes discoverable
Flow 4: Credential Issuing (Student Perspective)

Goal: Receive verified credentials.

Institution issues credential
 ↓
System stores credential
 ↓
Student receives notification
 ↓
Credential appears in profile

Outcome:

Student profile shows verified academic record
Flow 5: Discover Students

Goal: Find collaborators.

Open Discover Screen
 ↓
Search students
 ↓
Apply filters
   Skills
   Institution
   Graduation year
 ↓
Browse student profiles

Outcome:

Student finds potential collaborators
Flow 6: Collaboration Request

Goal: Start a project collaboration.

Open student profile
 ↓
Click "Request Collaboration"
 ↓
Add message
 ↓
Send request

Receiver flow:

Receive request
 ↓
Accept / Reject

If accepted:

Group created

Outcome:

Students collaborate on projects
Flow 7: Create Project Group

Goal: Build collaborative projects.

Open Groups
 ↓
Click "Create Group"
 ↓
Enter group name
 ↓
Add description
 ↓
Invite students
 ↓
Create group

Outcome:

Project group created
Flow 8: Manage Privacy Settings

Goal: Control visibility of academic data.

Open Settings
 ↓
Privacy Settings
 ↓
Select visibility

Options:

Public
Recruiter Only
Private

Outcome:

Profile visibility updated
3. Institution User Flow

Institutions are responsible for credential verification and issuing academic records.

Institution Journey Overview
Institution Registration
 ↓
Admin Login
 ↓
Student Verification
 ↓
Issue Credentials
 ↓
Manage Records
Flow 1: Institution Registration

Goal: Onboard institution.

Apply for institution account
 ↓
Submit details
   Institution name
   Domain
   Admin email
 ↓
Platform verifies institution
 ↓
Institution account activated

Outcome:

Institution allowed to issue credentials
Flow 2: Institution Admin Login
Open dashboard
 ↓
Enter credentials
 ↓
Login successful

Outcome:

Access institution dashboard
Flow 3: Verify Student

Goal: Confirm student enrollment.

Open student verification list
 ↓
View pending requests
 ↓
Review student ID / email
 ↓
Approve / Reject

Outcome:

Student verification status updated
Flow 4: Issue Credential

Goal: Issue academic record.

Search student
 ↓
Click "Issue Credential"
 ↓
Enter credential details
 ↓
Submit

System actions:

Credential stored
Credential linked to student profile

Outcome:

Student receives verified credential
Flow 5: Revoke Credential

Goal: Correct errors in academic records.

Open credential history
 ↓
Select credential
 ↓
Click "Revoke"

Outcome:

Credential marked as revoked
4. Recruiter User Flow

Recruiters use the platform to discover verified student talent.

Recruiter Journey Overview
Signup
 ↓
Browse Students
 ↓
Filter Talent
 ↓
View Verified Profiles
 ↓
Shortlist Candidates
Flow 1: Recruiter Registration
Open recruiter signup
 ↓
Enter company details
 ↓
Verify email
 ↓
Account created

Outcome:

Recruiter dashboard access
Flow 2: Discover Students

Goal: Find potential candidates.

Open Talent Discovery
 ↓
Search students
 ↓
Apply filters

Filters:

Skills
Institution
Degree
Graduation year

Outcome:

Relevant student profiles displayed
Flow 3: View Student Profile

Goal: Evaluate candidate.

Click student profile
 ↓
View credentials
 ↓
View projects
 ↓
View achievements

Outcome:

Recruiter assesses candidate suitability
Flow 4: Verify Credential

Goal: confirm academic authenticity.

Open credential
 ↓
Click "Verify"
 ↓
System checks credential integrity

Outcome:

Credential verified
Flow 5: Shortlist Candidate

Goal: save candidate for hiring.

Click "Shortlist"
 ↓
Candidate added to recruiter shortlist

Outcome:

Recruiter builds candidate pipeline
5. Notification Flow

Events that trigger notifications:

Credential issued
Collaboration request received
Collaboration accepted
Institution verification completed

Delivery channels:

In-app notifications
Email notifications
6. Error Handling Flows

Examples:

Verification Failure
Student submits verification
 ↓
Institution rejects
 ↓
Student notified

Message:

Verification failed. Please contact your institution.
Credential Revocation
Institution revokes credential
 ↓
Student notified
 ↓
Credential marked revoked
7. Edge Case Flows
Student Changes Institution
Student updates institution
 ↓
New verification request sent
 ↓
Institution approves
Duplicate Student Accounts
System detects duplicate email
 ↓
Account creation blocked
8. Complete User Journey Map
Student
Signup → Verify Institution → Build Profile → Collaborate

Institution
Register → Verify Students → Issue Credentials

Recruiter
Signup → Discover Students → Verify Profiles → Shortlist
Final User Flow Summary
Students
Create Identity → Receive Credentials → Collaborate

Institutions
Verify Students → Issue Credentials

Recruiters
Search Talent → Verify Profiles