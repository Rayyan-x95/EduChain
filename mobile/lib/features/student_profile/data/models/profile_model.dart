import 'package:json_annotation/json_annotation.dart';
import 'package:edulink_mobile/features/student_profile/domain/entities/profile_entity.dart';

part 'profile_model.g.dart';

@JsonSerializable()
class ProfileModel {
  final String id;
  final String email;
  @JsonKey(name: 'full_name')
  final String fullName;
  @JsonKey(name: 'enrollment_number')
  final String? enrollmentNumber;
  final String status;
  @JsonKey(name: 'avatar_url')
  final String? avatarUrl;
  final String? department;
  final String? program;
  @JsonKey(name: 'graduation_year')
  final int? graduationYear;
  @JsonKey(name: 'github_username')
  final String? githubUsername;
  @JsonKey(name: 'institution_id')
  final String institutionId;
  @JsonKey(name: 'institution_name')
  final String? institutionName;
  @JsonKey(name: 'show_email')
  final bool showEmail;
  @JsonKey(name: 'show_github')
  final bool showGithub;
  @JsonKey(name: 'show_endorsements')
  final bool showEndorsements;
  @JsonKey(name: 'reputation_score')
  final double? reputationScore;
  @JsonKey(name: 'endorsement_count')
  final int endorsementCount;
  @JsonKey(name: 'credential_count')
  final int credentialCount;
  @JsonKey(name: 'created_at')
  final String createdAt;

  ProfileModel({
    required this.id,
    required this.email,
    required this.fullName,
    this.enrollmentNumber,
    required this.status,
    this.avatarUrl,
    this.department,
    this.program,
    this.graduationYear,
    this.githubUsername,
    required this.institutionId,
    this.institutionName,
    this.showEmail = true,
    this.showGithub = true,
    this.showEndorsements = true,
    this.reputationScore,
    this.endorsementCount = 0,
    this.credentialCount = 0,
    required this.createdAt,
  });

  factory ProfileModel.fromJson(Map<String, dynamic> json) =>
      _$ProfileModelFromJson(json);

  ProfileEntity toEntity() => ProfileEntity(
        id: id,
        email: email,
        fullName: fullName,
        enrollmentNumber: enrollmentNumber,
        status: status,
        avatarUrl: avatarUrl,
        department: department,
        program: program,
        graduationYear: graduationYear,
        githubUsername: githubUsername,
        institutionId: institutionId,
        institutionName: institutionName,
        showEmail: showEmail,
        showGithub: showGithub,
        showEndorsements: showEndorsements,
        reputationScore: reputationScore,
        endorsementCount: endorsementCount,
        credentialCount: credentialCount,
        createdAt: DateTime.parse(createdAt),
      );
}
