import 'package:edulink_mobile/core/network/api_client.dart';
import 'package:edulink_mobile/config/api_constants.dart';

class GithubRemoteDataSource {
  final ApiClient _client;
  GithubRemoteDataSource(this._client);

  Future<String> getConnectUrl() async {
    final response =
        await _client.get<Map<String, dynamic>>(ApiConstants.githubConnect);
    if (!response.isSuccess) throw Exception(response.message);
    return response.data!['url'] as String;
  }

  Future<Map<String, dynamic>> completeConnection(String code) async {
    final response = await _client.post<Map<String, dynamic>>(
      ApiConstants.githubCallback,
      data: {'code': code},
    );
    if (!response.isSuccess) throw Exception(response.message);
    return response.data!;
  }

  Future<List<dynamic>> getContributions() async {
    final response =
        await _client.get<List<dynamic>>(ApiConstants.githubContributions);
    if (!response.isSuccess) throw Exception(response.message);
    return response.data!;
  }

  Future<void> disconnect() async {
    final response = await _client
        .delete<Map<String, dynamic>>(ApiConstants.githubDisconnect);
    if (!response.isSuccess) throw Exception(response.message);
  }
}
