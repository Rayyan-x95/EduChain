import 'package:edulink_mobile/core/network/api_client.dart';
import 'package:edulink_mobile/config/api_constants.dart';

class QrRemoteDataSource {
  final ApiClient _client;

  QrRemoteDataSource(this._client);

  Future<String> generateQrToken() async {
    final response = await _client.post<Map<String, dynamic>>(
      ApiConstants.qrGenerate,
    );
    if (!response.isSuccess) throw Exception(response.message);
    return response.data!['token'] as String;
  }

  Future<Map<String, dynamic>> validateQrToken(String token) async {
    final response = await _client.post<Map<String, dynamic>>(
      ApiConstants.qrValidate,
      data: {'token': token},
    );
    if (!response.isSuccess) throw Exception(response.message);
    return response.data!;
  }
}
