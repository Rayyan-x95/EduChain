class UserEntity {
  final String id;
  final String email;
  final String fullName;
  final String? enrollmentNumber;
  final String userType;
  final String status;
  final String institutionId;
  final String? institutionName;
  final String? avatarUrl;
  final String? department;
  final String? program;
  final int? graduationYear;
  final String? githubUsername;
  final bool showEmail;
  final bool showGithub;
  final bool showEndorsements;
  final DateTime createdAt;

  const UserEntity({
    required this.id,
    required this.email,
    required this.fullName,
    this.enrollmentNumber,
    required this.userType,
    required this.status,
    required this.institutionId,
    this.institutionName,
    this.avatarUrl,
    this.department,
    this.program,
    this.graduationYear,
    this.githubUsername,
    this.showEmail = true,
    this.showGithub = true,
    this.showEndorsements = true,
    required this.createdAt,
  });

  bool get isVerified => status == 'VERIFIED';
  bool get isPending => status == 'PENDING_REVIEW';
  bool get isRejected => status == 'REJECTED';
  bool get isSuspended => status == 'SUSPENDED';
}
