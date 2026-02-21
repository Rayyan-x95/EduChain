import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/student_profile/domain/entities/profile_entity.dart';

abstract class ProfileRepository {
  Future<Either<String, ProfileEntity>> getProfile();
  Future<Either<String, ProfileEntity>> updateProfile(Map<String, dynamic> data);
  Future<Either<String, Map<String, dynamic>>> getIdCard();
  Future<Either<String, void>> updatePrivacy(Map<String, bool> settings);
}
