class ReputationEntity {
  final double overallScore;
  final double academicScore;
  final double communityScore;
  final double projectScore;
  final int endorsementCount;
  final int credentialCount;
  final int badgeCount;
  final String tier;

  const ReputationEntity({
    required this.overallScore,
    required this.academicScore,
    required this.communityScore,
    required this.projectScore,
    required this.endorsementCount,
    required this.credentialCount,
    required this.badgeCount,
    required this.tier,
  });
}

class BadgeEntity {
  final String id;
  final String name;
  final String description;
  final String iconUrl;
  final String category;
  final bool earned;
  final DateTime? earnedAt;

  const BadgeEntity({
    required this.id,
    required this.name,
    required this.description,
    required this.iconUrl,
    required this.category,
    this.earned = false,
    this.earnedAt,
  });
}

class LeaderboardEntry {
  final int rank;
  final String userId;
  final String fullName;
  final String? avatarUrl;
  final double reputationScore;
  final String tier;

  const LeaderboardEntry({
    required this.rank,
    required this.userId,
    required this.fullName,
    this.avatarUrl,
    required this.reputationScore,
    required this.tier,
  });
}
