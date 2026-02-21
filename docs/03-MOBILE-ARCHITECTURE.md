# Mobile App Architecture — EduLink (Flutter)

> Flutter 3.x | Dart 3.x | Clean Architecture + BLoC  
> Platforms: iOS + Android (single codebase)

---

## Folder Structure

```
edulink_mobile/
├── android/                          # Android platform files
├── ios/                              # iOS platform files
├── assets/
│   ├── images/
│   ├── icons/
│   ├── lottie/                       # Lottie animations (onboarding, success, etc.)
│   └── fonts/
│
├── lib/
│   ├── main.dart                     # App entry point
│   ├── app.dart                      # MaterialApp / router setup
│   │
│   ├── config/
│   │   ├── app_config.dart           # Base URL, environment flags
│   │   ├── theme/
│   │   │   ├── app_theme.dart        # Light & dark theme definitions
│   │   │   ├── app_colors.dart       # Color constants
│   │   │   └── app_typography.dart   # Text styles
│   │   ├── routes/
│   │   │   ├── app_router.dart       # GoRouter / AutoRoute config
│   │   │   └── route_names.dart      # Named route constants
│   │   └── constants/
│   │       ├── api_constants.dart    # Endpoint paths
│   │       ├── storage_keys.dart     # Secure storage keys
│   │       └── app_constants.dart    # Misc constants
│   │
│   ├── core/                         # Cross-cutting utilities
│   │   ├── di/
│   │   │   └── injection.dart        # get_it service locator setup
│   │   ├── network/
│   │   │   ├── api_client.dart       # Dio HTTP client (interceptors, cert pinning)
│   │   │   ├── api_interceptor.dart  # Auth token injection, refresh logic
│   │   │   ├── api_response.dart     # Generic response wrapper
│   │   │   └── network_info.dart     # Connectivity checker
│   │   ├── error/
│   │   │   ├── exceptions.dart       # Custom exception classes
│   │   │   └── failures.dart         # Failure sealed classes
│   │   ├── security/
│   │   │   ├── secure_storage.dart   # flutter_secure_storage wrapper
│   │   │   ├── biometric_auth.dart   # local_auth wrapper
│   │   │   ├── root_detection.dart   # Root/jailbreak detection
│   │   │   └── crypto_utils.dart     # Client-side signature verification
│   │   ├── utils/
│   │   │   ├── date_utils.dart
│   │   │   ├── validators.dart       # Email, password, enrollment validators
│   │   │   ├── qr_utils.dart         # QR code generation/scanning helpers
│   │   │   └── logger.dart           # Structured logging
│   │   └── widgets/                  # Shared widgets
│   │       ├── loading_widget.dart
│   │       ├── error_widget.dart
│   │       ├── empty_state.dart
│   │       ├── app_button.dart
│   │       ├── app_text_field.dart
│   │       ├── status_badge.dart
│   │       └── credential_card.dart
│   │
│   ├── features/                     # Feature modules (Clean Architecture)
│   │   │
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   │   ├── datasources/
│   │   │   │   │   ├── auth_remote_datasource.dart
│   │   │   │   │   └── auth_local_datasource.dart
│   │   │   │   ├── models/
│   │   │   │   │   ├── login_request_model.dart
│   │   │   │   │   ├── register_request_model.dart
│   │   │   │   │   └── token_model.dart
│   │   │   │   └── repositories/
│   │   │   │       └── auth_repository_impl.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── user_entity.dart
│   │   │   │   ├── repositories/
│   │   │   │   │   └── auth_repository.dart            # Abstract
│   │   │   │   └── usecases/
│   │   │   │       ├── login_usecase.dart
│   │   │   │       ├── register_usecase.dart
│   │   │   │       ├── verify_email_usecase.dart
│   │   │   │       └── refresh_token_usecase.dart
│   │   │   └── presentation/
│   │   │       ├── bloc/
│   │   │       │   ├── auth_bloc.dart
│   │   │       │   ├── auth_event.dart
│   │   │       │   └── auth_state.dart
│   │   │       ├── pages/
│   │   │       │   ├── login_page.dart
│   │   │       │   ├── register_page.dart
│   │   │       │   ├── verify_email_page.dart
│   │   │       │   └── forgot_password_page.dart
│   │   │       └── widgets/
│   │   │           └── auth_form.dart
│   │   │
│   │   ├── student_profile/
│   │   │   ├── data/
│   │   │   │   ├── datasources/
│   │   │   │   │   └── student_remote_datasource.dart
│   │   │   │   ├── models/
│   │   │   │   │   ├── student_profile_model.dart
│   │   │   │   │   └── id_card_model.dart
│   │   │   │   └── repositories/
│   │   │   │       └── student_repository_impl.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── student_profile.dart
│   │   │   │   │   └── digital_id_card.dart
│   │   │   │   ├── repositories/
│   │   │   │   │   └── student_repository.dart
│   │   │   │   └── usecases/
│   │   │   │       ├── get_profile_usecase.dart
│   │   │   │       ├── update_profile_usecase.dart
│   │   │   │       ├── get_id_card_usecase.dart
│   │   │   │       └── update_privacy_usecase.dart
│   │   │   └── presentation/
│   │   │       ├── bloc/
│   │   │       │   ├── profile_bloc.dart
│   │   │       │   ├── profile_event.dart
│   │   │       │   └── profile_state.dart
│   │   │       ├── pages/
│   │   │       │   ├── profile_page.dart
│   │   │       │   ├── id_card_page.dart
│   │   │       │   └── privacy_settings_page.dart
│   │   │       └── widgets/
│   │   │           ├── id_card_widget.dart
│   │   │           └── profile_header.dart
│   │   │
│   │   ├── credentials/
│   │   │   ├── data/
│   │   │   │   ├── datasources/
│   │   │   │   │   └── credential_remote_datasource.dart
│   │   │   │   ├── models/
│   │   │   │   │   ├── credential_model.dart
│   │   │   │   │   └── credential_version_model.dart
│   │   │   │   └── repositories/
│   │   │   │       └── credential_repository_impl.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── credential.dart
│   │   │   │   ├── repositories/
│   │   │   │   │   └── credential_repository.dart
│   │   │   │   └── usecases/
│   │   │   │       ├── get_credentials_usecase.dart
│   │   │   │       ├── get_credential_detail_usecase.dart
│   │   │   │       ├── verify_credential_usecase.dart
│   │   │   │       ├── export_pdf_usecase.dart
│   │   │   │       └── share_credential_usecase.dart
│   │   │   └── presentation/
│   │   │       ├── bloc/
│   │   │       │   ├── credential_bloc.dart
│   │   │       │   ├── credential_event.dart
│   │   │       │   └── credential_state.dart
│   │   │       ├── pages/
│   │   │       │   ├── credential_vault_page.dart
│   │   │       │   ├── credential_detail_page.dart
│   │   │       │   └── credential_share_page.dart
│   │   │       └── widgets/
│   │   │           ├── credential_list_tile.dart
│   │   │           ├── credential_badge.dart
│   │   │           └── signature_status.dart
│   │   │
│   │   ├── qr_verification/
│   │   │   ├── data/
│   │   │   │   ├── datasources/
│   │   │   │   │   └── qr_remote_datasource.dart
│   │   │   │   ├── models/
│   │   │   │   │   └── qr_token_model.dart
│   │   │   │   └── repositories/
│   │   │   │       └── qr_repository_impl.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── qr_verification_result.dart
│   │   │   │   ├── repositories/
│   │   │   │   │   └── qr_repository.dart
│   │   │   │   └── usecases/
│   │   │   │       ├── generate_qr_usecase.dart
│   │   │   │       └── validate_qr_usecase.dart
│   │   │   └── presentation/
│   │   │       ├── bloc/
│   │   │       │   ├── qr_bloc.dart
│   │   │       │   ├── qr_event.dart
│   │   │       │   └── qr_state.dart
│   │   │       ├── pages/
│   │   │       │   ├── qr_display_page.dart       # Show own QR
│   │   │       │   ├── qr_scanner_page.dart       # Scan others' QR
│   │   │       │   └── qr_result_page.dart        # Verification result
│   │   │       └── widgets/
│   │   │           ├── qr_code_widget.dart
│   │   │           ├── qr_timer_widget.dart        # Countdown to expiry
│   │   │           └── verification_result_card.dart
│   │   │
│   │   ├── appeals/
│   │   │   ├── data/...
│   │   │   ├── domain/...
│   │   │   └── presentation/
│   │   │       ├── bloc/
│   │   │       ├── pages/
│   │   │       │   ├── appeal_page.dart
│   │   │       │   └── appeal_status_page.dart
│   │   │       └── widgets/
│   │   │
│   │   ├── endorsements/
│   │   │   ├── data/...
│   │   │   ├── domain/...
│   │   │   └── presentation/
│   │   │       ├── bloc/
│   │   │       ├── pages/
│   │   │       │   ├── endorsements_page.dart
│   │   │       │   └── give_endorsement_page.dart
│   │   │       └── widgets/
│   │   │           └── endorsement_tile.dart
│   │   │
│   │   ├── community/
│   │   │   ├── data/...
│   │   │   ├── domain/...
│   │   │   └── presentation/
│   │   │       ├── bloc/
│   │   │       ├── pages/
│   │   │       │   ├── reputation_page.dart
│   │   │       │   ├── badges_page.dart
│   │   │       │   └── leaderboard_page.dart
│   │   │       └── widgets/
│   │   │           ├── reputation_breakdown.dart
│   │   │           └── badge_card.dart
│   │   │
│   │   ├── github/
│   │   │   ├── data/...
│   │   │   ├── domain/...
│   │   │   └── presentation/
│   │   │       ├── bloc/
│   │   │       ├── pages/
│   │   │       │   └── github_connect_page.dart
│   │   │       └── widgets/
│   │   │           └── contribution_summary_card.dart
│   │   │
│   │   └── settings/
│   │       └── presentation/
│   │           └── pages/
│   │               ├── settings_page.dart
│   │               ├── about_page.dart
│   │               └── data_deletion_page.dart
│   │
│   └── l10n/                          # Localization
│       ├── app_en.arb
│       └── app_hi.arb                 # Hindi (optional)
│
├── test/
│   ├── unit/
│   │   ├── auth/
│   │   ├── credentials/
│   │   └── qr_verification/
│   ├── widget/
│   │   ├── auth/
│   │   └── credentials/
│   └── integration/
│       └── app_test.dart
│
├── pubspec.yaml
├── analysis_options.yaml
└── README.md
```

---

## Key Dependencies (`pubspec.yaml`)

```yaml
dependencies:
  flutter:
    sdk: flutter

  # State Management
  flutter_bloc: ^8.1.0
  equatable: ^2.0.0

  # Dependency Injection
  get_it: ^7.6.0
  injectable: ^2.3.0

  # Networking
  dio: ^5.4.0
  pretty_dio_logger: ^1.3.0

  # Routing
  go_router: ^13.0.0

  # Security
  flutter_secure_storage: ^9.0.0
  local_auth: ^2.1.0
  root_checker_plus: ^1.0.0

  # QR Code
  qr_flutter: ^4.1.0                   # QR display
  mobile_scanner: ^4.0.0               # QR scanning

  # UI
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  lottie: ^3.0.0
  fl_chart: ^0.66.0                    # Charts for reputation

  # Storage
  shared_preferences: ^2.0.0
  sqflite: ^2.3.0                      # Local DB
  path_provider: ^2.1.0

  # Utils
  intl: ^0.19.0
  json_annotation: ^4.8.0
  freezed_annotation: ^2.4.0
  dartz: ^0.10.1                       # Functional programming (Either)
  url_launcher: ^6.2.0
  share_plus: ^7.2.0
  pdf: ^3.10.0                         # PDF generation
  printing: ^5.12.0                    # PDF printing/sharing

dev_dependencies:
  flutter_test:
    sdk: flutter
  build_runner: ^2.4.0
  json_serializable: ^6.7.0
  freezed: ^2.4.0
  injectable_generator: ^2.4.0
  bloc_test: ^9.1.0
  mocktail: ^1.0.0
  flutter_lints: ^3.0.0
```

---

## App Navigation Flow

```
                         ┌──────────────┐
                         │  Splash /    │
                         │  Biometric   │
                         └──────┬───────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
               No Token    Valid Token   Expired
                    │           │           │
                    ▼           ▼           ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │  Login   │ │  Home    │ │ Refresh  │
              │  Page    │ │  (Shell) │ │  → Login │
              └──────────┘ └────┬─────┘ └──────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                  │
              ▼                 ▼                  ▼
        ┌──────────┐     ┌──────────┐      ┌──────────┐
        │  ID Card │     │Credential│      │ Community │
        │  + QR    │     │  Vault   │      │  + Rep    │
        └──────────┘     └──────────┘      └──────────┘
              │                 │                  │
         ┌────┴────┐     ┌─────┴─────┐     ┌─────┴─────┐
         │ QR Show │     │ Detail    │     │ Endorsements│
         │ QR Scan │     │ Versions  │     │ Badges     │
         │ Result  │     │ PDF Export│     │ Leaderboard│
         └─────────┘     │ Share QR  │     └───────────┘
                         └───────────┘
```

---

## Security Implementation

### Biometric Lock Flow

```dart
// core/security/biometric_auth.dart
class BiometricAuth {
  final LocalAuthentication _localAuth = LocalAuthentication();
  
  Future<bool> authenticate() async {
    final canCheck = await _localAuth.canCheckBiometrics;
    if (!canCheck) return true; // Skip if not available
    
    return _localAuth.authenticate(
      localizedReason: 'Authenticate to access EduLink',
      options: const AuthenticationOptions(
        stickyAuth: true,
        biometricOnly: false, // Allow PIN fallback
      ),
    );
  }
}
```

### Certificate Pinning

```dart
// core/network/api_client.dart
Dio createDio() {
  final dio = Dio(BaseOptions(
    baseUrl: AppConfig.apiBaseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 30),
  ));
  
  // Certificate pinning
  (dio.httpClientAdapter as IOHttpClientAdapter).onHttpClientCreate = (client) {
    client.badCertificateCallback = (cert, host, port) {
      // Compare cert fingerprint with pinned certificate
      return _validateCertificate(cert);
    };
    return client;
  };
  
  dio.interceptors.addAll([
    AuthInterceptor(),
    LoggingInterceptor(),
    RetryInterceptor(),
  ]);
  
  return dio;
}
```

### Client-Side Signature Verification

```dart
// core/security/crypto_utils.dart
import 'package:pointycastle/export.dart';

class CryptoUtils {
  /// Verify ECDSA P-256 signature locally on device
  static bool verifySignature({
    required Map<String, dynamic> payload,
    required Uint8List signature,
    required String publicKeyPem,
  }) {
    final canonicalJson = jsonEncode(
      SplayTreeMap<String, dynamic>.from(payload),
    );
    final hash = SHA256Digest().process(
      utf8.encode(canonicalJson) as Uint8List,
    );
    
    final publicKey = _loadPublicKey(publicKeyPem);
    final verifier = ECDSASigner(SHA256Digest(), null)
      ..init(false, PublicKeyParameter<ECPublicKey>(publicKey));
    
    return verifier.verifySignature(hash, _decodeSignature(signature));
  }
}
```
