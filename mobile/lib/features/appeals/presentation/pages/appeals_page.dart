import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:edulink_mobile/config/routes/route_names.dart';
import 'package:edulink_mobile/config/theme/app_colors.dart';
import 'package:edulink_mobile/core/di/injection.dart';
import 'package:edulink_mobile/core/widgets/empty_state.dart';
import 'package:edulink_mobile/core/widgets/status_badge.dart';
import 'package:edulink_mobile/features/appeals/presentation/bloc/appeals_bloc.dart';

class AppealsPage extends StatelessWidget {
  const AppealsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<AppealsBloc>()..add(AppealsLoadRequested()),
      child: Scaffold(
        appBar: AppBar(title: const Text('My Appeals')),
        floatingActionButton: FloatingActionButton.extended(
          onPressed: () => context.push(RouteNames.appealCreate),
          icon: const Icon(Icons.add),
          label: const Text('New Appeal'),
        ),
        body: BlocBuilder<AppealsBloc, AppealsState>(
          builder: (context, state) {
            if (state is AppealsLoading) {
              return const Center(child: CircularProgressIndicator());
            }
            if (state is AppealsError) {
              return ErrorDisplay(
                message: state.message,
                onRetry: () =>
                    context.read<AppealsBloc>().add(AppealsLoadRequested()),
              );
            }
            if (state is AppealsLoaded) {
              if (state.appeals.isEmpty) {
                return const EmptyState(
                  icon: Icons.gavel,
                  title: 'No Appeals',
                  description: 'You have not submitted any appeals yet.',
                );
              }
              return ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: state.appeals.length,
                itemBuilder: (context, index) {
                  final appeal = state.appeals[index];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              StatusBadge(status: appeal.status),
                              const Spacer(),
                              Text(
                                DateFormat.yMMMd().format(appeal.createdAt),
                                style: Theme.of(context).textTheme.labelSmall,
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            appeal.reason,
                            style: Theme.of(context).textTheme.bodyMedium,
                            maxLines: 3,
                            overflow: TextOverflow.ellipsis,
                          ),
                          if (appeal.reviewNotes != null) ...[
                            const SizedBox(height: 12),
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.surfaceVariant,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Review Notes',
                                    style: Theme.of(context).textTheme.labelSmall,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    appeal.reviewNotes!,
                                    style: Theme.of(context).textTheme.bodySmall,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  );
                },
              );
            }
            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }
}
