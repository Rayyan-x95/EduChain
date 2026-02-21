import 'package:edulink_mobile/core/network/api_client.dart';
import 'package:edulink_mobile/config/api_constants.dart';
import 'package:edulink_mobile/features/appeals/data/models/appeal_model.dart';

class AppealsRemoteDataSource {
  final ApiClient _client;
  AppealsRemoteDataSource(this._client);

  Future<List<AppealModel>> getAppeals() async {
    final response = await _client.get<List<dynamic>>(ApiConstants.appeals);
    if (!response.isSuccess) throw Exception(response.message);
    return (response.data!)
        .map((e) => AppealModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<AppealModel> createAppeal(String reason) async {
    final response = await _client.post<Map<String, dynamic>>(
      ApiConstants.appeals,
      data: {'reason': reason},
    );
    if (!response.isSuccess) throw Exception(response.message);
    return AppealModel.fromJson(response.data!);
  }
}
