import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/student_profile/domain/entities/profile_entity.dart';
import 'package:edulink_mobile/features/student_profile/domain/repositories/profile_repository.dart';

class UpdateProfileUseCase {
  final ProfileRepository _repository;
  UpdateProfileUseCase(this._repository);

  Future<Either<String, ProfileEntity>> call(Map<String, dynamic> data) =>
      _repository.updateProfile(data);
}
