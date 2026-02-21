import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/credentials/data/datasources/credentials_remote_datasource.dart';
import 'package:edulink_mobile/features/credentials/domain/entities/credential_entity.dart';
import 'package:edulink_mobile/features/credentials/domain/repositories/credentials_repository.dart';

class CredentialsRepositoryImpl implements CredentialsRepository {
  final CredentialsRemoteDataSource _remote;

  CredentialsRepositoryImpl(this._remote);

  @override
  Future<Either<String, List<CredentialEntity>>> getCredentials() async {
    try {
      final models = await _remote.getCredentials();
      return Right(models.map((m) => m.toEntity()).toList());
    } catch (e) {
      return Left(e.toString().replaceFirst('Exception: ', ''));
    }
  }

  @override
  Future<Either<String, CredentialEntity>> getCredential(String id) async {
    try {
      final model = await _remote.getCredential(id);
      return Right(model.toEntity());
    } catch (e) {
      return Left(e.toString().replaceFirst('Exception: ', ''));
    }
  }

  @override
  Future<Either<String, Map<String, dynamic>>> verifyCredential(String id) async {
    try {
      final data = await _remote.verifyCredential(id);
      return Right(data);
    } catch (e) {
      return Left(e.toString().replaceFirst('Exception: ', ''));
    }
  }

  @override
  Future<Either<String, void>> updateVisibility(String id, bool isPublic) async {
    try {
      await _remote.updateVisibility(id, isPublic);
      return const Right(null);
    } catch (e) {
      return Left(e.toString().replaceFirst('Exception: ', ''));
    }
  }
}
