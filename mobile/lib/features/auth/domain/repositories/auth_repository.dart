import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/auth/domain/entities/user_entity.dart';
import 'package:edulink_mobile/features/auth/domain/entities/auth_tokens.dart';

abstract class AuthRepository {
  Future<Either<String, ({UserEntity user, AuthTokens tokens})>> login({
    required String email,
    required String password,
    required String institutionSlug,
  });

  Future<Either<String, AuthTokens>> refreshToken(String refreshToken);
}
