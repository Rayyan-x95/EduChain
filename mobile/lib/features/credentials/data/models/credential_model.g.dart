// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'credential_model.dart';

CredentialModel _$CredentialModelFromJson(Map<String, dynamic> json) =>
    CredentialModel(
      id: json['id'] as String,
      studentId: json['student_id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      category: json['category'] as String,
      status: json['status'] as String,
      isPublic: json['is_public'] as bool? ?? false,
      signatureHex: json['signature_hex'] as String?,
      payloadHash: json['payload_hash'] as String?,
      version: json['version'] as int? ?? 1,
      issuedBy: json['issued_by'] as String?,
      revokedReason: json['revoked_reason'] as String?,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
    );
