import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/credentials/domain/entities/credential_entity.dart';
import 'package:edulink_mobile/features/credentials/domain/repositories/credentials_repository.dart';

class GetCredentialsUseCase {
  final CredentialsRepository _repository;
  GetCredentialsUseCase(this._repository);

  Future<Either<String, List<CredentialEntity>>> call() =>
      _repository.getCredentials();
}
