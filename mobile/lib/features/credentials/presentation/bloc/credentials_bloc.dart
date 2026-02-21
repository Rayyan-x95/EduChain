import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:edulink_mobile/features/credentials/domain/entities/credential_entity.dart';
import 'package:edulink_mobile/features/credentials/domain/usecases/get_credentials_usecase.dart';

// Events
abstract class CredentialsEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class CredentialsLoadRequested extends CredentialsEvent {}

// States
abstract class CredentialsState extends Equatable {
  @override
  List<Object?> get props => [];
}

class CredentialsInitial extends CredentialsState {}
class CredentialsLoading extends CredentialsState {}

class CredentialsLoaded extends CredentialsState {
  final List<CredentialEntity> credentials;
  CredentialsLoaded(this.credentials);

  @override
  List<Object?> get props => [credentials.length];
}

class CredentialsError extends CredentialsState {
  final String message;
  CredentialsError(this.message);

  @override
  List<Object?> get props => [message];
}

// Bloc
class CredentialsBloc extends Bloc<CredentialsEvent, CredentialsState> {
  final GetCredentialsUseCase getCredentialsUseCase;

  CredentialsBloc({required this.getCredentialsUseCase})
      : super(CredentialsInitial()) {
    on<CredentialsLoadRequested>(_onLoad);
  }

  Future<void> _onLoad(
    CredentialsLoadRequested event,
    Emitter<CredentialsState> emit,
  ) async {
    emit(CredentialsLoading());
    final result = await getCredentialsUseCase();
    result.fold(
      (error) => emit(CredentialsError(error)),
      (creds) => emit(CredentialsLoaded(creds)),
    );
  }
}
