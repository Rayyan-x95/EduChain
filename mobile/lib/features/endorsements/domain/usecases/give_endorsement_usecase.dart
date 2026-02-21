import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/endorsements/domain/entities/endorsement_entity.dart';
import 'package:edulink_mobile/features/endorsements/domain/repositories/endorsements_repository.dart';

class GiveEndorsementUseCase {
  final EndorsementsRepository _repository;
  GiveEndorsementUseCase(this._repository);

  Future<Either<String, EndorsementEntity>> call({
    required String userId,
    required String category,
    String? comment,
  }) =>
      _repository.giveEndorsement(
        userId: userId,
        category: category,
        comment: comment,
      );
}
