import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/student_profile/data/datasources/profile_remote_datasource.dart';
import 'package:edulink_mobile/features/student_profile/domain/entities/profile_entity.dart';
import 'package:edulink_mobile/features/student_profile/domain/repositories/profile_repository.dart';

class ProfileRepositoryImpl implements ProfileRepository {
  final ProfileRemoteDataSource _remote;

  ProfileRepositoryImpl(this._remote);

  @override
  Future<Either<String, ProfileEntity>> getProfile() async {
    try {
      final model = await _remote.getProfile();
      return Right(model.toEntity());
    } catch (e) {
      return Left(e.toString().replaceFirst('Exception: ', ''));
    }
  }

  @override
  Future<Either<String, ProfileEntity>> updateProfile(
      Map<String, dynamic> data) async {
    try {
      final model = await _remote.updateProfile(data);
      return Right(model.toEntity());
    } catch (e) {
      return Left(e.toString().replaceFirst('Exception: ', ''));
    }
  }

  @override
  Future<Either<String, Map<String, dynamic>>> getIdCard() async {
    try {
      final data = await _remote.getIdCard();
      return Right(data);
    } catch (e) {
      return Left(e.toString().replaceFirst('Exception: ', ''));
    }
  }

  @override
  Future<Either<String, void>> updatePrivacy(Map<String, bool> settings) async {
    try {
      await _remote.updatePrivacy(settings);
      return const Right(null);
    } catch (e) {
      return Left(e.toString().replaceFirst('Exception: ', ''));
    }
  }
}
