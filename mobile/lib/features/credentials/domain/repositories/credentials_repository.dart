import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/credentials/domain/entities/credential_entity.dart';

abstract class CredentialsRepository {
  Future<Either<String, List<CredentialEntity>>> getCredentials();
  Future<Either<String, CredentialEntity>> getCredential(String id);
  Future<Either<String, Map<String, dynamic>>> verifyCredential(String id);
  Future<Either<String, void>> updateVisibility(String id, bool isPublic);
}
