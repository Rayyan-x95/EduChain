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
import 'package:edulink_mobile/features/auth/domain/usecases/register_usecase.dart';
import 'package:edulink_mobile/features/auth/presentation/bloc/auth_bloc.dart';

import 'package:edulink_mobile/features/student_profile/data/datasources/profile_remote_datasource.dart';
import 'package:edulink_mobile/features/student_profile/data/repositories/profile_repository_impl.dart';
import 'package:edulink_mobile/features/student_profile/domain/repositories/profile_repository.dart';
import 'package:edulink_mobile/features/student_profile/domain/usecases/get_profile_usecase.dart';
import 'package:edulink_mobile/features/student_profile/domain/usecases/update_profile_usecase.dart';
import 'package:edulink_mobile/features/student_profile/presentation/bloc/profile_bloc.dart';

import 'package:edulink_mobile/features/credentials/data/datasources/credentials_remote_datasource.dart';
import 'package:edulink_mobile/features/credentials/data/repositories/credentials_repository_impl.dart';
import 'package:edulink_mobile/features/credentials/domain/repositories/credentials_repository.dart';
import 'package:edulink_mobile/features/credentials/domain/usecases/get_credentials_usecase.dart';
import 'package:edulink_mobile/features/credentials/presentation/bloc/credentials_bloc.dart';

import 'package:edulink_mobile/features/appeals/data/datasources/appeals_remote_datasource.dart';
import 'package:edulink_mobile/features/appeals/data/repositories/appeals_repository_impl.dart';
import 'package:edulink_mobile/features/appeals/domain/repositories/appeals_repository.dart';
import 'package:edulink_mobile/features/appeals/domain/usecases/get_appeals_usecase.dart';
import 'package:edulink_mobile/features/appeals/domain/usecases/create_appeal_usecase.dart';
import 'package:edulink_mobile/features/appeals/presentation/bloc/appeals_bloc.dart';

import 'package:edulink_mobile/features/endorsements/data/datasources/endorsements_remote_datasource.dart';
import 'package:edulink_mobile/features/endorsements/data/repositories/endorsements_repository_impl.dart';
import 'package:edulink_mobile/features/endorsements/domain/repositories/endorsements_repository.dart';
import 'package:edulink_mobile/features/endorsements/domain/usecases/get_endorsements_usecase.dart';
import 'package:edulink_mobile/features/endorsements/domain/usecases/give_endorsement_usecase.dart';
import 'package:edulink_mobile/features/endorsements/presentation/bloc/endorsements_bloc.dart';

import 'package:edulink_mobile/features/qr_verification/data/datasources/qr_remote_datasource.dart';
import 'package:edulink_mobile/features/qr_verification/data/repositories/qr_repository_impl.dart';
import 'package:edulink_mobile/features/qr_verification/domain/repositories/qr_repository.dart';
import 'package:edulink_mobile/features/qr_verification/domain/usecases/generate_qr_usecase.dart';
import 'package:edulink_mobile/features/qr_verification/domain/usecases/validate_qr_usecase.dart';
import 'package:edulink_mobile/features/qr_verification/presentation/bloc/qr_bloc.dart';

import 'package:edulink_mobile/features/community/data/datasources/community_remote_datasource.dart';
import 'package:edulink_mobile/features/community/data/repositories/community_repository_impl.dart';
import 'package:edulink_mobile/features/community/domain/repositories/community_repository.dart';
import 'package:edulink_mobile/features/community/domain/usecases/community_usecases.dart';
import 'package:edulink_mobile/features/community/presentation/bloc/community_bloc.dart';

import 'package:edulink_mobile/features/github/data/datasources/github_remote_datasource.dart';
import 'package:edulink_mobile/features/github/data/repositories/github_repository_impl.dart';
import 'package:edulink_mobile/features/github/domain/repositories/github_repository.dart';
import 'package:edulink_mobile/features/github/domain/usecases/github_usecases.dart';
import 'package:edulink_mobile/features/github/presentation/bloc/github_bloc.dart';

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
  getIt.registerLazySingleton(() => RegisterUseCase(getIt<AuthRepository>()));
  getIt.registerFactory(
    () => AuthBloc(
      loginUseCase: getIt<LoginUseCase>(),
      registerUseCase: getIt<RegisterUseCase>(),
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
  getIt.registerLazySingleton(
    () => GetProfileUseCase(getIt<ProfileRepository>()),
  );
  getIt.registerLazySingleton(
    () => UpdateProfileUseCase(getIt<ProfileRepository>()),
  );
  getIt.registerFactory(
    () => ProfileBloc(
      getProfileUseCase: getIt<GetProfileUseCase>(),
      updateProfileUseCase: getIt<UpdateProfileUseCase>(),
    ),
  );

  // ----- Credentials -----
  getIt.registerLazySingleton<CredentialsRemoteDataSource>(
    () => CredentialsRemoteDataSource(getIt<ApiClient>()),
  );
  getIt.registerLazySingleton<CredentialsRepository>(
    () => CredentialsRepositoryImpl(getIt<CredentialsRemoteDataSource>()),
  );
  getIt.registerLazySingleton(
    () => GetCredentialsUseCase(getIt<CredentialsRepository>()),
  );
  getIt.registerFactory(
    () => CredentialsBloc(
      getCredentialsUseCase: getIt<GetCredentialsUseCase>(),
    ),
  );

  // ----- Appeals -----
  getIt.registerLazySingleton<AppealsRemoteDataSource>(
    () => AppealsRemoteDataSource(getIt<ApiClient>()),
  );
  getIt.registerLazySingleton<AppealsRepository>(
    () => AppealsRepositoryImpl(getIt<AppealsRemoteDataSource>()),
  );
  getIt.registerLazySingleton(
    () => GetAppealsUseCase(getIt<AppealsRepository>()),
  );
  getIt.registerLazySingleton(
    () => CreateAppealUseCase(getIt<AppealsRepository>()),
  );
  getIt.registerFactory(
    () => AppealsBloc(
      getAppealsUseCase: getIt<GetAppealsUseCase>(),
      createAppealUseCase: getIt<CreateAppealUseCase>(),
    ),
  );

  // ----- Endorsements -----
  getIt.registerLazySingleton<EndorsementsRemoteDataSource>(
    () => EndorsementsRemoteDataSource(getIt<ApiClient>()),
  );
  getIt.registerLazySingleton<EndorsementsRepository>(
    () => EndorsementsRepositoryImpl(getIt<EndorsementsRemoteDataSource>()),
  );
  getIt.registerLazySingleton(
    () => GetEndorsementsUseCase(getIt<EndorsementsRepository>()),
  );
  getIt.registerLazySingleton(
    () => GiveEndorsementUseCase(getIt<EndorsementsRepository>()),
  );
  getIt.registerFactory(
    () => EndorsementsBloc(
      getEndorsementsUseCase: getIt<GetEndorsementsUseCase>(),
      giveEndorsementUseCase: getIt<GiveEndorsementUseCase>(),
    ),
  );

  // ----- QR Verification -----
  getIt.registerLazySingleton<QrRemoteDataSource>(
    () => QrRemoteDataSource(getIt<ApiClient>()),
  );
  getIt.registerLazySingleton<QrRepository>(
    () => QrRepositoryImpl(getIt<QrRemoteDataSource>()),
  );
  getIt.registerLazySingleton(
    () => GenerateQrUseCase(getIt<QrRepository>()),
  );
  getIt.registerLazySingleton(
    () => ValidateQrUseCase(getIt<QrRepository>()),
  );
  getIt.registerFactory(
    () => QrBloc(
      generateQrUseCase: getIt<GenerateQrUseCase>(),
      validateQrUseCase: getIt<ValidateQrUseCase>(),
    ),
  );

  // ----- Community -----
  getIt.registerLazySingleton<CommunityRemoteDataSource>(
    () => CommunityRemoteDataSource(getIt<ApiClient>()),
  );
  getIt.registerLazySingleton<CommunityRepository>(
    () => CommunityRepositoryImpl(getIt<CommunityRemoteDataSource>()),
  );
  getIt.registerLazySingleton(
    () => GetLeaderboardUseCase(getIt<CommunityRepository>()),
  );
  getIt.registerLazySingleton(
    () => GetReputationUseCase(getIt<CommunityRepository>()),
  );
  getIt.registerLazySingleton(
    () => GetBadgesUseCase(getIt<CommunityRepository>()),
  );
  getIt.registerFactory(
    () => CommunityBloc(
      getLeaderboardUseCase: getIt<GetLeaderboardUseCase>(),
      getReputationUseCase: getIt<GetReputationUseCase>(),
      getBadgesUseCase: getIt<GetBadgesUseCase>(),
    ),
  );

  // ----- GitHub -----
  getIt.registerLazySingleton<GithubRemoteDataSource>(
    () => GithubRemoteDataSource(getIt<ApiClient>()),
  );
  getIt.registerLazySingleton<GithubRepository>(
    () => GithubRepositoryImpl(getIt<GithubRemoteDataSource>()),
  );
  getIt.registerLazySingleton(
    () => ConnectGithubUseCase(getIt<GithubRepository>()),
  );
  getIt.registerLazySingleton(
    () => CompleteGithubConnectionUseCase(getIt<GithubRepository>()),
  );
  getIt.registerLazySingleton(
    () => GetGithubContributionsUseCase(getIt<GithubRepository>()),
  );
  getIt.registerLazySingleton(
    () => DisconnectGithubUseCase(getIt<GithubRepository>()),
  );
  getIt.registerFactory(
    () => GithubBloc(
      connectGithubUseCase: getIt<ConnectGithubUseCase>(),
      completeConnectionUseCase: getIt<CompleteGithubConnectionUseCase>(),
      getContributionsUseCase: getIt<GetGithubContributionsUseCase>(),
      disconnectGithubUseCase: getIt<DisconnectGithubUseCase>(),
    ),
  );
}
