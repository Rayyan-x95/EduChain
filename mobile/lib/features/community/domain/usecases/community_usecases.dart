import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/community/domain/entities/community_entities.dart';
import 'package:edulink_mobile/features/community/domain/repositories/community_repository.dart';

class GetReputationUseCase {
  final CommunityRepository _repository;
  GetReputationUseCase(this._repository);

  Future<Either<String, ReputationEntity>> call() =>
      _repository.getMyReputation();
}

class GetLeaderboardUseCase {
  final CommunityRepository _repository;
  GetLeaderboardUseCase(this._repository);

  Future<Either<String, List<LeaderboardEntry>>> call() =>
      _repository.getLeaderboard();
}

class GetBadgesUseCase {
  final CommunityRepository _repository;
  GetBadgesUseCase(this._repository);

  Future<Either<String, List<BadgeEntity>>> callAll() =>
      _repository.getAllBadges();

  Future<Either<String, List<BadgeEntity>>> callMine() =>
      _repository.getMyBadges();
}
