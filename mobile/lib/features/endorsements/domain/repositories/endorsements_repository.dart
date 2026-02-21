import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/endorsements/domain/entities/endorsement_entity.dart';

abstract class EndorsementsRepository {
  Future<Either<String, List<EndorsementEntity>>> getReceivedEndorsements();
  Future<Either<String, List<EndorsementEntity>>> getGivenEndorsements();
  Future<Either<String, EndorsementEntity>> giveEndorsement({
    required String userId,
    required String category,
    String? comment,
  });
}
