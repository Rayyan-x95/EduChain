import 'package:edulink_mobile/core/network/api_client.dart';
import 'package:edulink_mobile/config/api_constants.dart';

class CommunityRemoteDataSource {
  final ApiClient _client;
  CommunityRemoteDataSource(this._client);

  Future<Map<String, dynamic>> getMyReputation() async {
    final response =
        await _client.get<Map<String, dynamic>>(ApiConstants.reputation);
    if (!response.isSuccess) throw Exception(response.message);
    return response.data!;
  }

  Future<List<dynamic>> getAllBadges() async {
    final response = await _client.get<List<dynamic>>(ApiConstants.badges);
    if (!response.isSuccess) throw Exception(response.message);
    return response.data!;
  }

  Future<List<dynamic>> getMyBadges() async {
    final response = await _client.get<List<dynamic>>(ApiConstants.myBadges);
    if (!response.isSuccess) throw Exception(response.message);
    return response.data!;
  }

  Future<List<dynamic>> getLeaderboard() async {
    final response =
        await _client.get<List<dynamic>>(ApiConstants.leaderboard);
    if (!response.isSuccess) throw Exception(response.message);
    return response.data!;
  }
}
