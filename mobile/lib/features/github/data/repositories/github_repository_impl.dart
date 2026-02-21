import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/github/data/datasources/github_remote_datasource.dart';
import 'package:edulink_mobile/features/github/domain/entities/github_entities.dart';
import 'package:edulink_mobile/features/github/domain/repositories/github_repository.dart';

class GithubRepositoryImpl implements GithubRepository {
  final GithubRemoteDataSource _remote;
  GithubRepositoryImpl(this._remote);

  @override
  Future<Either<String, String>> getConnectUrl() async {
    try {
      final url = await _remote.getConnectUrl();
      return Right(url);
    } catch (e) {
      return Left(e.toString().replaceFirst('Exception: ', ''));
    }
  }

  @override
  Future<Either<String, GithubProfileEntity>> completeConnection(
      String code) async {
    try {
      final data = await _remote.completeConnection(code);
      return Right(GithubProfileEntity(
        username: data['username'] as String,
        avatarUrl: data['avatar_url'] as String?,
        publicRepos: data['public_repos'] as int? ?? 0,
        totalContributions: data['total_contributions'] as int? ?? 0,
        stars: data['stars'] as int? ?? 0,
        connected: true,
      ));
    } catch (e) {
      return Left(e.toString().replaceFirst('Exception: ', ''));
    }
  }

  @override
  Future<Either<String, List<GithubContribution>>> getContributions() async {
    try {
      final data = await _remote.getContributions();
      return Right(data
          .cast<Map<String, dynamic>>()
          .map((e) => GithubContribution(
                repoName: e['repo_name'] as String,
                type: e['type'] as String,
                title: e['title'] as String,
                url: e['url'] as String?,
                date: DateTime.parse(e['date'] as String),
              ))
          .toList());
    } catch (e) {
      return Left(e.toString().replaceFirst('Exception: ', ''));
    }
  }

  @override
  Future<Either<String, void>> disconnect() async {
    try {
      await _remote.disconnect();
      return const Right(null);
    } catch (e) {
      return Left(e.toString().replaceFirst('Exception: ', ''));
    }
  }
}
