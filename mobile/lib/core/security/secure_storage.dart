import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:edulink_mobile/config/storage_keys.dart';

class SecureStorageService {
  final FlutterSecureStorage _storage;

  SecureStorageService(this._storage);

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _storage.write(key: StorageKeys.accessToken, value: accessToken);
    await _storage.write(key: StorageKeys.refreshToken, value: refreshToken);
  }

  Future<String?> getAccessToken() async {
    return _storage.read(key: StorageKeys.accessToken);
  }

  Future<String?> getRefreshToken() async {
    return _storage.read(key: StorageKeys.refreshToken);
  }

  Future<void> saveUserId(String userId) async {
    await _storage.write(key: StorageKeys.userId, value: userId);
  }

  Future<String?> getUserId() async {
    return _storage.read(key: StorageKeys.userId);
  }

  Future<void> saveUserType(String userType) async {
    await _storage.write(key: StorageKeys.userType, value: userType);
  }

  Future<String?> getUserType() async {
    return _storage.read(key: StorageKeys.userType);
  }

  Future<void> saveInstitutionId(String institutionId) async {
    await _storage.write(
        key: StorageKeys.institutionId, value: institutionId);
  }

  Future<String?> getInstitutionId() async {
    return _storage.read(key: StorageKeys.institutionId);
  }

  Future<void> setBiometricEnabled(bool enabled) async {
    await _storage.write(
        key: StorageKeys.biometricEnabled, value: enabled.toString());
  }

  Future<bool> isBiometricEnabled() async {
    final value = await _storage.read(key: StorageKeys.biometricEnabled);
    return value == 'true';
  }

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
