import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:edulink_mobile/config/theme/app_theme.dart';
import 'package:edulink_mobile/config/routes/app_router.dart';
import 'package:edulink_mobile/core/di/injection.dart';
import 'package:edulink_mobile/features/auth/presentation/bloc/auth_bloc.dart';

class EduLinkApp extends StatelessWidget {
  const EduLinkApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => getIt<AuthBloc>()),
      ],
      child: MaterialApp.router(
        title: 'EduLink',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system,
        routerConfig: appRouter,
      ),
    );
  }
}
