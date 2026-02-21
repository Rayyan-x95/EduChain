import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/auth/domain/entities/user_entity.dart';
import 'package:edulink_mobile/features/auth/domain/entities/auth_tokens.dart';
import 'package:edulink_mobile/features/auth/domain/repositories/auth_repository.dart';

class RegisterUseCase {
  final AuthRepository _repository;

  RegisterUseCase(this._repository);

  Future<Either<String, ({UserEntity user, AuthTokens tokens})>> call({
    required String email,
    required String password,
    required String fullName,
    required String enrollmentNumber,
    required String institutionSlug,
    String? department,
    String? program,
    int? graduationYear,
  }) {
    return _repository.register(
      email: email,
      password: password,
      fullName: fullName,
      enrollmentNumber: enrollmentNumber,
      institutionSlug: institutionSlug,
      department: department,
      program: program,
      graduationYear: graduationYear,
    );
  }
}
