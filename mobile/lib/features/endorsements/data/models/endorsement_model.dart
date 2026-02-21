import 'package:json_annotation/json_annotation.dart';
import 'package:edulink_mobile/features/endorsements/domain/entities/endorsement_entity.dart';

part 'endorsement_model.g.dart';

@JsonSerializable()
class EndorsementModel {
  final String id;
  @JsonKey(name: 'endorser_id')
  final String endorserId;
  @JsonKey(name: 'endorser_name')
  final String endorserName;
  @JsonKey(name: 'endorsee_id')
  final String endorseeId;
  @JsonKey(name: 'endorsee_name')
  final String endorseeName;
  final String category;
  final String? comment;
  @JsonKey(name: 'created_at')
  final String createdAt;

  EndorsementModel({
    required this.id,
    required this.endorserId,
    required this.endorserName,
    required this.endorseeId,
    required this.endorseeName,
    required this.category,
    this.comment,
    required this.createdAt,
  });

  factory EndorsementModel.fromJson(Map<String, dynamic> json) =>
      _$EndorsementModelFromJson(json);

  EndorsementEntity toEntity() => EndorsementEntity(
        id: id,
        endorserId: endorserId,
        endorserName: endorserName,
        endorseeId: endorseeId,
        endorseeName: endorseeName,
        category: category,
        comment: comment,
        createdAt: DateTime.parse(createdAt),
      );
}
