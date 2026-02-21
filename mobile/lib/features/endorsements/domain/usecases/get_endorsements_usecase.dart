import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/endorsements/domain/entities/endorsement_entity.dart';
import 'package:edulink_mobile/features/endorsements/domain/repositories/endorsements_repository.dart';

class GetEndorsementsUseCase {
  final EndorsementsRepository _repository;
  GetEndorsementsUseCase(this._repository);

  Future<Either<String, List<EndorsementEntity>>> callReceived() =>
      _repository.getReceivedEndorsements();

  Future<Either<String, List<EndorsementEntity>>> callGiven() =>
      _repository.getGivenEndorsements();
}
