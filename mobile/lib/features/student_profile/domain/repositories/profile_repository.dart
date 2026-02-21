import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/student_profile/domain/entities/profile_entity.dart';

abstract class ProfileRepository {
  Future<Either<String, ProfileEntity>> getProfile();
  Future<Either<String, Map<String, dynamic>>> getIdCard();
}
