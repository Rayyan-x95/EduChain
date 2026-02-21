import 'package:flutter/material.dart';
import 'package:edulink_mobile/config/theme/app_colors.dart';
import 'package:edulink_mobile/core/di/injection.dart';
import 'package:edulink_mobile/core/network/api_client.dart';
import 'package:edulink_mobile/config/api_constants.dart';
import 'package:edulink_mobile/core/widgets/status_badge.dart';
import 'package:edulink_mobile/core/widgets/app_button.dart';
import 'package:edulink_mobile/features/credentials/data/models/credential_model.dart';
import 'package:intl/intl.dart';

class CredentialDetailPage extends StatefulWidget {
  final String credentialId;
  const CredentialDetailPage({super.key, required this.credentialId});

  @override
  State<CredentialDetailPage> createState() => _CredentialDetailPageState();
}

class _CredentialDetailPageState extends State<CredentialDetailPage> {
  CredentialModel? _credential;
  Map<String, dynamic>? _verification;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final client = getIt<ApiClient>();
    final response = await client.get<Map<String, dynamic>>(
      ApiConstants.credentialById(widget.credentialId),
    );
    if (response.isSuccess && response.data != null) {
      setState(() {
        _credential = CredentialModel.fromJson(response.data!);
        _loading = false;
      });
    } else {
      setState(() {
        _error = response.message ?? 'Failed to load credential';
        _loading = false;
      });
    }
  }

  Future<void> _verify() async {
    final client = getIt<ApiClient>();
    final response = await client.get<Map<String, dynamic>>(
      ApiConstants.credentialVerify(widget.credentialId),
    );
    if (response.isSuccess) {
      setState(() => _verification = response.data);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(response.message ?? 'Verification failed')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Credential Details'),
        backgroundColor: AppColors.background,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : _credential == null
                  ? const Center(child: Text('Not found'))
                  : SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Title & Status
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.border, width: 1),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _credential!.title,
                                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                        fontWeight: FontWeight.w600,
                                      ),
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    StatusBadge(status: _credential!.status),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: AppColors.surfaceVariant,
                                        borderRadius: BorderRadius.circular(6),
                                        border: Border.all(color: AppColors.border, width: 1),
                                      ),
                                      child: Text(
                                        _credential!.category.toUpperCase(),
                                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                              color: AppColors.textSecondary,
                                              letterSpacing: 0.5,
                                            ),
                                      ),
                                    ),
                                    const Spacer(),
                                    Text('v\',
                                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                              color: AppColors.textTertiary,
                                            )),
                                  ],
                                ),
                                if (_credential!.description != null) ...[
                                  const SizedBox(height: 16),
                                  const Divider(height: 1),
                                  const SizedBox(height: 16),
                                  Text(
                                    _credential!.description!,
                                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                          color: AppColors.textSecondary,
                                          height: 1.5,
                                        ),
                                  ),
                                ],
                              ],
                            ),
                          ),

                          const SizedBox(height: 24),

                          // Details
                          Padding(
                            padding: const EdgeInsets.only(left: 16, bottom: 8),
                            child: Text(
                              'DETAILS',
                              style: Theme.of(context).textTheme.labelMedium?.copyWith(
                                    color: AppColors.textSecondary,
                                    fontWeight: FontWeight.w600,
                                    letterSpacing: 0.5,
                                  ),
                            ),
                          ),
                          Container(
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.border, width: 1),
                            ),
                            child: Column(
                              children: [
                                _DetailRow(
                                  label: 'Issued',
                                  value: DateFormat.yMMMd()
                                      .format(DateTime.parse(_credential!.createdAt)),
                                ),
                                const Divider(height: 1),
                                if (_credential!.issuedBy != null) ...[
                                  _DetailRow(
                                    label: 'Issued By',
                                    value: _credential!.issuedBy!,
                                  ),
                                  const Divider(height: 1),
                                ],
                                _DetailRow(
                                  label: 'Visibility',
                                  value: _credential!.isPublic ? 'Public' : 'Private',
                                ),
                              ],
                            ),
                          ),

                          if (_credential!.payloadHash != null) ...[
                            const SizedBox(height: 24),
                            Padding(
                              padding: const EdgeInsets.only(left: 16, bottom: 8),
                              child: Text(
                                'PAYLOAD HASH',
                                style: Theme.of(context).textTheme.labelMedium?.copyWith(
                                      color: AppColors.textSecondary,
                                      fontWeight: FontWeight.w600,
                                      letterSpacing: 0.5,
                                    ),
                              ),
                            ),
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: AppColors.surface,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.border, width: 1),
                              ),
                              child: Text(
                                _credential!.payloadHash!,
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(
                                      fontFamily: 'monospace',
                                      color: AppColors.textSecondary,
                                    ),
                              ),
                            ),
                          ],

                          const SizedBox(height: 32),

                          // Verify button
                          AppButton(
                            text: 'Verify Cryptographic Signature',
                            icon: Icons.verified_user_outlined,
                            onPressed: _verify,
                          ),

                          if (_verification != null) ...[
                            const SizedBox(height: 16),
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: (_verification!['valid'] == true)
                                    ? AppColors.success.withOpacity(0.1)
                                    : AppColors.error.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: (_verification!['valid'] == true)
                                      ? AppColors.success.withOpacity(0.3)
                                      : AppColors.error.withOpacity(0.3),
                                  width: 1,
                                ),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    (_verification!['valid'] == true)
                                        ? Icons.check_circle_outline
                                        : Icons.error_outline,
                                    color: (_verification!['valid'] == true)
                                        ? AppColors.success
                                        : AppColors.error,
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      (_verification!['valid'] == true)
                                          ? 'Signature verified successfully'
                                          : 'Signature verification failed',
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyMedium
                                          ?.copyWith(
                                            color: (_verification!['valid'] == true)
                                                ? AppColors.success
                                                : AppColors.error,
                                            fontWeight: FontWeight.w500,
                                          ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                          const SizedBox(height: 32),
                        ],
                      ),
                    ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;

  const _DetailRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(color: AppColors.textSecondary)),
          Text(value,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

