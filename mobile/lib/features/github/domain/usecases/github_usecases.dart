import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/github/domain/entities/github_entities.dart';
import 'package:edulink_mobile/features/github/domain/repositories/github_repository.dart';

class ConnectGithubUseCase {
  final GithubRepository _repository;
  ConnectGithubUseCase(this._repository);

  Future<Either<String, String>> call() => _repository.getConnectUrl();
}

class CompleteGithubConnectionUseCase {
  final GithubRepository _repository;
  CompleteGithubConnectionUseCase(this._repository);

  Future<Either<String, GithubProfileEntity>> call(String code) =>
      _repository.completeConnection(code);
}

class GetGithubContributionsUseCase {
  final GithubRepository _repository;
  GetGithubContributionsUseCase(this._repository);

  Future<Either<String, List<GithubContribution>>> call() =>
      _repository.getContributions();
}

class DisconnectGithubUseCase {
  final GithubRepository _repository;
  DisconnectGithubUseCase(this._repository);

  Future<Either<String, void>> call() => _repository.disconnect();
}
