import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:edulink_mobile/config/routes/route_names.dart';
import 'package:edulink_mobile/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:edulink_mobile/features/auth/presentation/pages/splash_page.dart';
import 'package:edulink_mobile/features/auth/presentation/pages/login_page.dart';
import 'package:edulink_mobile/features/student_profile/presentation/pages/id_card_page.dart';
import 'package:edulink_mobile/features/activity/presentation/pages/activity_page.dart';
import 'package:edulink_mobile/features/credentials/presentation/pages/credential_detail_page.dart';
import 'package:edulink_mobile/features/qr_verification/presentation/pages/qr_scanner_page.dart';
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
              path: 'activity',
              builder: (context, state) => const ActivityPage(),
            ),
            GoRoute(
              path: 'activity/:id',
              builder: (context, state) {
                final id = state.pathParameters['id']!;
                return CredentialDetailPage(credentialId: id);
              },
            ),
            GoRoute(
              path: 'settings',
              builder: (context, state) => const SettingsPage(),
            ),
          ],
        ),
      ],
    ),

    // Full-screen routes
    GoRoute(
      path: RouteNames.qrScanner,
      builder: (context, state) => const QrScannerPage(),
    ),
  ],
  redirect: (context, state) {
    final authState = context.read<AuthBloc>().state;
    final isLoggedIn = authState is AuthAuthenticated;
    final isAuthRoute = state.matchedLocation == RouteNames.login;
    final isSplash = state.matchedLocation == RouteNames.splash;

    if (isSplash) return null;
    if (!isLoggedIn && !isAuthRoute) return RouteNames.login;
    if (isLoggedIn && isAuthRoute) return RouteNames.home;
    return null;
  },
);
