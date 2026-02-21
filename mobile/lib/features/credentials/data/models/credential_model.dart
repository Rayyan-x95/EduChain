import 'package:json_annotation/json_annotation.dart';
import 'package:edulink_mobile/features/credentials/domain/entities/credential_entity.dart';

part 'credential_model.g.dart';

@JsonSerializable()
class CredentialModel {
  final String id;
  @JsonKey(name: 'student_id')
  final String studentId;
  final String title;
  final String? description;
  final String category;
  final String status;
  @JsonKey(name: 'is_public')
  final bool isPublic;
  @JsonKey(name: 'signature_hex')
  final String? signatureHex;
  @JsonKey(name: 'payload_hash')
  final String? payloadHash;
  final int version;
  @JsonKey(name: 'issued_by')
  final String? issuedBy;
  @JsonKey(name: 'revoked_reason')
  final String? revokedReason;
  @JsonKey(name: 'created_at')
  final String createdAt;
  @JsonKey(name: 'updated_at')
  final String updatedAt;

  CredentialModel({
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

  factory CredentialModel.fromJson(Map<String, dynamic> json) =>
      _$CredentialModelFromJson(json);

  CredentialEntity toEntity() => CredentialEntity(
        id: id,
        studentId: studentId,
        title: title,
        description: description,
        category: category,
        status: status,
        isPublic: isPublic,
        signatureHex: signatureHex,
        payloadHash: payloadHash,
        version: version,
        issuedBy: issuedBy,
        revokedReason: revokedReason,
        createdAt: DateTime.parse(createdAt),
        updatedAt: DateTime.parse(updatedAt),
      );
}
