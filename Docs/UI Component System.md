UI Component System
Product: EduChain ID
1. Design System Structure

The component system follows a design hierarchy:

Design Tokens
   ↓
Atoms
   ↓
Molecules
   ↓
Organisms
   ↓
Page Layouts

This is based on Atomic Design Principles.

2. Design Tokens

Design tokens define the core visual rules of the app.

Colors

Primary colors:

Primary Blue      #2563EB
Background Dark   #0F172A
Background Light  #F8FAFC
Accent Green      #22C55E
Warning Red       #EF4444
Gray Text         #64748B
Border Gray       #E2E8F0

Purpose:

Blue → trust / platform identity

Green → verification success

Red → warnings / revoked credentials

Typography

Primary font:

Inter

Hierarchy:

Type	Size
Heading	28–32px
Section Title	20px
Body Text	16px
Secondary Text	14px
Caption	12px
Spacing System

Use a consistent spacing scale:

4px
8px
12px
16px
24px
32px
48px

Example usage:

Card padding → 16px

Section spacing → 24px

Border Radius
Small    → 6px
Medium   → 10px
Large    → 16px
3. Atomic Components (Atoms)

Atoms are the smallest UI building blocks.

Button

Used for primary actions.

Variants:

Primary Button
Secondary Button
Outline Button
Danger Button

Example:

Primary Button:

Background: Blue
Text: White
Padding: 12px 16px
Border Radius: 10px

States:

Default
Hover
Pressed
Disabled
Loading
Input Field

Used for forms.

Structure:

Label
Input Field
Helper Text
Error Message

Example fields:

Email Input
Password Input
Search Input
Student ID Input

States:

Default
Focused
Error
Disabled
Badge

Small indicator for status.

Types:

Verified Badge
Pending Badge
Revoked Badge

Example:

✔ Verified
⏳ Pending
✖ Revoked
Avatar

Displays profile photo.

Sizes:

Small   → 32px
Medium  → 48px
Large   → 72px

Fallback:

Initials
Icon

Used for actions and navigation.

Examples:

Search
Notification
Edit
Follow
Verify

Icon size:

16px
20px
24px
Chip

Used for skills and tags.

Example:

React
Python
Machine Learning

Structure:

Rounded background
Small padding
Compact text
4. Molecular Components (Molecules)

Molecules combine multiple atoms into a functional component.

Student Card

Used in:

Discover screen
Recruiter search
Collaboration results

Structure:

Avatar
Name
Institution
Top Skills
Verification Badge

Actions:

View Profile
Follow
Request Collaboration
Credential Card

Displays academic credential.

Structure:

Credential Title
Institution
Issued Date
Verification Badge

Example:

B.Tech Computer Science
XYZ University
Issued: May 2026
✔ Verified
Project Card

Displays student project.

Structure:

Project Title
Short Description
Repository Link

Example:

EduChain
Blockchain student identity platform
GitHub Link
Achievement Card

Displays student achievements.

Structure:

Achievement Title
Issued By
Date

Example:

Hackathon Winner
Google Developer Club
2025
Collaboration Request Card

Used in notifications and requests.

Structure:

Student Avatar
Student Name
Message
Accept Button
Reject Button
5. Organism Components (Complex Components)

Organisms combine multiple molecules into larger UI sections.

Virtual Student ID Card

Core identity component.

Structure:

Avatar
Student Name
Institution
Degree
Graduation Year

Verification Badges

Example layout:

[ Photo ]

Rayyan
Dhaanish Ahmed College of Engineering
B.Tech Computer Science
Graduation: 2027

✔ Institution Verified
✔ Credential Verified
Student Profile Header

Used on profile pages.

Structure:

Profile Photo
Name
Institution
Degree
Verification Badge
Follow Button
Request Collaboration
Search Filter Panel

Used in Discover and Recruiter Search.

Filters:

Skill
Institution
Degree
Graduation Year
Verified Credentials

Components used:

Dropdown
Checkbox
Tag Filters
Credential List Section

Used on profile pages.

Structure:

Section Title

Credential Card
Credential Card
Credential Card
Activity Feed

Shows platform activity.

Events:

Credential issued
New project added
Collaboration started

Structure:

Avatar
Activity description
Timestamp
6. Layout Components

Layout components define page structure.

Bottom Navigation Bar

Used in student mobile app.

Tabs:

Home
Discover
Projects
Profile

Structure:

Icon
Label
Active Indicator
Top Navigation Bar

Used in web dashboards.

Structure:

Logo
Search Bar
Notifications
User Avatar
Sidebar Navigation

Used in institution dashboard.

Items:

Dashboard
Students
Issue Credential
Credential History
Settings
Page Container

Used for page layout.

Structure:

Header
Content Area
Footer

Padding:

24px
7. Interaction States

Every component must support states.

Example states:

Default
Hover
Pressed
Disabled
Loading

Example: Button loading state

Spinner
Disabled interaction
8. Feedback Components

Used to communicate system status.

Toast Notification

Short message alerts.

Examples:

Credential issued successfully
Profile updated
Collaboration request sent

Position:

Bottom center
Modal Dialog

Used for confirmations.

Examples:

Revoke credential
Delete project
Leave group

Structure:

Title
Message
Confirm Button
Cancel Button
Empty State Component

Displayed when data is missing.

Example:

No credentials yet
Add your first project
Explore students to collaborate

Structure:

Illustration
Message
Action Button
Error State Component

Example:

Network error
Failed to load profile

Structure:

Error icon
Message
Retry button
9. Component Naming Convention

Follow consistent naming.

Example:

ButtonPrimary
StudentCard
CredentialCard
ProjectCard
ProfileHeader
SearchFilterPanel

This keeps the frontend clean and maintainable.

10. Component Library Organization

Recommended frontend structure:

components/
 ├ atoms/
 │   ├ Button
 │   ├ Input
 │   ├ Badge
 │   ├ Avatar
 │   ├ Chip
 │
 ├ molecules/
 │   ├ StudentCard
 │   ├ CredentialCard
 │   ├ ProjectCard
 │   ├ AchievementCard
 │
 ├ organisms/
 │   ├ StudentProfileHeader
 │   ├ VirtualStudentID
 │   ├ CredentialList
 │
 └ layouts/
     ├ PageLayout
     ├ Sidebar
     ├ BottomNav
Final Component Architecture
Design Tokens
      ↓
Atoms (Button, Input, Badge)
      ↓
Molecules (StudentCard, CredentialCard)
      ↓
Organisms (ProfileHeader, IDCard)
      ↓
Layouts (Pages)

This ensures the UI remains:

consistent
scalable
maintainable