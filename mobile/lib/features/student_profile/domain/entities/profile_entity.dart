class ProfileEntity {
  final String id;
  final String email;
  final String fullName;
  final String? enrollmentNumber;
  final String status;
  final String? avatarUrl;
  final String? department;
  final String? program;
  final int? graduationYear;
  final String? githubUsername;
  final String institutionId;
  final String? institutionName;
  final bool showEmail;
  final bool showGithub;
  final bool showEndorsements;
  final double? reputationScore;
  final int endorsementCount;
  final int credentialCount;
  final DateTime createdAt;

  const ProfileEntity({
    required this.id,
    required this.email,
    required this.fullName,
    this.enrollmentNumber,
    required this.status,
    this.avatarUrl,
    this.department,
    this.program,
    this.graduationYear,
    this.githubUsername,
    required this.institutionId,
    this.institutionName,
    this.showEmail = true,
    this.showGithub = true,
    this.showEndorsements = true,
    this.reputationScore,
    this.endorsementCount = 0,
    this.credentialCount = 0,
    required this.createdAt,
  });
}
