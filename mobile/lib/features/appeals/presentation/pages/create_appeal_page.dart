import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:edulink_mobile/config/theme/app_colors.dart';
import 'package:edulink_mobile/core/di/injection.dart';
import 'package:edulink_mobile/core/widgets/app_button.dart';
import 'package:edulink_mobile/core/widgets/app_text_field.dart';
import 'package:edulink_mobile/features/appeals/presentation/bloc/appeals_bloc.dart';

class CreateAppealPage extends StatefulWidget {
  const CreateAppealPage({super.key});

  @override
  State<CreateAppealPage> createState() => _CreateAppealPageState();
}

class _CreateAppealPageState extends State<CreateAppealPage> {
  final _formKey = GlobalKey<FormState>();
  final _reasonController = TextEditingController();

  @override
  void dispose() {
    _reasonController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<AppealsBloc>(),
      child: Scaffold(
        appBar: AppBar(title: const Text('Submit Appeal')),
        body: BlocConsumer<AppealsBloc, AppealsState>(
          listener: (context, state) {
            if (state is AppealCreated) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Appeal submitted successfully'),
                  backgroundColor: AppColors.success,
                ),
              );
              context.pop();
            }
            if (state is AppealsError) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(state.message),
                  backgroundColor: AppColors.error,
                ),
              );
            }
          },
          builder: (context, state) {
            return SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            const Icon(Icons.info_outline,
                                color: AppColors.info),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                'You have 24 hours from the status change to submit an appeal. Only one appeal is allowed per rejection.',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    AppTextField(
                      label: 'Reason for Appeal',
                      hint: 'Explain why you believe the decision should be reconsidered...',
                      controller: _reasonController,
                      maxLines: 6,
                      validator: (v) {
                        if (v?.isEmpty ?? true) return 'Reason is required';
                        if (v!.length < 20) return 'Please provide more detail';
                        return null;
                      },
                    ),
                    const SizedBox(height: 32),
                    AppButton(
                      text: 'Submit Appeal',
                      isLoading: state is AppealCreating,
                      onPressed: () {
                        if (_formKey.currentState!.validate()) {
                          context.read<AppealsBloc>().add(
                                AppealCreateRequested(
                                    _reasonController.text.trim()),
                              );
                        }
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
