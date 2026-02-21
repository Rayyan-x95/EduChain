import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/appeals/domain/entities/appeal_entity.dart';
import 'package:edulink_mobile/features/appeals/domain/repositories/appeals_repository.dart';

class CreateAppealUseCase {
  final AppealsRepository _repository;
  CreateAppealUseCase(this._repository);
  Future<Either<String, AppealEntity>> call(String reason) =>
      _repository.createAppeal(reason);
}
