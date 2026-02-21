import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/appeals/domain/entities/appeal_entity.dart';
import 'package:edulink_mobile/features/appeals/domain/repositories/appeals_repository.dart';

class GetAppealsUseCase {
  final AppealsRepository _repository;
  GetAppealsUseCase(this._repository);
  Future<Either<String, List<AppealEntity>>> call() => _repository.getAppeals();
}
