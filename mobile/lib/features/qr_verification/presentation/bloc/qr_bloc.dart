import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:edulink_mobile/features/qr_verification/domain/usecases/generate_qr_usecase.dart';
import 'package:edulink_mobile/features/qr_verification/domain/usecases/validate_qr_usecase.dart';

// Events
abstract class QrEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class QrGenerateRequested extends QrEvent {}

class QrValidateRequested extends QrEvent {
  final String token;
  QrValidateRequested(this.token);

  @override
  List<Object?> get props => [token];
}

// States
abstract class QrState extends Equatable {
  @override
  List<Object?> get props => [];
}

class QrInitial extends QrState {}
class QrLoading extends QrState {}

class QrGenerated extends QrState {
  final String token;
  QrGenerated(this.token);

  @override
  List<Object?> get props => [token];
}

class QrValidated extends QrState {
  final Map<String, dynamic> result;
  QrValidated(this.result);

  @override
  List<Object?> get props => [result];
}

class QrError extends QrState {
  final String message;
  QrError(this.message);

  @override
  List<Object?> get props => [message];
}

// Bloc
class QrBloc extends Bloc<QrEvent, QrState> {
  final GenerateQrUseCase generateQrUseCase;
  final ValidateQrUseCase validateQrUseCase;

  QrBloc({
    required this.generateQrUseCase,
    required this.validateQrUseCase,
  }) : super(QrInitial()) {
    on<QrGenerateRequested>(_onGenerate);
    on<QrValidateRequested>(_onValidate);
  }

  Future<void> _onGenerate(
    QrGenerateRequested event,
    Emitter<QrState> emit,
  ) async {
    emit(QrLoading());
    final result = await generateQrUseCase();
    result.fold(
      (error) => emit(QrError(error)),
      (token) => emit(QrGenerated(token)),
    );
  }

  Future<void> _onValidate(
    QrValidateRequested event,
    Emitter<QrState> emit,
  ) async {
    emit(QrLoading());
    final result = await validateQrUseCase(event.token);
    result.fold(
      (error) => emit(QrError(error)),
      (data) => emit(QrValidated(data)),
    );
  }
}
