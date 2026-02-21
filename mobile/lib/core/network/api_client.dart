import 'package:dio/dio.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';
import 'package:edulink_mobile/config/app_config.dart';
import 'package:edulink_mobile/config/api_constants.dart';
import 'package:edulink_mobile/core/security/secure_storage.dart';
import 'package:edulink_mobile/core/network/api_response.dart';

class ApiClient {
  late final Dio _dio;
  final SecureStorageService secureStorage;

  ApiClient({required this.secureStorage}) {
    _dio = Dio(BaseOptions(
      baseUrl: AppConfig.baseUrl,
      connectTimeout: const Duration(milliseconds: AppConfig.connectTimeout),
      receiveTimeout: const Duration(milliseconds: AppConfig.receiveTimeout),
      sendTimeout: const Duration(milliseconds: AppConfig.sendTimeout),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    _dio.interceptors.addAll([
      _AuthInterceptor(secureStorage: secureStorage, dio: _dio),
      PrettyDioLogger(
        requestHeader: true,
        requestBody: true,
        responseBody: true,
        compact: true,
      ),
    ]);
  }

  Dio get dio => _dio;

  Future<ApiResponse<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.get(path, queryParameters: queryParameters);
      return ApiResponse.success(
        data: fromJson != null ? fromJson(response.data) : response.data as T,
        statusCode: response.statusCode,
      );
    } on DioException catch (e) {
      return ApiResponse.error(
        message: _extractErrorMessage(e),
        statusCode: e.response?.statusCode,
      );
    }
  }

  Future<ApiResponse<T>> post<T>(
    String path, {
    dynamic data,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.post(path, data: data);
      return ApiResponse.success(
        data: fromJson != null ? fromJson(response.data) : response.data as T,
        statusCode: response.statusCode,
      );
    } on DioException catch (e) {
      return ApiResponse.error(
        message: _extractErrorMessage(e),
        statusCode: e.response?.statusCode,
      );
    }
  }

  Future<ApiResponse<T>> put<T>(
    String path, {
    dynamic data,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.put(path, data: data);
      return ApiResponse.success(
        data: fromJson != null ? fromJson(response.data) : response.data as T,
        statusCode: response.statusCode,
      );
    } on DioException catch (e) {
      return ApiResponse.error(
        message: _extractErrorMessage(e),
        statusCode: e.response?.statusCode,
      );
    }
  }

  Future<ApiResponse<T>> patch<T>(
    String path, {
    dynamic data,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.patch(path, data: data);
      return ApiResponse.success(
        data: fromJson != null ? fromJson(response.data) : response.data as T,
        statusCode: response.statusCode,
      );
    } on DioException catch (e) {
      return ApiResponse.error(
        message: _extractErrorMessage(e),
        statusCode: e.response?.statusCode,
      );
    }
  }

  Future<ApiResponse<T>> delete<T>(
    String path, {
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.delete(path);
      return ApiResponse.success(
        data: fromJson != null ? fromJson(response.data) : response.data as T,
        statusCode: response.statusCode,
      );
    } on DioException catch (e) {
      return ApiResponse.error(
        message: _extractErrorMessage(e),
        statusCode: e.response?.statusCode,
      );
    }
  }

  String _extractErrorMessage(DioException e) {
    if (e.response?.data is Map) {
      final data = e.response!.data as Map;
      return data['detail']?.toString() ?? e.message ?? 'Unknown error';
    }
    return e.message ?? 'Network error occurred';
  }
}

class _AuthInterceptor extends Interceptor {
  final SecureStorageService secureStorage;
  final Dio dio;
  bool _isRefreshing = false;

  _AuthInterceptor({required this.secureStorage, required this.dio});

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await secureStorage.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401 && !_isRefreshing) {
      _isRefreshing = true;
      try {
        final refreshToken = await secureStorage.getRefreshToken();
        if (refreshToken == null) {
          _isRefreshing = false;
          return handler.next(err);
        }

        final response = await Dio(BaseOptions(
          baseUrl: AppConfig.baseUrl,
        )).post(
          ApiConstants.refresh,
          data: {'refresh_token': refreshToken},
        );

        final newAccess = response.data['access_token'] as String;
        final newRefresh = response.data['refresh_token'] as String;
        await secureStorage.saveTokens(
          accessToken: newAccess,
          refreshToken: newRefresh,
        );

        _isRefreshing = false;

        // Retry the original request
        final opts = err.requestOptions;
        opts.headers['Authorization'] = 'Bearer $newAccess';
        final retryResponse = await dio.fetch(opts);
        return handler.resolve(retryResponse);
      } catch (_) {
        _isRefreshing = false;
        await secureStorage.clearAll();
      }
    }
    handler.next(err);
  }
}
