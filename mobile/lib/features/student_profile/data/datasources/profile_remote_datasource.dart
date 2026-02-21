import 'package:edulink_mobile/core/network/api_client.dart';
import 'package:edulink_mobile/config/api_constants.dart';
import 'package:edulink_mobile/features/student_profile/data/models/profile_model.dart';

class ProfileRemoteDataSource {
  final ApiClient _client;

  ProfileRemoteDataSource(this._client);

  Future<ProfileModel> getProfile() async {
    final response = await _client.get<Map<String, dynamic>>(
      ApiConstants.studentProfile,
    );
    if (!response.isSuccess) throw Exception(response.message);
    return ProfileModel.fromJson(response.data!);
  }

  Future<Map<String, dynamic>> getIdCard() async {
    final response = await _client.get<Map<String, dynamic>>(
      ApiConstants.studentIdCard,
    );
    if (!response.isSuccess) throw Exception(response.message);
    return response.data!;
  }
}
