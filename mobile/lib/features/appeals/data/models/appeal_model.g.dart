// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'appeal_model.dart';

AppealModel _$AppealModelFromJson(Map<String, dynamic> json) => AppealModel(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      reason: json['reason'] as String,
      status: json['status'] as String,
      reviewNotes: json['review_notes'] as String?,
      reviewedBy: json['reviewed_by'] as String?,
      deadline: json['deadline'] as String?,
      createdAt: json['created_at'] as String,
    );
