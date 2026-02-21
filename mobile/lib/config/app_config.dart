class AppConfig {
  static const String appName = 'EduLink';
  static const String baseUrl = 'http://10.0.2.2:8000/api/v1';
  static const String apiVersion = 'v1';

  // Timeouts
  static const int connectTimeout = 30000;
  static const int receiveTimeout = 30000;
  static const int sendTimeout = 30000;

  // QR
  static const int qrTokenExpiryMinutes = 5;
  static const int qrRefreshIntervalSeconds = 240;

  // Pagination
  static const int defaultPageSize = 20;

  // Cache
  static const int cacheMaxAge = 300; // 5 minutes

  // GitHub
  static const String githubClientId = '';
}
