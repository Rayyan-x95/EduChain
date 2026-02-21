import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/community/data/datasources/community_remote_datasource.dart';
import 'package:edulink_mobile/features/community/domain/entities/community_entities.dart';
import 'package:edulink_mobile/features/community/domain/repositories/community_repository.dart';

class CommunityRepositoryImpl implements CommunityRepository {
  final CommunityRemoteDataSource _remote;
  CommunityRepositoryImpl(this._remote);

  @override
  Future<Either<String, ReputationEntity>> getMyReputation() async {
    try {
      final data = await _remote.getMyReputation();
      return Right(ReputationEntity(
        overallScore: (data['overall_score'] as num).toDouble(),
        academicScore: (data['academic_score'] as num).toDouble(),
        communityScore: (data['community_score'] as num).toDouble(),
        projectScore: (data['project_score'] as num).toDouble(),
        endorsementCount: data['endorsement_count'] as int,
        credentialCount: data['credential_count'] as int,
        badgeCount: data['badge_count'] as int,
        tier: data['tier'] as String,
      ));
    } catch (e) {
      return Left(e.toString().replaceFirst('Exception: ', ''));
    }
  }

  @override
  Future<Either<String, List<BadgeEntity>>> getAllBadges() async {
    try {
      final data = await _remote.getAllBadges();
      return Right(_parseBadges(data));
    } catch (e) {
      return Left(e.toString().replaceFirst('Exception: ', ''));
    }
  }

  @override
  Future<Either<String, List<BadgeEntity>>> getMyBadges() async {
    try {
      final data = await _remote.getMyBadges();
      return Right(_parseBadges(data));
    } catch (e) {
      return Left(e.toString().replaceFirst('Exception: ', ''));
    }
  }

  @override
  Future<Either<String, List<LeaderboardEntry>>> getLeaderboard() async {
    try {
      final data = await _remote.getLeaderboard();
      return Right(data
          .cast<Map<String, dynamic>>()
          .map((e) => LeaderboardEntry(
                rank: e['rank'] as int,
                userId: e['user_id'] as String,
                fullName: e['full_name'] as String,
                avatarUrl: e['avatar_url'] as String?,
                reputationScore: (e['reputation_score'] as num).toDouble(),
                tier: e['tier'] as String,
              ))
          .toList());
    } catch (e) {
      return Left(e.toString().replaceFirst('Exception: ', ''));
    }
  }

  List<BadgeEntity> _parseBadges(List<dynamic> data) => data
      .cast<Map<String, dynamic>>()
      .map((e) => BadgeEntity(
            id: e['id'] as String,
            name: e['name'] as String,
            description: e['description'] as String,
            iconUrl: e['icon_url'] as String? ?? '',
            category: e['category'] as String,
            earned: e['earned'] as bool? ?? false,
            earnedAt: e['earned_at'] != null
                ? DateTime.parse(e['earned_at'] as String)
                : null,
          ))
      .toList();
}
