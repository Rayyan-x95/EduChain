import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/student_profile/domain/entities/profile_entity.dart';
import 'package:edulink_mobile/features/student_profile/domain/repositories/profile_repository.dart';

class GetProfileUseCase {
  final ProfileRepository _repository;
  GetProfileUseCase(this._repository);

  Future<Either<String, ProfileEntity>> call() => _repository.getProfile();
}
