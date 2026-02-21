import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:edulink_mobile/config/theme/app_colors.dart';
import 'package:edulink_mobile/core/di/injection.dart';
import 'package:edulink_mobile/core/widgets/app_button.dart';
import 'package:edulink_mobile/core/widgets/empty_state.dart';
import 'package:edulink_mobile/features/github/presentation/bloc/github_bloc.dart';

class GithubConnectPage extends StatelessWidget {
  const GithubConnectPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<GithubBloc>(),
      child: Scaffold(
        appBar: AppBar(title: const Text('GitHub Integration')),
        body: BlocConsumer<GithubBloc, GithubState>(
          listener: (context, state) async {
            if (state is GithubConnectUrlReady) {
              final uri = Uri.parse(state.url);
              if (await canLaunchUrl(uri)) {
                await launchUrl(uri, mode: LaunchMode.externalApplication);
              }
            }
            if (state is GithubDisconnected) {
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('GitHub disconnected')),
                );
              }
            }
          },
          builder: (context, state) {
            if (state is GithubLoading) {
              return const Center(child: CircularProgressIndicator());
            }
            if (state is GithubError) {
              return ErrorDisplay(
                message: state.message,
                onRetry: () {},
              );
            }
            if (state is GithubConnected) {
              return _ConnectedView(profile: state.profile);
            }
            if (state is GithubContributionsLoaded) {
              return _ContributionsView(
                  contributions: state.contributions);
            }
            // Initial / Disconnected state
            return _ConnectPrompt();
          },
        ),
      ),
    );
  }
}

class _ConnectPrompt extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFF24292E).withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.code, size: 64, color: Color(0xFF24292E)),
            ),
            const SizedBox(height: 24),
            Text(
              'Connect Your GitHub',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Link your GitHub account to showcase your projects and contributions on your student profile.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 32),
            AppButton(
              label: 'Connect GitHub',
              icon: Icons.link,
              onPressed: () => context
                  .read<GithubBloc>()
                  .add(GithubConnectRequested()),
            ),
          ],
        ),
      ),
    );
  }
}

class _ConnectedView extends StatelessWidget {
  final dynamic profile;
  const _ConnectedView({required this.profile});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundImage: profile.avatarUrl != null
                        ? NetworkImage(profile.avatarUrl!)
                        : null,
                    child: profile.avatarUrl == null
                        ? const Icon(Icons.person, size: 40)
                        : null,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    '@${profile.username}',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _GithubStat('Repos', '${profile.publicRepos}'),
                      _GithubStat('Contributions', '${profile.totalContributions}'),
                      _GithubStat('Stars', '${profile.stars}'),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          AppButton(
            label: 'View Contributions',
            onPressed: () => context
                .read<GithubBloc>()
                .add(GithubContributionsLoadRequested()),
          ),
          const SizedBox(height: 8),
          AppButton(
            label: 'Disconnect',
            outlined: true,
            onPressed: () => context
                .read<GithubBloc>()
                .add(GithubDisconnectRequested()),
          ),
        ],
      ),
    );
  }
}

class _GithubStat extends StatelessWidget {
  final String label;
  final String value;
  const _GithubStat(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value,
            style: const TextStyle(
                fontSize: 20, fontWeight: FontWeight.bold)),
        Text(label, style: Theme.of(context).textTheme.labelSmall),
      ],
    );
  }
}

class _ContributionsView extends StatelessWidget {
  final List<dynamic> contributions;
  const _ContributionsView({required this.contributions});

  @override
  Widget build(BuildContext context) {
    if (contributions.isEmpty) {
      return const EmptyState(
        icon: Icons.code_off,
        title: 'No Contributions',
        description: 'Your GitHub contributions will appear here.',
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: contributions.length,
      itemBuilder: (context, index) {
        final c = contributions[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: Icon(
              c.type == 'commit'
                  ? Icons.commit
                  : c.type == 'pull_request'
                      ? Icons.merge
                      : Icons.bug_report,
              color: AppColors.primary,
            ),
            title: Text(c.title, maxLines: 1, overflow: TextOverflow.ellipsis),
            subtitle: Text(c.repoName),
            trailing: Text(DateFormat.MMMd().format(c.date),
                style: Theme.of(context).textTheme.labelSmall),
          ),
        );
      },
    );
  }
}
