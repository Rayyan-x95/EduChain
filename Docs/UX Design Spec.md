UX Design Specification
Product: EduChain ID
1. UX Design Principles

The UX must prioritize identity clarity and trust.

Core principles:

Clarity over decoration
Fast navigation
Verification visibility
Minimal cognitive load
Mobile-first design

Key UX goals:

Students can build their identity quickly

Recruiters can discover talent easily

Institutions can issue credentials effortlessly

2. Information Architecture

The application has three user environments:

Student Mobile App
Institution Web Dashboard
Recruiter Web Portal
Student Navigation

Primary navigation (bottom tab bar):

Home
Discover
Projects
Profile

Secondary navigation:

Notifications
Settings
Search
Institution Dashboard Navigation

Sidebar layout:

Dashboard
Students
Issue Credential
Credential History
Settings
Recruiter Portal Navigation

Top navigation layout:

Talent Discovery
Shortlisted Candidates
Student Profiles
Account Settings
3. Screen Inventory
Student App Screens
Splash Screen
Onboarding
Login / Signup
Institution Selection
Student Verification
Home Dashboard
Discover Students
Student Profile
Collaboration Requests
Project Groups
Create Project Group
Credentials List
Credential Details
My Profile
Edit Profile
Privacy Settings
Notifications
Institution Dashboard Screens
Institution Login
Dashboard Overview
Student Verification
Student Directory
Issue Credential
Credential History
Institution Settings
Recruiter Portal Screens
Recruiter Login
Talent Discovery
Student Profile View
Candidate Shortlist
Recruiter Settings
4. Key Screen Layouts
Splash Screen

Purpose:

Introduce the brand and load the app.

Layout hierarchy:

App Logo
Tagline
Loading Indicator

Behavior:

Auto redirect after initialization
Onboarding Screens

3 educational slides explaining the platform.

Layout:

Illustration
Title
Description
Next Button
Progress Indicator

Slides:

Verified Academic Identity
Trusted Credentials
Collaborate Across Institutions

Final action:

Get Started
Login
Login / Signup Screen

Layout:

Logo

Email Field
Password Field

Login Button

Divider

Signup Link

Interactions:

Login → Home Dashboard
Signup → Institution Selection
Institution Selection Screen

Purpose:

Connect student to their institution.

Layout:

Header

Search Bar

Institution List

Institution card:

Institution Logo
Institution Name
Verification Badge
Student Verification Screen

Layout:

Student ID Input
Institution Email Input
Submit Button

Verification states:

Pending
Verified
Rejected
Home Dashboard

Purpose:

Provide overview of student identity and activity.

Layout hierarchy:

Header

Virtual Student ID Card

Recent Credentials

Collaboration Requests

Suggested Students
Virtual Student ID Card

Core identity component.

Displays:

Profile Photo
Name
Institution
Degree
Graduation Year

Verification Badges

Verification indicators:

✔ Institution Verified
✔ Credential Verified
Discover Students Screen

Purpose:

Find collaborators.

Layout:

Search Bar

Filter Panel
   Skills
   Institution
   Graduation Year

Student List

Student card component:

Profile Photo
Name
Institution
Top Skills
Verification Badge

Actions:

View Profile
Follow
Request Collaboration
Student Profile Screen

Layout hierarchy:

Profile Header

Header includes:

Profile Photo
Name
Institution
Degree
Graduation Year
Verification Badge

Action buttons:

Follow
Request Collaboration

Sections:

Skills
Projects
Achievements
Credentials
Interests
Goals
Skills Section

Displayed as skill chips.

Example:

React
Python
Machine Learning
UI Design
Projects Section

Project card layout:

Project Title
Description
Repository Link
Achievements Section

Achievement card:

Achievement Title
Issuer
Date
Credentials Section

Credential card layout:

Credential Title
Institution
Issue Date
Verification Badge

Interaction:

Tap → Credential Details
Credential Details Screen

Layout:

Credential Title
Institution
Issued Date
Description

Verification Status

Example status:

✔ Verified Credential

Optional verification section:

Verification Information
Collaboration Request Screen

Layout:

Student Info
Project Interest
Message Field

Send Request Button

After submission:

Request Sent Confirmation
Project Groups Screen

Layout:

Group List

Create Group Button

Group card:

Group Name
Members
Project Topic
Create Project Group Screen

Layout:

Group Name
Description
Required Skills
Add Members
Create Button
My Profile Screen

Layout:

Profile Header

Edit Profile Button

Sections:

Skills
Projects
Achievements
Credentials
Goals
Interests
Edit Profile Screen

Editable fields:

Full Name
Bio
Skills
Projects
Portfolio Links

Action:

Save Changes
Privacy Settings Screen

Layout:

Academic Records Visibility

Options:

Public
Recruiters Only
Private
Notifications Screen

Layout:

Notification List

Notification types:

Credential Issued
Collaboration Request
Collaboration Accepted
Institution Verification Completed
5. Component Library

Reusable UI components.

Student Card

Used in:

Discover
Recruiter Search
Collaborations

Displays:

Photo
Name
Skills
Verification Badge
Credential Card

Used in:

Profile
Credential List
Recruiter View
Skill Chip

Example:

React
Python
Data Science
Verification Badge

Types:

Institution Verified
Credential Verified

Purpose:

Make trust signals visible.

6. Interaction Logic
Credential Issuing
Institution issues credential
↓
System stores credential
↓
Student notified
↓
Credential appears in profile
Collaboration Flow
Student A sends request
↓
Student B accepts
↓
Group created
Credential Verification
Recruiter opens credential
↓
System validates credential
↓
Verification status displayed
7. Empty States

Examples:

No credentials:

You don't have verified credentials yet.
Credentials will appear once issued by your institution.

No projects:

Add a project to showcase your work.

No collaboration requests:

Explore students to start collaborating.
8. Error States

Examples:

Verification error:

Credential verification failed.
Contact issuing institution.

Network error:

Unable to load data.
Retry
9. Accessibility Considerations

The UX must support accessibility.

Features:

High contrast colors
Large tap targets
Readable typography
Screen reader compatibility
10. Performance UX

UX performance targets:

App launch < 2 seconds
Profile loading < 1 second
Search results < 500 ms
Final UX Navigation Structure

Student App:

Home
Discover
Projects
Profile

Institution Dashboard:

Dashboard
Students
Issue Credential
Credential History

Recruiter Portal:

Talent Discovery
Student Profiles
Shortlist