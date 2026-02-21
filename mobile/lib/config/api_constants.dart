class ApiConstants {
  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String refresh = '/auth/refresh';

  // Students
  static const String studentProfile = '/students/me';
  static const String studentIdCard = '/students/me/id-card';
  static const String studentPrivacy = '/students/me/privacy';
  static const String updateProfile = '/students/me';

  // Credentials
  static const String credentials = '/credentials';
  static String credentialById(String id) => '/credentials/$id';
  static String credentialVerify(String id) => '/credentials/$id/verify';
  static String credentialVisibility(String id) => '/credentials/$id/visibility';

  // Appeals
  static const String appeals = '/appeals';
  static String appealById(String id) => '/appeals/$id';

  // Endorsements
  static const String endorsementsReceived = '/endorsements/received';
  static const String endorsementsGiven = '/endorsements/given';
  static String endorseUser(String userId) => '/endorsements/$userId';

  // Verification
  static const String qrGenerate = '/verification/qr/generate';
  static const String qrValidate = '/verification/qr/validate';

  // Community
  static const String badges = '/community/badges';
  static const String myBadges = '/community/badges/me';
  static const String leaderboard = '/community/leaderboard';
  static const String reputation = '/community/reputation/me';

  // GitHub
  static const String githubConnect = '/github/connect';
  static const String githubCallback = '/github/callback';
  static const String githubContributions = '/github/contributions';
  static const String githubDisconnect = '/github/disconnect';

  // Institutions
  static const String institutions = '/institutions';
}
