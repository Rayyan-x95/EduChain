// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_model.dart';

UserModel _$UserModelFromJson(Map<String, dynamic> json) => UserModel(
      id: json['id'] as String,
      email: json['email'] as String,
      fullName: json['full_name'] as String,
      enrollmentNumber: json['enrollment_number'] as String?,
      userType: json['user_type'] as String,
      status: json['status'] as String,
      institutionId: json['institution_id'] as String,
      institutionName: json['institution_name'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      department: json['department'] as String?,
      program: json['program'] as String?,
      graduationYear: json['graduation_year'] as int?,
      githubUsername: json['github_username'] as String?,
      showEmail: json['show_email'] as bool? ?? true,
      showGithub: json['show_github'] as bool? ?? true,
      showEndorsements: json['show_endorsements'] as bool? ?? true,
      createdAt: json['created_at'] as String,
    );

Map<String, dynamic> _$UserModelToJson(UserModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'email': instance.email,
      'full_name': instance.fullName,
      'enrollment_number': instance.enrollmentNumber,
      'user_type': instance.userType,
      'status': instance.status,
      'institution_id': instance.institutionId,
      'institution_name': instance.institutionName,
      'avatar_url': instance.avatarUrl,
      'department': instance.department,
      'program': instance.program,
      'graduation_year': instance.graduationYear,
      'github_username': instance.githubUsername,
      'show_email': instance.showEmail,
      'show_github': instance.showGithub,
      'show_endorsements': instance.showEndorsements,
      'created_at': instance.createdAt,
    };
