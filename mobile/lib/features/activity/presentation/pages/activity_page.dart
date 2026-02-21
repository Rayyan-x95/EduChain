import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:edulink_mobile/config/theme/app_colors.dart';
import 'package:edulink_mobile/core/di/injection.dart';
import 'package:edulink_mobile/core/widgets/empty_state.dart';
import 'package:edulink_mobile/core/widgets/status_badge.dart';
import 'package:edulink_mobile/core/widgets/error_display.dart';
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
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: const Text('Activity'),
          backgroundColor: AppColors.background,
        ),
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
                  icon: Icons.history,
                  title: 'No Activity',
                  description:
                      'Your credential history will appear here.',
                );
              }
              return RefreshIndicator(
                onRefresh: () async {
                  final bloc = context.read<CredentialsBloc>();
                  final future = bloc.stream.firstWhere((state) =>
                      state is CredentialsLoaded || state is CredentialsError);
                  bloc.add(CredentialsLoadRequested());
                  await future;
                },
                child: ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: state.credentials.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    return _CredentialItem(
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

class _CredentialItem extends StatelessWidget {
  final CredentialEntity credential;

  const _CredentialItem({required this.credential});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border, width: 1),
      ),
      child: InkWell(
        onTap: () => context.push('/home/activity/${credential.id}'),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      credential.title,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      credential.category.toUpperCase(),
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            color: AppColors.textSecondary,
                            letterSpacing: 0.5,
                          ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(
                          Icons.calendar_today_outlined,
                          size: 14,
                          color: AppColors.textTertiary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          DateFormat.yMMMd().format(credential.createdAt),
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: AppColors.textTertiary,
                              ),
                        ),
                        const SizedBox(width: 12),
                        Icon(
                          credential.isPublic
                              ? Icons.visibility_outlined
                              : Icons.visibility_off_outlined,
                          size: 14,
                          color: AppColors.textTertiary,
                          semanticLabel: credential.isPublic
                              ? 'Public credential'
                              : 'Private credential',
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              StatusBadge(status: credential.status),
            ],
          ),
        ),
      ),
    );
  }
}

