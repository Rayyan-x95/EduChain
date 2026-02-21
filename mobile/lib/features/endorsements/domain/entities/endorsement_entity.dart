class EndorsementEntity {
  final String id;
  final String endorserId;
  final String endorserName;
  final String endorseeId;
  final String endorseeName;
  final String category;
  final String? comment;
  final DateTime createdAt;

  const EndorsementEntity({
    required this.id,
    required this.endorserId,
    required this.endorserName,
    required this.endorseeId,
    required this.endorseeName,
    required this.category,
    this.comment,
    required this.createdAt,
  });
}
