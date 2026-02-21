import 'package:json_annotation/json_annotation.dart';
import 'package:edulink_mobile/features/auth/domain/entities/user_entity.dart';

part 'user_model.g.dart';

@JsonSerializable()
class UserModel {
  final String id;
  final String email;
  @JsonKey(name: 'full_name')
  final String fullName;
  @JsonKey(name: 'enrollment_number')
  final String? enrollmentNumber;
  @JsonKey(name: 'user_type')
  final String userType;
  final String status;
  @JsonKey(name: 'institution_id')
  final String institutionId;
  @JsonKey(name: 'institution_name')
  final String? institutionName;
  @JsonKey(name: 'avatar_url')
  final String? avatarUrl;
  final String? department;
  final String? program;
  @JsonKey(name: 'graduation_year')
  final int? graduationYear;
  @JsonKey(name: 'github_username')
  final String? githubUsername;
  @JsonKey(name: 'show_email')
  final bool showEmail;
  @JsonKey(name: 'show_github')
  final bool showGithub;
  @JsonKey(name: 'show_endorsements')
  final bool showEndorsements;
  @JsonKey(name: 'created_at')
  final String createdAt;

  UserModel({
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

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);

  Map<String, dynamic> toJson() => _$UserModelToJson(this);

  UserEntity toEntity() => UserEntity(
        id: id,
        email: email,
        fullName: fullName,
        enrollmentNumber: enrollmentNumber,
        userType: userType,
        status: status,
        institutionId: institutionId,
        institutionName: institutionName,
        avatarUrl: avatarUrl,
        department: department,
        program: program,
        graduationYear: graduationYear,
        githubUsername: githubUsername,
        showEmail: showEmail,
        showGithub: showGithub,
        showEndorsements: showEndorsements,
        createdAt: DateTime.parse(createdAt),
      );
}
