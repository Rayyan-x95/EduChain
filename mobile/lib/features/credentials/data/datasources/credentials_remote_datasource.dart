import 'package:edulink_mobile/core/network/api_client.dart';
import 'package:edulink_mobile/config/api_constants.dart';
import 'package:edulink_mobile/features/credentials/data/models/credential_model.dart';

class CredentialsRemoteDataSource {
  final ApiClient _client;

  CredentialsRemoteDataSource(this._client);

  Future<List<CredentialModel>> getCredentials() async {
    final response = await _client.get<List<dynamic>>(ApiConstants.credentials);
    if (!response.isSuccess) throw Exception(response.message);
    return (response.data!)
        .map((e) => CredentialModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<CredentialModel> getCredential(String id) async {
    final response = await _client.get<Map<String, dynamic>>(
      ApiConstants.credentialById(id),
    );
    if (!response.isSuccess) throw Exception(response.message);
    return CredentialModel.fromJson(response.data!);
  }

  Future<Map<String, dynamic>> verifyCredential(String id) async {
    final response = await _client.get<Map<String, dynamic>>(
      ApiConstants.credentialVerify(id),
    );
    if (!response.isSuccess) throw Exception(response.message);
    return response.data!;
  }

  Future<void> updateVisibility(String id, bool isPublic) async {
    final response = await _client.patch<Map<String, dynamic>>(
      ApiConstants.credentialVisibility(id),
      data: {'is_public': isPublic},
    );
    if (!response.isSuccess) throw Exception(response.message);
  }
}
