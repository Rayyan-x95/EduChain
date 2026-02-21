// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'profile_model.dart';

ProfileModel _$ProfileModelFromJson(Map<String, dynamic> json) => ProfileModel(
      id: json['id'] as String,
      email: json['email'] as String,
      fullName: json['full_name'] as String,
      enrollmentNumber: json['enrollment_number'] as String?,
      status: json['status'] as String,
      avatarUrl: json['avatar_url'] as String?,
      department: json['department'] as String?,
      program: json['program'] as String?,
      graduationYear: json['graduation_year'] as int?,
      githubUsername: json['github_username'] as String?,
      institutionId: json['institution_id'] as String,
      institutionName: json['institution_name'] as String?,
      showEmail: json['show_email'] as bool? ?? true,
      showGithub: json['show_github'] as bool? ?? true,
      showEndorsements: json['show_endorsements'] as bool? ?? true,
      reputationScore: (json['reputation_score'] as num?)?.toDouble(),
      endorsementCount: json['endorsement_count'] as int? ?? 0,
      credentialCount: json['credential_count'] as int? ?? 0,
      createdAt: json['created_at'] as String,
    );
