// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'endorsement_model.dart';

EndorsementModel _$EndorsementModelFromJson(Map<String, dynamic> json) =>
    EndorsementModel(
      id: json['id'] as String,
      endorserId: json['endorser_id'] as String,
      endorserName: json['endorser_name'] as String,
      endorseeId: json['endorsee_id'] as String,
      endorseeName: json['endorsee_name'] as String,
      category: json['category'] as String,
      comment: json['comment'] as String?,
      createdAt: json['created_at'] as String,
    );
