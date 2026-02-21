import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/appeals/data/datasources/appeals_remote_datasource.dart';
import 'package:edulink_mobile/features/appeals/domain/entities/appeal_entity.dart';
import 'package:edulink_mobile/features/appeals/domain/repositories/appeals_repository.dart';

class AppealsRepositoryImpl implements AppealsRepository {
  final AppealsRemoteDataSource _remote;
  AppealsRepositoryImpl(this._remote);

  @override
  Future<Either<String, List<AppealEntity>>> getAppeals() async {
    try {
      final models = await _remote.getAppeals();
      return Right(models.map((m) => m.toEntity()).toList());
    } catch (e) {
      return Left(e.toString().replaceFirst('Exception: ', ''));
    }
  }

  @override
  Future<Either<String, AppealEntity>> createAppeal(String reason) async {
    try {
      final model = await _remote.createAppeal(reason);
      return Right(model.toEntity());
    } catch (e) {
      return Left(e.toString().replaceFirst('Exception: ', ''));
    }
  }
}
