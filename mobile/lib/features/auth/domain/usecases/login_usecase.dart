import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/auth/domain/entities/user_entity.dart';
import 'package:edulink_mobile/features/auth/domain/entities/auth_tokens.dart';
import 'package:edulink_mobile/features/auth/domain/repositories/auth_repository.dart';

class LoginUseCase {
  final AuthRepository _repository;

  LoginUseCase(this._repository);

  Future<Either<String, ({UserEntity user, AuthTokens tokens})>> call({
    required String email,
    required String password,
    required String institutionSlug,
  }) {
    return _repository.login(
      email: email,
      password: password,
      institutionSlug: institutionSlug,
    );
  }
}
