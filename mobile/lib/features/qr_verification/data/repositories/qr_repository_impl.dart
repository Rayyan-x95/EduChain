import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/qr_verification/data/datasources/qr_remote_datasource.dart';
import 'package:edulink_mobile/features/qr_verification/domain/repositories/qr_repository.dart';

class QrRepositoryImpl implements QrRepository {
  final QrRemoteDataSource _remote;

  QrRepositoryImpl(this._remote);

  @override
  Future<Either<String, String>> generateQrToken() async {
    try {
      final token = await _remote.generateQrToken();
      return Right(token);
    } catch (e) {
      return Left(e.toString().replaceFirst('Exception: ', ''));
    }
  }

  @override
  Future<Either<String, Map<String, dynamic>>> validateQrToken(String token) async {
    try {
      final data = await _remote.validateQrToken(token);
      return Right(data);
    } catch (e) {
      return Left(e.toString().replaceFirst('Exception: ', ''));
    }
  }
}
