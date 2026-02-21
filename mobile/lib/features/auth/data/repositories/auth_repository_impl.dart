import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/auth/data/datasources/auth_remote_datasource.dart';
import 'package:edulink_mobile/features/auth/data/models/user_model.dart';
import 'package:edulink_mobile/features/auth/domain/entities/user_entity.dart';
import 'package:edulink_mobile/features/auth/domain/entities/auth_tokens.dart';
import 'package:edulink_mobile/features/auth/domain/repositories/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _remoteDataSource;

  AuthRepositoryImpl(this._remoteDataSource);

  @override
  Future<Either<String, ({UserEntity user, AuthTokens tokens})>> login({
    required String email,
    required String password,
    required String institutionSlug,
  }) async {
    try {
      final data = await _remoteDataSource.login(
        email: email,
        password: password,
        institutionSlug: institutionSlug,
      );
      final user = UserModel.fromJson(data['user'] as Map<String, dynamic>).toEntity();
      final tokens = AuthTokens(
        accessToken: data['access_token'] as String,
        refreshToken: data['refresh_token'] as String,
      );
      return Right((user: user, tokens: tokens));
    } catch (e) {
      return Left(e.toString().replaceFirst('Exception: ', ''));
    }
  }

  @override
  Future<Either<String, ({UserEntity user, AuthTokens tokens})>> register({
    required String email,
    required String password,
    required String fullName,
    required String enrollmentNumber,
    required String institutionSlug,
    String? department,
    String? program,
    int? graduationYear,
  }) async {
    try {
      final data = await _remoteDataSource.register(
        email: email,
        password: password,
        fullName: fullName,
        enrollmentNumber: enrollmentNumber,
        institutionSlug: institutionSlug,
        department: department,
        program: program,
        graduationYear: graduationYear,
      );
      final user = UserModel.fromJson(data['user'] as Map<String, dynamic>).toEntity();
      final tokens = AuthTokens(
        accessToken: data['access_token'] as String,
        refreshToken: data['refresh_token'] as String,
      );
      return Right((user: user, tokens: tokens));
    } catch (e) {
      return Left(e.toString().replaceFirst('Exception: ', ''));
    }
  }

  @override
  Future<Either<String, AuthTokens>> refreshToken(String refreshToken) async {
    try {
      final data = await _remoteDataSource.refreshToken(refreshToken);
      return Right(AuthTokens(
        accessToken: data['access_token'] as String,
        refreshToken: data['refresh_token'] as String,
      ));
    } catch (e) {
      return Left(e.toString().replaceFirst('Exception: ', ''));
    }
  }
}
