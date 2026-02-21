import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/endorsements/data/datasources/endorsements_remote_datasource.dart';
import 'package:edulink_mobile/features/endorsements/domain/entities/endorsement_entity.dart';
import 'package:edulink_mobile/features/endorsements/domain/repositories/endorsements_repository.dart';

class EndorsementsRepositoryImpl implements EndorsementsRepository {
  final EndorsementsRemoteDataSource _remote;
  EndorsementsRepositoryImpl(this._remote);

  @override
  Future<Either<String, List<EndorsementEntity>>> getReceivedEndorsements() async {
    try {
      final models = await _remote.getReceived();
      return Right(models.map((m) => m.toEntity()).toList());
    } catch (e) {
      return Left(e.toString().replaceFirst('Exception: ', ''));
    }
  }

  @override
  Future<Either<String, List<EndorsementEntity>>> getGivenEndorsements() async {
    try {
      final models = await _remote.getGiven();
      return Right(models.map((m) => m.toEntity()).toList());
    } catch (e) {
      return Left(e.toString().replaceFirst('Exception: ', ''));
    }
  }

  @override
  Future<Either<String, EndorsementEntity>> giveEndorsement({
    required String userId,
    required String category,
    String? comment,
  }) async {
    try {
      final model = await _remote.give(
        userId: userId,
        category: category,
        comment: comment,
      );
      return Right(model.toEntity());
    } catch (e) {
      return Left(e.toString().replaceFirst('Exception: ', ''));
    }
  }
}
