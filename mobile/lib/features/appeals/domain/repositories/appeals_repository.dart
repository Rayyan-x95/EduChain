import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/appeals/domain/entities/appeal_entity.dart';

abstract class AppealsRepository {
  Future<Either<String, List<AppealEntity>>> getAppeals();
  Future<Either<String, AppealEntity>> createAppeal(String reason);
}
