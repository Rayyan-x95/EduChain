import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/github/domain/entities/github_entities.dart';

abstract class GithubRepository {
  Future<Either<String, String>> getConnectUrl();
  Future<Either<String, GithubProfileEntity>> completeConnection(String code);
  Future<Either<String, List<GithubContribution>>> getContributions();
  Future<Either<String, void>> disconnect();
}
