class CredentialEntity {
  final String id;
  final String studentId;
  final String title;
  final String? description;
  final String category;
  final String status;
  final bool isPublic;
  final String? signatureHex;
  final String? payloadHash;
  final int version;
  final String? issuedBy;
  final String? revokedReason;
  final DateTime createdAt;
  final DateTime updatedAt;

  const CredentialEntity({
    required this.id,
    required this.studentId,
    required this.title,
    this.description,
    required this.category,
    required this.status,
    this.isPublic = false,
    this.signatureHex,
    this.payloadHash,
    this.version = 1,
    this.issuedBy,
    this.revokedReason,
    required this.createdAt,
    required this.updatedAt,
  });
}
