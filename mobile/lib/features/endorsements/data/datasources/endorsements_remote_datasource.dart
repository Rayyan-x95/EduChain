import 'package:edulink_mobile/core/network/api_client.dart';
import 'package:edulink_mobile/config/api_constants.dart';
import 'package:edulink_mobile/features/endorsements/data/models/endorsement_model.dart';

class EndorsementsRemoteDataSource {
  final ApiClient _client;
  EndorsementsRemoteDataSource(this._client);

  Future<List<EndorsementModel>> getReceived() async {
    final response =
        await _client.get<List<dynamic>>(ApiConstants.endorsementsReceived);
    if (!response.isSuccess) throw Exception(response.message);
    return (response.data!)
        .map((e) => EndorsementModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<EndorsementModel>> getGiven() async {
    final response =
        await _client.get<List<dynamic>>(ApiConstants.endorsementsGiven);
    if (!response.isSuccess) throw Exception(response.message);
    return (response.data!)
        .map((e) => EndorsementModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<EndorsementModel> give({
    required String userId,
    required String category,
    String? comment,
  }) async {
    final data = {'category': category};
    if (comment != null) data['comment'] = comment;

    final response = await _client.post<Map<String, dynamic>>(
      ApiConstants.endorseUser(userId),
      data: data,
    );
    if (!response.isSuccess) throw Exception(response.message);
    return EndorsementModel.fromJson(response.data!);
  }
}
