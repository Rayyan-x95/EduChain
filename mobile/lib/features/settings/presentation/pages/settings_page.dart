import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:edulink_mobile/config/theme/app_colors.dart';
import 'package:edulink_mobile/config/routes/route_names.dart';
import 'package:edulink_mobile/core/di/injection.dart';
import 'package:edulink_mobile/core/security/biometric_auth.dart';
import 'package:edulink_mobile/core/security/secure_storage.dart';
import 'package:edulink_mobile/core/widgets/app_button.dart';
import 'package:edulink_mobile/features/auth/presentation/bloc/auth_bloc.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool _biometricEnabled = false;
  bool _darkMode = false;
  bool _notificationsEnabled = true;
  bool _loadingBio = true;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final storage = getIt<SecureStorageService>();
    final bio = await storage.isBiometricEnabled();
    setState(() {
      _biometricEnabled = bio;
      _loadingBio = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ── Security Section
          _SectionHeader(title: 'Security'),
          Card(
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text('Biometric Authentication'),
                  subtitle: const Text('Use fingerprint or face ID to log in'),
                  secondary:
                      const Icon(Icons.fingerprint, color: AppColors.primary),
                  value: _biometricEnabled,
                  onChanged: _loadingBio
                      ? null
                      : (val) async {
                          if (val) {
                            final bio = getIt<BiometricAuth>();
                            final supported = await bio.isAvailable();
                            if (!supported) {
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                        'Biometric auth is not available on this device'),
                                  ),
                                );
                              }
                              return;
                            }
                          }
                          final storage = getIt<SecureStorageService>();
                          await storage.setBiometricEnabled(val);
                          setState(() => _biometricEnabled = val);
                        },
                ),
                const Divider(height: 1),
                ListTile(
                  leading:
                      const Icon(Icons.lock_outline, color: AppColors.primary),
                  title: const Text('Change Password'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    // TODO: Navigate to change password
                  },
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // ── Appearance Section
          _SectionHeader(title: 'Appearance'),
          Card(
            child: SwitchListTile(
              title: const Text('Dark Mode'),
              subtitle: const Text('Switch between light and dark theme'),
              secondary:
                  const Icon(Icons.dark_mode, color: AppColors.primary),
              value: _darkMode,
              onChanged: (val) {
                setState(() => _darkMode = val);
                // TODO: Integrate with ThemeCubit or similar
              },
            ),
          ),

          const SizedBox(height: 20),

          // ── Notifications Section
          _SectionHeader(title: 'Notifications'),
          Card(
            child: SwitchListTile(
              title: const Text('Push Notifications'),
              subtitle: const Text('Receive updates about your credentials'),
              secondary: const Icon(Icons.notifications_outlined,
                  color: AppColors.primary),
              value: _notificationsEnabled,
              onChanged: (val) =>
                  setState(() => _notificationsEnabled = val),
            ),
          ),

          const SizedBox(height: 20),

          // ── Integrations Section
          _SectionHeader(title: 'Integrations'),
          Card(
            child: ListTile(
              leading:
                  const Icon(Icons.code, color: Color(0xFF24292E)),
              title: const Text('GitHub'),
              subtitle: const Text('Manage your GitHub connection'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => context.push(RouteNames.githubConnect),
            ),
          ),

          const SizedBox(height: 20),

          // ── About Section
          _SectionHeader(title: 'About'),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.info_outline,
                      color: AppColors.primary),
                  title: const Text('Version'),
                  trailing: Text(
                    '1.0.0',
                    style: theme.textTheme.bodyMedium
                        ?.copyWith(color: Colors.grey),
                  ),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.description_outlined,
                      color: AppColors.primary),
                  title: const Text('Terms of Service'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {},
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.privacy_tip_outlined,
                      color: AppColors.primary),
                  title: const Text('Privacy Policy'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {},
                ),
              ],
            ),
          ),

          const SizedBox(height: 32),

          // ── Logout
          AppButton(
            label: 'Log Out',
            icon: Icons.logout,
            outlined: true,
            onPressed: () {
              showDialog(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: const Text('Log Out'),
                  content:
                      const Text('Are you sure you want to log out?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(ctx),
                      child: const Text('Cancel'),
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        context
                            .read<AuthBloc>()
                            .add(LogoutRequested());
                        context.go(RouteNames.login);
                      },
                      child: const Text('Log Out',
                          style: TextStyle(color: Colors.red)),
                    ),
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, left: 4),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleSmall?.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w600,
            ),
      ),
    );
  }
}
