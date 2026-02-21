class GithubProfileEntity {
  final String username;
  final String? avatarUrl;
  final int publicRepos;
  final int totalContributions;
  final int stars;
  final bool connected;

  const GithubProfileEntity({
    required this.username,
    this.avatarUrl,
    required this.publicRepos,
    required this.totalContributions,
    required this.stars,
    required this.connected,
  });
}

class GithubContribution {
  final String repoName;
  final String type;
  final String title;
  final String? url;
  final DateTime date;

  const GithubContribution({
    required this.repoName,
    required this.type,
    required this.title,
    this.url,
    required this.date,
  });
}
