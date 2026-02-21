import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:edulink_mobile/config/theme/app_colors.dart';
import 'package:edulink_mobile/core/di/injection.dart';
import 'package:edulink_mobile/core/widgets/app_button.dart';
import 'package:edulink_mobile/core/widgets/app_text_field.dart';
import 'package:edulink_mobile/features/student_profile/presentation/bloc/profile_bloc.dart';

class EditProfilePage extends StatefulWidget {
  const EditProfilePage({super.key});

  @override
  State<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage> {
  final _formKey = GlobalKey<FormState>();
  final _departmentController = TextEditingController();
  final _programController = TextEditingController();
  final _graduationYearController = TextEditingController();
  late ProfileBloc _bloc;

  @override
  void initState() {
    super.initState();
    _bloc = getIt<ProfileBloc>()..add(ProfileLoadRequested());
  }

  @override
  void dispose() {
    _departmentController.dispose();
    _programController.dispose();
    _graduationYearController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: _bloc,
      child: Scaffold(
        appBar: AppBar(title: const Text('Edit Profile')),
        body: BlocConsumer<ProfileBloc, ProfileState>(
          listener: (context, state) {
            if (state is ProfileLoaded) {
              _departmentController.text = state.profile.department ?? '';
              _programController.text = state.profile.program ?? '';
              _graduationYearController.text =
                  state.profile.graduationYear?.toString() ?? '';
            }
            if (state is ProfileError) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(state.message)),
              );
            }
          },
          builder: (context, state) {
            if (state is ProfileLoading) {
              return const Center(child: CircularProgressIndicator());
            }
            return SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    AppTextField(
                      label: 'Department',
                      controller: _departmentController,
                    ),
                    const SizedBox(height: 16),
                    AppTextField(
                      label: 'Program',
                      controller: _programController,
                    ),
                    const SizedBox(height: 16),
                    AppTextField(
                      label: 'Graduation Year',
                      controller: _graduationYearController,
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 32),
                    AppButton(
                      text: 'Save Changes',
                      isLoading: state is ProfileUpdating,
                      onPressed: () {
                        final data = <String, dynamic>{};
                        if (_departmentController.text.isNotEmpty) {
                          data['department'] = _departmentController.text.trim();
                        }
                        if (_programController.text.isNotEmpty) {
                          data['program'] = _programController.text.trim();
                        }
                        if (_graduationYearController.text.isNotEmpty) {
                          data['graduation_year'] =
                              int.tryParse(_graduationYearController.text.trim());
                        }
                        _bloc.add(ProfileUpdateRequested(data));
                      },
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
