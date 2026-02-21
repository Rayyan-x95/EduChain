import 'package:edulink_mobile/core/network/api_client.dart';
import 'package:edulink_mobile/config/api_constants.dart';
import 'package:edulink_mobile/features/auth/data/models/user_model.dart';

class AuthRemoteDataSource {
  final ApiClient _client;

  AuthRemoteDataSource(this._client);

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
    required String institutionSlug,
  }) async {
    final response = await _client.post<Map<String, dynamic>>(
      ApiConstants.login,
      data: {
        'email': email,
        'password': password,
        'institution_slug': institutionSlug,
      },
    );
    if (!response.isSuccess) {
      throw Exception(response.message);
    }
    return response.data!;
  }

  Future<Map<String, dynamic>> refreshToken(String refreshToken) async {
    final response = await _client.post<Map<String, dynamic>>(
      ApiConstants.refresh,
      data: {'refresh_token': refreshToken},
    );
    if (!response.isSuccess) {
      throw Exception(response.message);
    }
    return response.data!;
  }
}
