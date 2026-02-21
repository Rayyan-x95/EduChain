import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:edulink_mobile/features/auth/domain/entities/user_entity.dart';
import 'package:edulink_mobile/features/auth/domain/usecases/login_usecase.dart';
import 'package:edulink_mobile/features/auth/domain/usecases/register_usecase.dart';
import 'package:edulink_mobile/core/security/secure_storage.dart';

// Events
abstract class AuthEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class AuthCheckRequested extends AuthEvent {}

class AuthLoginRequested extends AuthEvent {
  final String email;
  final String password;
  final String institutionSlug;

  AuthLoginRequested({
    required this.email,
    required this.password,
    required this.institutionSlug,
  });

  @override
  List<Object?> get props => [email, password, institutionSlug];
}

class AuthRegisterRequested extends AuthEvent {
  final String email;
  final String password;
  final String fullName;
  final String enrollmentNumber;
  final String institutionSlug;
  final String? department;
  final String? program;
  final int? graduationYear;

  AuthRegisterRequested({
    required this.email,
    required this.password,
    required this.fullName,
    required this.enrollmentNumber,
    required this.institutionSlug,
    this.department,
    this.program,
    this.graduationYear,
  });

  @override
  List<Object?> get props => [email, fullName, enrollmentNumber, institutionSlug];
}

class AuthLogoutRequested extends AuthEvent {}

// States
abstract class AuthState extends Equatable {
  @override
  List<Object?> get props => [];
}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthAuthenticated extends AuthState {
  final UserEntity user;

  AuthAuthenticated(this.user);

  @override
  List<Object?> get props => [user.id];
}

class AuthUnauthenticated extends AuthState {}

class AuthError extends AuthState {
  final String message;

  AuthError(this.message);

  @override
  List<Object?> get props => [message];
}

// Bloc
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginUseCase loginUseCase;
  final RegisterUseCase registerUseCase;
  final SecureStorageService secureStorage;

  AuthBloc({
    required this.loginUseCase,
    required this.registerUseCase,
    required this.secureStorage,
  }) : super(AuthInitial()) {
    on<AuthCheckRequested>(_onCheckRequested);
    on<AuthLoginRequested>(_onLoginRequested);
    on<AuthRegisterRequested>(_onRegisterRequested);
    on<AuthLogoutRequested>(_onLogoutRequested);
  }

  Future<void> _onCheckRequested(
    AuthCheckRequested event,
    Emitter<AuthState> emit,
  ) async {
    final token = await secureStorage.getAccessToken();
    if (token != null) {
      // We have a stored token — create a minimal user from storage
      final userId = await secureStorage.getUserId();
      final userType = await secureStorage.getUserType();
      if (userId != null) {
        emit(AuthAuthenticated(UserEntity(
          id: userId,
          email: '',
          fullName: '',
          userType: userType ?? 'STUDENT',
          status: 'VERIFIED',
          institutionId: '',
          createdAt: DateTime.now(),
        )));
        return;
      }
    }
    emit(AuthUnauthenticated());
  }

  Future<void> _onLoginRequested(
    AuthLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    final result = await loginUseCase(
      email: event.email,
      password: event.password,
      institutionSlug: event.institutionSlug,
    );
    result.fold(
      (error) => emit(AuthError(error)),
      (data) async {
        await secureStorage.saveTokens(
          accessToken: data.tokens.accessToken,
          refreshToken: data.tokens.refreshToken,
        );
        await secureStorage.saveUserId(data.user.id);
        await secureStorage.saveUserType(data.user.userType);
        await secureStorage.saveInstitutionId(data.user.institutionId);
        emit(AuthAuthenticated(data.user));
      },
    );
  }

  Future<void> _onRegisterRequested(
    AuthRegisterRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    final result = await registerUseCase(
      email: event.email,
      password: event.password,
      fullName: event.fullName,
      enrollmentNumber: event.enrollmentNumber,
      institutionSlug: event.institutionSlug,
      department: event.department,
      program: event.program,
      graduationYear: event.graduationYear,
    );
    result.fold(
      (error) => emit(AuthError(error)),
      (data) async {
        await secureStorage.saveTokens(
          accessToken: data.tokens.accessToken,
          refreshToken: data.tokens.refreshToken,
        );
        await secureStorage.saveUserId(data.user.id);
        await secureStorage.saveUserType(data.user.userType);
        await secureStorage.saveInstitutionId(data.user.institutionId);
        emit(AuthAuthenticated(data.user));
      },
    );
  }

  Future<void> _onLogoutRequested(
    AuthLogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    await secureStorage.clearAll();
    emit(AuthUnauthenticated());
  }
}
