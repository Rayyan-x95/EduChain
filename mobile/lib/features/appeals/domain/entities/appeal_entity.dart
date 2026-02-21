class AppealEntity {
  final String id;
  final String userId;
  final String reason;
  final String status;
  final String? reviewNotes;
  final String? reviewedBy;
  final DateTime? deadline;
  final DateTime createdAt;

  const AppealEntity({
    required this.id,
    required this.userId,
    required this.reason,
    required this.status,
    this.reviewNotes,
    this.reviewedBy,
    this.deadline,
    required this.createdAt,
  });
}
