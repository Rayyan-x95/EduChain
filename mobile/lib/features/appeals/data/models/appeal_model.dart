import 'package:json_annotation/json_annotation.dart';
import 'package:edulink_mobile/features/appeals/domain/entities/appeal_entity.dart';

part 'appeal_model.g.dart';

@JsonSerializable()
class AppealModel {
  final String id;
  @JsonKey(name: 'user_id')
  final String userId;
  final String reason;
  final String status;
  @JsonKey(name: 'review_notes')
  final String? reviewNotes;
  @JsonKey(name: 'reviewed_by')
  final String? reviewedBy;
  final String? deadline;
  @JsonKey(name: 'created_at')
  final String createdAt;

  AppealModel({
    required this.id,
    required this.userId,
    required this.reason,
    required this.status,
    this.reviewNotes,
    this.reviewedBy,
    this.deadline,
    required this.createdAt,
  });

  factory AppealModel.fromJson(Map<String, dynamic> json) =>
      _$AppealModelFromJson(json);

  AppealEntity toEntity() => AppealEntity(
        id: id,
        userId: userId,
        reason: reason,
        status: status,
        reviewNotes: reviewNotes,
        reviewedBy: reviewedBy,
        deadline: deadline != null ? DateTime.tryParse(deadline!) : null,
        createdAt: DateTime.parse(createdAt),
      );
}
