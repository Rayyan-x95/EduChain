# Reputation Algorithm — EduLink

> Transparent, non-gamable, institution-overridable  
> Computed server-side | Updated periodically via background task  
> Score range: 0–100

---

## 1. Formula

```
TotalScore = clamp(0, 100,
    W_v × verification_score   +
    W_c × credential_score     +
    W_e × endorsement_score    +
    W_m × community_score      +
    W_g × github_score         +
    institution_modifier
)
```

### Weights

| Symbol | Component | Weight | Range | Description |
|--------|-----------|--------|-------|-------------|
| W_v | Verification Score | **0.30** | 0–100 | Identity verification status & history |
| W_c | Credential Score | **0.25** | 0–100 | Number, recency, and validity of credentials |
| W_e | Endorsement Score | **0.20** | 0–100 | Peer endorsements (diversity-weighted) |
| W_m | Community Score | **0.15** | 0–100 | Badges, collaborations, participation |
| W_g | GitHub Score | **0.10** | 0–100 | Verified GitHub contribution metadata |
| — | Institution Modifier | — | -20 to +20 | Manual override by institution admin |

**Maximum possible weighted score** (before modifier) = 100  
**Final score** = clamped to [0, 100]

---

## 2. Component Calculations

### 2.1 Verification Score (W_v = 0.30)

Reflects identity verification status and trust level.

```python
def compute_verification_score(user) -> float:
    """
    VERIFIED with no appeal history     → 100
    VERIFIED after approved appeal      → 80
    PENDING (not yet reviewed)          → 30
    REJECTED (eligible for appeal)      → 10
    APPEAL_SUBMITTED                    → 20
    FINAL_REJECTED                      → 0
    SUSPENDED                           → 0
    BLACKLISTED                         → 0
    """
    status_scores = {
        "VERIFIED": 100,
        "PENDING": 30,
        "REJECTED": 10,
        "APPEAL_SUBMITTED": 20,
        "FINAL_REJECTED": 0,
        "SUSPENDED": 0,
        "BLACKLISTED": 0,
    }
    
    base = status_scores.get(user.status, 0)
    
    # Penalty if verified via appeal (trust slightly lower)
    if user.status == "VERIFIED" and user.has_appeal_history:
        base = 80
    
    # Bonus for long-standing verified status
    if user.status == "VERIFIED" and user.verified_at:
        months_verified = (now() - user.verified_at).days / 30
        tenure_bonus = min(months_verified * 0.5, 5)  # max +5
        base = min(base + tenure_bonus, 100)
    
    return base
```

### 2.2 Credential Score (W_c = 0.25)

Rewards having valid, diverse, and recent credentials.

```python
def compute_credential_score(credentials: list) -> float:
    """
    Scoring factors:
      - Number of active credentials (diminishing returns)
      - Category diversity bonus
      - Recency bonus (credentials issued in last 6 months)
      - Penalty for revoked credentials
    """
    if not credentials:
        return 0.0
    
    active = [c for c in credentials if c.status == "ACTIVE"]
    revoked = [c for c in credentials if c.status == "REVOKED"]
    
    # Base: logarithmic scaling (diminishing returns)
    # 1 credential → 30, 3 → 55, 5 → 70, 10 → 85, 20+ → ~95
    count_score = min(30 * math.log2(len(active) + 1), 95) if active else 0
    
    # Category diversity bonus: unique categories out of 5
    categories = set(c.category for c in active)
    diversity_bonus = (len(categories) / 5) * 15  # max +15
    
    # Recency bonus: credentials issued in last 6 months
    recent = [c for c in active if (now() - c.issued_at).days < 180]
    recency_bonus = min(len(recent) * 3, 10)  # max +10
    
    # Revocation penalty
    revocation_penalty = len(revoked) * 5  # -5 per revoked
    
    score = count_score + diversity_bonus + recency_bonus - revocation_penalty
    return clamp(0, 100, score)
```

### 2.3 Endorsement Score (W_e = 0.20)

Measures peer trust through endorsements received.

```python
def compute_endorsement_score(endorsements_received: list) -> float:
    """
    Scoring factors:
      - Unique endorsers (diversity matters more than volume)
      - Endorser reputation bonus (high-rep endorser = worth more)
      - Diminishing returns from same endorser (capped at 1)
      - Skill diversity bonus
    """
    if not endorsements_received:
        return 0.0
    
    unique_endorsers = set(e.giver_id for e in endorsements_received)
    
    # Base: number of unique endorsers (logarithmic)
    # 1 → 25, 3 → 50, 5 → 65, 10 → 80, 20+ → ~95
    base = min(25 * math.log2(len(unique_endorsers) + 1), 95)
    
    # Endorser quality bonus: average reputation of endorsers
    avg_endorser_rep = mean(e.giver_reputation for e in endorsements_received)
    quality_bonus = (avg_endorser_rep / 100) * 10  # max +10 if all endorsers have 100 rep
    
    # Skill diversity: unique skills across all endorsements
    all_skills = set()
    for e in endorsements_received:
        all_skills.update(e.skills)
    skill_bonus = min(len(all_skills) * 1.5, 10)  # max +10
    
    score = base + quality_bonus + skill_bonus
    return clamp(0, 100, score)
```

### 2.4 Community Score (W_m = 0.15)

Rewards participation and engagement.

```python
def compute_community_score(user) -> float:
    """
    Scoring factors:
      - Badges earned
      - Projects shared (with public visibility)
      - Endorsements given (contributing to community)
      - Profile completeness
    """
    score = 0.0
    
    # Badges: each badge = +10, cap at 50
    badge_score = min(len(user.badges) * 10, 50)
    
    # Projects: each public project = +8, cap at 30
    public_projects = [p for p in user.projects if p.is_public]
    project_score = min(len(public_projects) * 8, 30)
    
    # Endorsements given (being a community member)
    endorsements_given = len(user.endorsements_given)
    giving_score = min(endorsements_given * 3, 15)
    
    # Profile completeness
    profile_fields = [
        user.full_name, user.bio, user.avatar_url, 
        user.program, user.enrollment_number
    ]
    filled = sum(1 for f in profile_fields if f)
    completeness_score = (filled / len(profile_fields)) * 15
    
    score = badge_score + project_score + giving_score + completeness_score
    return clamp(0, 100, score)
```

### 2.5 GitHub Score (W_g = 0.10)

Based on verified GitHub contribution metadata (no private repo access).

```python
def compute_github_score(github_data: dict | None) -> float:
    """
    Scoring factors (metadata only — no private repo access):
      - Public repositories
      - Commit activity (last 12 months)
      - PR contributions
      - Language diversity
      - Ownership verified badge

    Returns 0 if GitHub not connected.
    """
    if not github_data or not github_data.get("connected"):
        return 0.0
    
    score = 0.0
    
    # Public repos: logarithmic
    repos = github_data.get("public_repos", 0)
    repo_score = min(15 * math.log2(repos + 1), 30) if repos else 0
    
    # Commits last year
    commits = github_data.get("total_commits_last_year", 0)
    commit_score = min(commits / 10, 25)  # 250+ commits → 25
    
    # PRs
    prs = github_data.get("total_prs", 0)
    pr_score = min(prs * 1.5, 15)
    
    # Language diversity
    languages = github_data.get("top_languages", [])
    lang_score = min(len(languages) * 3, 15)
    
    # Ownership verified bonus
    if github_data.get("ownership_verified"):
        score += 15
    
    score += repo_score + commit_score + pr_score + lang_score
    return clamp(0, 100, score)
```

---

## 3. Institution Modifier

```python
def apply_institution_modifier(
    computed_score: float,
    modifier: float,        # -20 to +20
    modifier_reason: str    # required if modifier != 0
) -> float:
    """
    SuperAdmin can apply a modifier to any student's reputation.
    
    Use cases:
      - Academic excellence recognition (+10)
      - Disciplinary action (-15)
      - Special achievement bonus (+5)
      - Manual correction
    
    The modifier is:
      - Transparent (visible in student's reputation breakdown)
      - Auditable (logged in audit_logs with reason)
      - Capped at ±20 to prevent abuse
      - Only settable by SuperAdmin role
    """
    modifier = clamp(-20, 20, modifier)
    final = clamp(0, 100, computed_score + modifier)
    return final
```

---

## 4. Complete Computation

```python
# app/services/reputation_service.py

class ReputationService:
    WEIGHTS = {
        "verification": 0.30,
        "credential": 0.25,
        "endorsement": 0.20,
        "community": 0.15,
        "github": 0.10,
    }

    async def compute_reputation(self, user_id: UUID, institution_id: UUID) -> dict:
        """Compute full reputation breakdown for a student."""
        
        user = await self.user_repo.get_with_relations(user_id)
        credentials = await self.credential_repo.get_by_student(user_id, institution_id)
        endorsements = await self.endorsement_repo.get_received(user_id, institution_id)
        github_data = await self.github_repo.get_summary(user_id)
        
        # Compute components
        scores = {
            "verification": compute_verification_score(user),
            "credential": compute_credential_score(credentials),
            "endorsement": compute_endorsement_score(endorsements),
            "community": compute_community_score(user),
            "github": compute_github_score(github_data),
        }
        
        # Weighted sum
        weighted_total = sum(
            self.WEIGHTS[k] * v for k, v in scores.items()
        )
        
        # Apply institution modifier
        existing = await self.reputation_repo.get(user_id, institution_id)
        modifier = existing.institution_modifier if existing else 0
        
        final_score = clamp(0, 100, weighted_total + modifier)
        
        # Persist
        await self.reputation_repo.upsert(
            user_id=user_id,
            institution_id=institution_id,
            verification_score=scores["verification"],
            credential_score=scores["credential"],
            endorsement_score=scores["endorsement"],
            community_score=scores["community"],
            github_score=scores["github"],
            total_score=round(final_score, 2),
        )
        
        return {
            "total_score": round(final_score, 2),
            "breakdown": {
                k: {
                    "raw_score": round(v, 2),
                    "weight": self.WEIGHTS[k],
                    "weighted": round(self.WEIGHTS[k] * v, 2),
                }
                for k, v in scores.items()
            },
            "institution_modifier": modifier,
            "last_computed_at": datetime.now(timezone.utc).isoformat(),
        }
```

---

## 5. Anti-Gaming Measures

| Threat | Mitigation |
|---|---|
| **Self-endorsement** | `CHECK (giver_id != receiver_id)` in database |
| **Endorsement spam** | Rate limit: 3 endorsements per user per day |
| **Endorsement rings** | Diminishing returns from same endorser (capped at 1 per pair via UNIQUE constraint) |
| **Fake credential inflation** | Only institution officers can issue credentials (RBAC) |
| **GitHub stat manipulation** | Metadata-only, ownership verification required |
| **Score manipulation** | All computations server-side, no client input |
| **Sybil accounts** | Email verification + institution approval required |
| **Modifier abuse** | Modifier capped at ±20, requires reason, logged in audit trail |

---

## 6. Recomputation Schedule

```python
# app/tasks/reputation_tasks.py

async def recompute_all_reputations():
    """
    Periodic job to recompute all reputation scores.
    Schedule: Every 6 hours (or on-demand after significant events).
    
    Triggered by:
      - Cron (every 6h)
      - After credential issuance/revocation
      - After endorsement
      - After status change (verify/suspend/blacklist)
    """
    async with async_session_factory() as db:
        reputation_service = ReputationService(db)
        
        # Get all verified students across all institutions
        students = await db.execute(
            "SELECT id, institution_id FROM users WHERE status = 'VERIFIED'"
        )
        
        for student in students:
            await reputation_service.compute_reputation(
                student.id, student.institution_id
            )
        
        await db.commit()
```

---

## 7. API Response Example

```json
// GET /api/v1/community/reputation/me

{
  "status": "success",
  "data": {
    "total_score": 78.50,
    "breakdown": {
      "verification": {
        "raw_score": 100.00,
        "weight": 0.30,
        "weighted": 30.00
      },
      "credential": {
        "raw_score": 72.00,
        "weight": 0.25,
        "weighted": 18.00
      },
      "endorsement": {
        "raw_score": 65.00,
        "weight": 0.20,
        "weighted": 13.00
      },
      "community": {
        "raw_score": 55.00,
        "weight": 0.15,
        "weighted": 8.25
      },
      "github": {
        "raw_score": 42.50,
        "weight": 0.10,
        "weighted": 4.25
      }
    },
    "institution_modifier": 5.00,
    "modifier_reason": "Academic excellence — Dean's List 2025",
    "last_computed_at": "2026-02-20T14:00:00Z",
    "weights_version": "v1",
    "weights_published_at": "https://edulink.dev/reputation-weights"
  }
}
```

---

## 8. Transparency

- Weights are **publicly documented** and versioned
- Any weight change triggers a **full recomputation** and changelog entry
- Students can see their **full breakdown** (no hidden factors)
- Institution modifier is **visible** with the reason
- Algorithm source code published as part of the open specification
