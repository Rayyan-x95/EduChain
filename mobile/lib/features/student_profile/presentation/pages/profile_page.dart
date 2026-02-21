import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:edulink_mobile/config/routes/route_names.dart';
import 'package:edulink_mobile/config/theme/app_colors.dart';
import 'package:edulink_mobile/core/di/injection.dart';
import 'package:edulink_mobile/core/widgets/empty_state.dart';
import 'package:edulink_mobile/core/widgets/loading_widget.dart';
import 'package:edulink_mobile/core/widgets/status_badge.dart';
import 'package:edulink_mobile/features/student_profile/presentation/bloc/profile_bloc.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<ProfileBloc>()..add(ProfileLoadRequested()),
      child: Scaffold(
        appBar: AppBar(
          title: const Text('My Profile'),
          actions: [
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: () => context.push(RouteNames.editProfile),
            ),
            IconButton(
              icon: const Icon(Icons.settings),
              onPressed: () => context.push(RouteNames.settings),
            ),
          ],
        ),
        body: BlocBuilder<ProfileBloc, ProfileState>(
          builder: (context, state) {
            if (state is ProfileLoading) {
              return const Center(child: CircularProgressIndicator());
            }
            if (state is ProfileError) {
              return ErrorDisplay(
                message: state.message,
                onRetry: () => context
                    .read<ProfileBloc>()
                    .add(ProfileLoadRequested()),
              );
            }
            if (state is ProfileLoaded) {
              final p = state.profile;
              return SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    // Avatar
                    CircleAvatar(
                      radius: 50,
                      backgroundColor: AppColors.primary,
                      backgroundImage: p.avatarUrl != null
                          ? NetworkImage(p.avatarUrl!)
                          : null,
                      child: p.avatarUrl == null
                          ? Text(
                              p.fullName.isNotEmpty
                                  ? p.fullName[0].toUpperCase()
                                  : '?',
                              style: const TextStyle(
                                fontSize: 36,
                                color: Colors.white,
                              ),
                            )
                          : null,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      p.fullName,
                      style: Theme.of(context).textTheme.headlineMedium,
                    ),
                    const SizedBox(height: 4),
                    if (p.enrollmentNumber != null)
                      Text(
                        p.enrollmentNumber!,
                        style: Theme.of(context)
                            .textTheme
                            .bodyMedium
                            ?.copyWith(color: AppColors.textSecondary),
                      ),
                    const SizedBox(height: 8),
                    StatusBadge(status: p.status),
                    const SizedBox(height: 24),

                    // Stats Row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _StatItem(
                          label: 'Reputation',
                          value: p.reputationScore?.toStringAsFixed(1) ?? '–',
                          icon: Icons.star,
                        ),
                        _StatItem(
                          label: 'Credentials',
                          value: p.credentialCount.toString(),
                          icon: Icons.workspace_premium,
                        ),
                        _StatItem(
                          label: 'Endorsements',
                          value: p.endorsementCount.toString(),
                          icon: Icons.thumb_up,
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    const Divider(),
                    const SizedBox(height: 16),

                    // Info Cards
                    _InfoTile(
                      icon: Icons.business,
                      label: 'Institution',
                      value: p.institutionName ?? 'Unknown',
                    ),
                    _InfoTile(
                      icon: Icons.email_outlined,
                      label: 'Email',
                      value: p.email,
                    ),
                    if (p.department != null)
                      _InfoTile(
                        icon: Icons.school_outlined,
                        label: 'Department',
                        value: p.department!,
                      ),
                    if (p.program != null)
                      _InfoTile(
                        icon: Icons.book_outlined,
                        label: 'Program',
                        value: p.program!,
                      ),
                    if (p.graduationYear != null)
                      _InfoTile(
                        icon: Icons.calendar_today,
                        label: 'Graduation Year',
                        value: p.graduationYear.toString(),
                      ),
                    if (p.githubUsername != null)
                      _InfoTile(
                        icon: Icons.code,
                        label: 'GitHub',
                        value: '@${p.githubUsername}',
                      ),
                    const SizedBox(height: 24),

                    // Quick Actions
                    _QuickAction(
                      icon: Icons.qr_code,
                      label: 'My QR Code',
                      onTap: () {},
                    ),
                    _QuickAction(
                      icon: Icons.gavel,
                      label: 'Appeals',
                      onTap: () => context.push(RouteNames.appeals),
                    ),
                    _QuickAction(
                      icon: Icons.thumb_up_alt_outlined,
                      label: 'Endorsements',
                      onTap: () => context.push(RouteNames.endorsements),
                    ),
                    _QuickAction(
                      icon: Icons.code,
                      label: 'GitHub Integration',
                      onTap: () => context.push(RouteNames.githubConnect),
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

class _StatItem extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _StatItem({
    required this.label,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: AppColors.primary, size: 28),
        const SizedBox(height: 8),
        Text(
          value,
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w700,
              ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: AppColors.textSecondary,
              ),
        ),
      ],
    );
  }
}

class _InfoTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoTile({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.textSecondary),
          const SizedBox(width: 12),
          Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                ),
          ),
          const Spacer(),
          Flexible(
            child: Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
              textAlign: TextAlign.end,
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _QuickAction({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: AppColors.primary),
        title: Text(label),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
