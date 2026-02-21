import 'package:dartz/dartz.dart';
import 'package:edulink_mobile/features/qr_verification/domain/repositories/qr_repository.dart';

class GenerateQrUseCase {
  final QrRepository _repository;
  GenerateQrUseCase(this._repository);

  Future<Either<String, String>> call() => _repository.generateQrToken();
}
