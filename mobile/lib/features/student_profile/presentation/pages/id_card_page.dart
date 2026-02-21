import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:go_router/go_router.dart';
import 'package:edulink_mobile/config/theme/app_colors.dart';
import 'package:edulink_mobile/config/routes/route_names.dart';
import 'package:edulink_mobile/core/di/injection.dart';
import 'package:edulink_mobile/core/widgets/status_badge.dart';
import 'package:edulink_mobile/core/widgets/empty_state.dart';
import 'package:edulink_mobile/features/student_profile/presentation/bloc/profile_bloc.dart';
import 'package:edulink_mobile/features/qr_verification/presentation/bloc/qr_bloc.dart';

class IdCardPage extends StatelessWidget {
  const IdCardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => getIt<ProfileBloc>()..add(ProfileLoadRequested())),
        BlocProvider(create: (_) => getIt<QrBloc>()..add(QrGenerateRequested())),
      ],
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Student ID Card'),
          actions: [
            IconButton(
              icon: const Icon(Icons.person),
              onPressed: () => context.push(RouteNames.profile),
            ),
            IconButton(
              icon: const Icon(Icons.qr_code_scanner),
              onPressed: () => context.push(RouteNames.qrScanner),
            ),
          ],
        ),
        body: BlocBuilder<ProfileBloc, ProfileState>(
          builder: (context, profileState) {
            if (profileState is ProfileLoading) {
              return const Center(child: CircularProgressIndicator());
            }
            if (profileState is ProfileError) {
              return ErrorDisplay(
                message: profileState.message,
                onRetry: () =>
                    context.read<ProfileBloc>().add(ProfileLoadRequested()),
              );
            }
            if (profileState is ProfileLoaded) {
              final p = profileState.profile;
              return SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    // ID Card
                    Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppColors.primary, AppColors.primaryDark],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withOpacity(0.3),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          children: [
                            // Header
                            Row(
                              children: [
                                const Icon(Icons.school, color: Colors.white, size: 28),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    p.institutionName ?? 'Institution',
                                    style: Theme.of(context)
                                        .textTheme
                                        .titleMedium
                                        ?.copyWith(color: Colors.white),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 24),

                            // Avatar + Name
                            CircleAvatar(
                              radius: 40,
                              backgroundColor: Colors.white24,
                              backgroundImage: p.avatarUrl != null
                                  ? NetworkImage(p.avatarUrl!)
                                  : null,
                              child: p.avatarUrl == null
                                  ? Text(
                                      p.fullName.isNotEmpty
                                          ? p.fullName[0].toUpperCase()
                                          : '?',
                                      style: const TextStyle(
                                        fontSize: 32,
                                        color: Colors.white,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    )
                                  : null,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              p.fullName,
                              style: Theme.of(context)
                                  .textTheme
                                  .headlineMedium
                                  ?.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w700,
                                  ),
                            ),
                            const SizedBox(height: 4),
                            if (p.enrollmentNumber != null)
                              Text(
                                p.enrollmentNumber!,
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyLarge
                                    ?.copyWith(color: Colors.white70),
                              ),
                            const SizedBox(height: 12),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.white24,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: StatusBadge(status: p.status),
                            ),
                            const SizedBox(height: 16),

                            // Info row
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceAround,
                              children: [
                                if (p.department != null)
                                  _CardInfo(
                                    label: 'DEPT',
                                    value: p.department!,
                                  ),
                                if (p.program != null)
                                  _CardInfo(
                                    label: 'PROGRAM',
                                    value: p.program!,
                                  ),
                                if (p.graduationYear != null)
                                  _CardInfo(
                                    label: 'YEAR',
                                    value: p.graduationYear.toString(),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // QR Code Section
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          children: [
                            Text(
                              'Verification QR Code',
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Show this to verify your identity',
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(color: AppColors.textSecondary),
                            ),
                            const SizedBox(height: 16),
                            BlocBuilder<QrBloc, QrState>(
                              builder: (context, qrState) {
                                if (qrState is QrGenerated) {
                                  return QrImageView(
                                    data: qrState.token,
                                    version: QrVersions.auto,
                                    size: 200,
                                    backgroundColor: Colors.white,
                                  );
                                }
                                if (qrState is QrLoading) {
                                  return const SizedBox(
                                    width: 200,
                                    height: 200,
                                    child: Center(
                                        child: CircularProgressIndicator()),
                                  );
                                }
                                if (qrState is QrError) {
                                  return Column(
                                    children: [
                                      const Icon(Icons.error,
                                          color: AppColors.error, size: 48),
                                      const SizedBox(height: 8),
                                      Text(qrState.message),
                                      TextButton(
                                        onPressed: () => context
                                            .read<QrBloc>()
                                            .add(QrGenerateRequested()),
                                        child: const Text('Retry'),
                                      ),
                                    ],
                                  );
                                }
                                return const SizedBox(
                                  width: 200,
                                  height: 200,
                                );
                              },
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'Auto-refreshes every 4 minutes',
                              style: Theme.of(context)
                                  .textTheme
                                  .labelSmall
                                  ?.copyWith(color: AppColors.textTertiary),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Reputation
                    Card(
                      child: ListTile(
                        leading: const Icon(Icons.star, color: AppColors.warning),
                        title: const Text('Reputation Score'),
                        trailing: Text(
                          p.reputationScore?.toStringAsFixed(1) ?? '–',
                          style: Theme.of(context)
                              .textTheme
                              .headlineSmall
                              ?.copyWith(
                                fontWeight: FontWeight.w700,
                                color: AppColors.primary,
                              ),
                        ),
                        onTap: () => context.push(RouteNames.leaderboard),
                      ),
                    ),
                  ],
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

class _CardInfo extends StatelessWidget {
  final String label;
  final String value;

  const _CardInfo({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          label,
          style: Theme.of(context)
              .textTheme
              .labelSmall
              ?.copyWith(color: Colors.white60),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: Theme.of(context)
              .textTheme
              .bodyMedium
              ?.copyWith(color: Colors.white, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}
