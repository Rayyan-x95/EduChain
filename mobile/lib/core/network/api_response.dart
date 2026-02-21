class ApiResponse<T> {
  final T? data;
  final String? message;
  final int? statusCode;
  final bool isSuccess;

  const ApiResponse._({
    this.data,
    this.message,
    this.statusCode,
    required this.isSuccess,
  });

  factory ApiResponse.success({T? data, int? statusCode}) {
    return ApiResponse._(data: data, statusCode: statusCode, isSuccess: true);
  }

  factory ApiResponse.error({String? message, int? statusCode}) {
    return ApiResponse._(
      message: message,
      statusCode: statusCode,
      isSuccess: false,
    );
  }

  R fold<R>({
    required R Function(T data) onSuccess,
    required R Function(String message) onError,
  }) {
    if (isSuccess && data != null) {
      return onSuccess(data as T);
    }
    return onError(message ?? 'Unknown error');
  }
}
