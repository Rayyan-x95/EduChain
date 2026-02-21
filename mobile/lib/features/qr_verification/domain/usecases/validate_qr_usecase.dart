import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/qr_verification/domain/repositories/qr_repository.dart';

class ValidateQrUseCase {
  final QrRepository _repository;
  ValidateQrUseCase(this._repository);

  Future<Either<String, Map<String, dynamic>>> call(String token) =>
      _repository.validateQrToken(token);
}
