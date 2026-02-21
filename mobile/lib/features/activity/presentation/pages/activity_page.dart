import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:edulink_mobile/config/theme/app_colors.dart';
import 'package:edulink_mobile/core/di/injection.dart';
import 'package:edulink_mobile/core/widgets/empty_state.dart';
import 'package:edulink_mobile/core/widgets/status_badge.dart';
import 'package:edulink_mobile/features/credentials/presentation/bloc/credentials_bloc.dart';
import 'package:edulink_mobile/features/credentials/domain/entities/credential_entity.dart';
import 'package:intl/intl.dart';

class ActivityPage extends StatelessWidget {
  const ActivityPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<CredentialsBloc>()..add(CredentialsLoadRequested()),
      child: Scaffold(
        appBar: AppBar(title: const Text('Activity')),
        body: BlocBuilder<CredentialsBloc, CredentialsState>(
          builder: (context, state) {
            if (state is CredentialsLoading) {
              return const Center(child: CircularProgressIndicator());
            }
            if (state is CredentialsError) {
              return ErrorDisplay(
                message: state.message,
                onRetry: () => context
                    .read<CredentialsBloc>()
                    .add(CredentialsLoadRequested()),
              );
            }
            if (state is CredentialsLoaded) {
              if (state.credentials.isEmpty) {
                return const EmptyState(
                  icon: Icons.workspace_premium_outlined,
                  title: 'No Credentials Yet',
                  description:
                      'Your verified credentials will appear here once issued by your institution.',
                );
              }
              return RefreshIndicator(
                onRefresh: () async {
                  context
                      .read<CredentialsBloc>()
                      .add(CredentialsLoadRequested());
                },
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: state.credentials.length,
                  itemBuilder: (context, index) {
                    return _CredentialCard(
                      credential: state.credentials[index],
                    );
                  },
                ),
              );
            }
            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }
}

class _CredentialCard extends StatelessWidget {
  final CredentialEntity credential;

  const _CredentialCard({required this.credential});

  IconData get _categoryIcon {
    switch (credential.category.toLowerCase()) {
      case 'academic':
        return Icons.school;
      case 'extracurricular':
        return Icons.sports_soccer;
      case 'skill':
        return Icons.psychology;
      case 'achievement':
        return Icons.emoji_events;
      case 'certification':
        return Icons.verified;
      default:
        return Icons.workspace_premium;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => context.push('/home/activity/${credential.id}'),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(_categoryIcon, color: AppColors.primary),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      credential.title,
                      style: Theme.of(context).textTheme.titleMedium,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      credential.category.toUpperCase(),
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            color: AppColors.textTertiary,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      DateFormat.yMMMd().format(credential.createdAt),
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.textSecondary,
                          ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  StatusBadge(status: credential.status),
                  const SizedBox(height: 6),
                  Icon(
                    credential.isPublic
                        ? Icons.visibility
                        : Icons.visibility_off,
                    size: 16,
                    color: AppColors.textTertiary,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
