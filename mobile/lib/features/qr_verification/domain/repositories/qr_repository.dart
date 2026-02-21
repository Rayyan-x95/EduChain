import 'package:dartz/dartz.dart';

abstract class QrRepository {
  Future<Either<String, Map<String, dynamic>>> generateQrToken();
  Future<Either<String, Map<String, dynamic>>> validateQrToken(String token);
}
