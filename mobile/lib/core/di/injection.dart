import 'package:get_it/get_it.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:edulink_mobile/core/network/api_client.dart';
import 'package:edulink_mobile/core/security/secure_storage.dart';
import 'package:edulink_mobile/core/security/biometric_auth.dart';

import 'package:edulink_mobile/features/auth/data/datasources/auth_remote_datasource.dart';
import 'package:edulink_mobile/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:edulink_mobile/features/auth/domain/repositories/auth_repository.dart';
import 'package:edulink_mobile/features/auth/domain/usecases/login_usecase.dart';
import 'package:edulink_mobile/features/auth/presentation/bloc/auth_bloc.dart';

import 'package:edulink_mobile/features/student_profile/data/datasources/profile_remote_datasource.dart';
import 'package:edulink_mobile/features/student_profile/data/repositories/profile_repository_impl.dart';
import 'package:edulink_mobile/features/student_profile/domain/repositories/profile_repository.dart';
import 'package:edulink_mobile/features/student_profile/domain/usecases/get_profile_usecase.dart';
import 'package:edulink_mobile/features/student_profile/presentation/bloc/profile_bloc.dart';

import 'package:edulink_mobile/features/credentials/data/datasources/credentials_remote_datasource.dart';
import 'package:edulink_mobile/features/credentials/data/repositories/credentials_repository_impl.dart';
import 'package:edulink_mobile/features/credentials/domain/repositories/credentials_repository.dart';
import 'package:edulink_mobile/features/credentials/domain/usecases/get_credentials_usecase.dart';
import 'package:edulink_mobile/features/credentials/presentation/bloc/credentials_bloc.dart';

import 'package:edulink_mobile/features/qr_verification/data/datasources/qr_remote_datasource.dart';
import 'package:edulink_mobile/features/qr_verification/data/repositories/qr_repository_impl.dart';
import 'package:edulink_mobile/features/qr_verification/domain/repositories/qr_repository.dart';
import 'package:edulink_mobile/features/qr_verification/domain/usecases/generate_qr_usecase.dart';
import 'package:edulink_mobile/features/qr_verification/domain/usecases/validate_qr_usecase.dart';
import 'package:edulink_mobile/features/qr_verification/presentation/bloc/qr_bloc.dart';

final getIt = GetIt.instance;

Future<void> setupDependencies() async {
  // External
  final prefs = await SharedPreferences.getInstance();
  getIt.registerSingleton<SharedPreferences>(prefs);
  getIt.registerSingleton<FlutterSecureStorage>(const FlutterSecureStorage());

  // Core
  final secureStorage = SecureStorageService(getIt<FlutterSecureStorage>());
  getIt.registerSingleton<SecureStorageService>(secureStorage);
  getIt.registerSingleton<BiometricAuth>(BiometricAuth());
  getIt.registerSingleton<ApiClient>(
    ApiClient(secureStorage: secureStorage),
  );

  // ----- Auth -----
  getIt.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSource(getIt<ApiClient>()),
  );
  getIt.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(getIt<AuthRemoteDataSource>()),
  );
  getIt.registerLazySingleton(() => LoginUseCase(getIt<AuthRepository>()));
  getIt.registerFactory(
    () => AuthBloc(
      loginUseCase: getIt<LoginUseCase>(),
      secureStorage: getIt<SecureStorageService>(),
    ),
  );

  // ----- Profile -----
  getIt.registerLazySingleton<ProfileRemoteDataSource>(
    () => ProfileRemoteDataSource(getIt<ApiClient>()),
  );
  getIt.registerLazySingleton<ProfileRepository>(
    () => ProfileRepositoryImpl(getIt<ProfileRemoteDataSource>()),
  );
  getIt.registerLazySingleton(() => GetProfileUseCase(getIt<ProfileRepository>()));
  getIt.registerFactory(
    () => ProfileBloc(
      getProfileUseCase: getIt<GetProfileUseCase>(),
    ),
  );

  // ----- Credentials -----
  getIt.registerLazySingleton<CredentialsRemoteDataSource>(
    () => CredentialsRemoteDataSource(getIt<ApiClient>()),
  );
  getIt.registerLazySingleton<CredentialsRepository>(
    () => CredentialsRepositoryImpl(getIt<CredentialsRemoteDataSource>()),
  );
  getIt.registerLazySingleton(() => GetCredentialsUseCase(getIt<CredentialsRepository>()));
  getIt.registerFactory(
    () => CredentialsBloc(
      getCredentialsUseCase: getIt<GetCredentialsUseCase>(),
    ),
  );

  // ----- QR Verification -----
  getIt.registerLazySingleton<QrRemoteDataSource>(
    () => QrRemoteDataSource(getIt<ApiClient>()),
  );
  getIt.registerLazySingleton<QrRepository>(
    () => QrRepositoryImpl(getIt<QrRemoteDataSource>()),
  );
  getIt.registerLazySingleton(() => GenerateQrUseCase(getIt<QrRepository>()));
  getIt.registerLazySingleton(() => ValidateQrUseCase(getIt<QrRepository>()));
  getIt.registerFactory(
    () => QrBloc(
      generateQrUseCase: getIt<GenerateQrUseCase>(),
      validateQrUseCase: getIt<ValidateQrUseCase>(),
    ),
  );
}
