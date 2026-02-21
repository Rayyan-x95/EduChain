import 'package:dartz/dartz.dart';

abstract class QrRepository {
  Future<Either<String, String>> generateQrToken();
  Future<Either<String, Map<String, dynamic>>> validateQrToken(String token);
}
