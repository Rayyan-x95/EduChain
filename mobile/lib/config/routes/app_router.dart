import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:edulink_mobile/config/routes/route_names.dart';
import 'package:edulink_mobile/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:edulink_mobile/features/auth/presentation/pages/splash_page.dart';
import 'package:edulink_mobile/features/auth/presentation/pages/login_page.dart';
import 'package:edulink_mobile/features/auth/presentation/pages/register_page.dart';
import 'package:edulink_mobile/features/student_profile/presentation/pages/profile_page.dart';
import 'package:edulink_mobile/features/student_profile/presentation/pages/edit_profile_page.dart';
import 'package:edulink_mobile/features/student_profile/presentation/pages/id_card_page.dart';
import 'package:edulink_mobile/features/credentials/presentation/pages/credentials_page.dart';
import 'package:edulink_mobile/features/credentials/presentation/pages/credential_detail_page.dart';
import 'package:edulink_mobile/features/appeals/presentation/pages/appeals_page.dart';
import 'package:edulink_mobile/features/appeals/presentation/pages/create_appeal_page.dart';
import 'package:edulink_mobile/features/endorsements/presentation/pages/endorsements_page.dart';
import 'package:edulink_mobile/features/community/presentation/pages/community_page.dart';
import 'package:edulink_mobile/features/community/presentation/pages/leaderboard_page.dart';
import 'package:edulink_mobile/features/community/presentation/pages/badges_page.dart';
import 'package:edulink_mobile/features/qr_verification/presentation/pages/qr_scanner_page.dart';
import 'package:edulink_mobile/features/github/presentation/pages/github_connect_page.dart';
import 'package:edulink_mobile/features/settings/presentation/pages/settings_page.dart';
import 'package:edulink_mobile/core/widgets/scaffold_with_nav.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final GoRouter appRouter = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: RouteNames.splash,
  routes: [
    GoRoute(
      path: RouteNames.splash,
      builder: (context, state) => const SplashPage(),
    ),
    GoRoute(
      path: RouteNames.login,
      builder: (context, state) => const LoginPage(),
    ),
    GoRoute(
      path: RouteNames.register,
      builder: (context, state) => const RegisterPage(),
    ),

    // Main shell with bottom nav
    ShellRoute(
      navigatorKey: _shellNavigatorKey,
      builder: (context, state, child) => ScaffoldWithNav(child: child),
      routes: [
        GoRoute(
          path: '/home',
          builder: (context, state) => const IdCardPage(),
          routes: [
            GoRoute(
              path: 'credentials',
              builder: (context, state) => const CredentialsPage(),
            ),
            GoRoute(
              path: 'credentials/:id',
              builder: (context, state) {
                final id = state.pathParameters['id']!;
                return CredentialDetailPage(credentialId: id);
              },
            ),
            GoRoute(
              path: 'community',
              builder: (context, state) => const CommunityPage(),
            ),
          ],
        ),
      ],
    ),

    // Full-screen routes
    GoRoute(
      path: RouteNames.profile,
      builder: (context, state) => const ProfilePage(),
    ),
    GoRoute(
      path: RouteNames.editProfile,
      builder: (context, state) => const EditProfilePage(),
    ),
    GoRoute(
      path: RouteNames.appeals,
      builder: (context, state) => const AppealsPage(),
    ),
    GoRoute(
      path: RouteNames.appealCreate,
      builder: (context, state) => const CreateAppealPage(),
    ),
    GoRoute(
      path: RouteNames.endorsements,
      builder: (context, state) => const EndorsementsPage(),
    ),
    GoRoute(
      path: RouteNames.qrScanner,
      builder: (context, state) => const QrScannerPage(),
    ),
    GoRoute(
      path: RouteNames.githubConnect,
      builder: (context, state) => const GitHubConnectPage(),
    ),
    GoRoute(
      path: RouteNames.settings,
      builder: (context, state) => const SettingsPage(),
    ),
    GoRoute(
      path: RouteNames.leaderboard,
      builder: (context, state) => const LeaderboardPage(),
    ),
    GoRoute(
      path: RouteNames.badges,
      builder: (context, state) => const BadgesPage(),
    ),
  ],
  redirect: (context, state) {
    final authState = context.read<AuthBloc>().state;
    final isLoggedIn = authState is AuthAuthenticated;
    final isAuthRoute = state.matchedLocation == RouteNames.login ||
        state.matchedLocation == RouteNames.register;
    final isSplash = state.matchedLocation == RouteNames.splash;

    if (isSplash) return null;
    if (!isLoggedIn && !isAuthRoute) return RouteNames.login;
    if (isLoggedIn && isAuthRoute) return RouteNames.home;
    return null;
  },
);
