import 'package:flutter/material.dart';
import 'package:edulink_mobile/config/theme/app_colors.dart';
import 'package:edulink_mobile/core/di/injection.dart';
import 'package:edulink_mobile/core/network/api_client.dart';
import 'package:edulink_mobile/config/api_constants.dart';
import 'package:edulink_mobile/core/widgets/status_badge.dart';
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
      appBar: AppBar(title: const Text('Credential Details')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : _credential == null
                  ? const Center(child: Text('Not found'))
                  : SingleChildScrollView(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Title & Status
                          Text(
                            _credential!.title,
                            style: Theme.of(context).textTheme.headlineMedium,
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              StatusBadge(status: _credential!.status),
                              const SizedBox(width: 8),
                              Chip(
                                label: Text(_credential!.category),
                                visualDensity: VisualDensity.compact,
                              ),
                              const Spacer(),
                              Text('v${_credential!.version}',
                                  style: Theme.of(context).textTheme.labelSmall),
                            ],
                          ),
                          const SizedBox(height: 16),

                          if (_credential!.description != null) ...[
                            Text(
                              _credential!.description!,
                              style: Theme.of(context).textTheme.bodyLarge,
                            ),
                            const SizedBox(height: 16),
                          ],

                          const Divider(),
                          const SizedBox(height: 16),

                          // Details
                          _DetailRow(
                            label: 'Issued',
                            value: DateFormat.yMMMd()
                                .format(DateTime.parse(_credential!.createdAt)),
                          ),
                          if (_credential!.issuedBy != null)
                            _DetailRow(
                              label: 'Issued By',
                              value: _credential!.issuedBy!,
                            ),
                          _DetailRow(
                            label: 'Visibility',
                            value: _credential!.isPublic ? 'Public' : 'Private',
                          ),
                          if (_credential!.payloadHash != null) ...[
                            const SizedBox(height: 8),
                            Text('Payload Hash',
                                style: Theme.of(context).textTheme.titleSmall),
                            const SizedBox(height: 4),
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.surfaceVariant,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                _credential!.payloadHash!,
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(fontFamily: 'monospace'),
                              ),
                            ),
                          ],

                          const SizedBox(height: 24),

                          // Verify button
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: _verify,
                              icon: const Icon(Icons.verified_user),
                              label: const Text('Verify Cryptographic Signature'),
                            ),
                          ),

                          if (_verification != null) ...[
                            const SizedBox(height: 16),
                            Card(
                              color: (_verification!['valid'] == true)
                                  ? AppColors.success.withOpacity(0.1)
                                  : AppColors.error.withOpacity(0.1),
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Row(
                                  children: [
                                    Icon(
                                      (_verification!['valid'] == true)
                                          ? Icons.check_circle
                                          : Icons.cancel,
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
                                            .titleMedium,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
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
      padding: const EdgeInsets.only(bottom: 8),
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
