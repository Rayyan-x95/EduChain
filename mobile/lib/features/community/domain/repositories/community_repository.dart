import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/community/domain/entities/community_entities.dart';

abstract class CommunityRepository {
  Future<Either<String, ReputationEntity>> getMyReputation();
  Future<Either<String, List<BadgeEntity>>> getAllBadges();
  Future<Either<String, List<BadgeEntity>>> getMyBadges();
  Future<Either<String, List<LeaderboardEntry>>> getLeaderboard();
}
