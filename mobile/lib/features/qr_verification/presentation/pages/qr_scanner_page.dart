import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:edulink_mobile/config/theme/app_colors.dart';
import 'package:edulink_mobile/core/di/injection.dart';
import 'package:edulink_mobile/core/widgets/status_badge.dart';
import 'package:edulink_mobile/features/qr_verification/presentation/bloc/qr_bloc.dart';

class QrScannerPage extends StatefulWidget {
  const QrScannerPage({super.key});

  @override
  State<QrScannerPage> createState() => _QrScannerPageState();
}

class _QrScannerPageState extends State<QrScannerPage> {
  late QrBloc _qrBloc;
  MobileScannerController? _controller;
  bool _scanned = false;

  @override
  void initState() {
    super.initState();
    _qrBloc = getIt<QrBloc>();
    _controller = MobileScannerController(
      detectionSpeed: DetectionSpeed.normal,
    );
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) {
    if (_scanned) return;
    final barcode = capture.barcodes.firstOrNull;
    if (barcode?.rawValue != null) {
      _scanned = true;
      _controller?.stop();
      _qrBloc.add(QrValidateRequested(barcode!.rawValue!));
    }
  }

  Future<void> _showManualEntryDialog() async {
    final controller = TextEditingController();
    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Enter Short-Code'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            hintText: 'e.g. 123456',
            border: OutlineInputBorder(),
          ),
          keyboardType: TextInputType.text,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              final code = controller.text.trim();
              if (code.isNotEmpty) {
                Navigator.pop(context);
                _scanned = true;
                _controller?.stop();
                _qrBloc.add(QrValidateRequested(code));
              } else {
                final scaffoldMessenger = ScaffoldMessenger.of(context);
                Navigator.pop(context);
                scaffoldMessenger.showSnackBar(
                  const SnackBar(content: Text('Please enter a valid code')),
                );
              }
            },
            child: const Text('Verify'),
          ),
        ],
      ),
    );
    controller.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: _qrBloc,
      child: Scaffold(
        appBar: AppBar(title: const Text('Scan QR Code')),
        body: BlocConsumer<QrBloc, QrState>(
          listener: (context, state) {
            if (state is QrError) {
              _scanned = false;
              _controller?.start();
            }
          },
          builder: (context, state) {
            if (state is QrValidated) {
              return _VerificationResult(result: state.result);
            }
            return Column(
              children: [
                Expanded(
                  flex: 3,
                  child: ClipRRect(
                    borderRadius: const BorderRadius.vertical(
                        bottom: Radius.circular(24)),
                    child: MobileScanner(
                      controller: _controller,
                      onDetect: _onDetect,
                    ),
                  ),
                ),
                Expanded(
                  flex: 1,
                  child: Center(
                    child: state is QrLoading
                        ? const Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              CircularProgressIndicator(),
                              SizedBox(height: 12),
                              Text('Verifying...'),
                            ],
                          )
                        : state is QrError
                            ? Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.error,
                                      color: AppColors.error, size: 40),
                                  const SizedBox(height: 8),
                                  Text(state.message),
                                ],
                              )
                            : Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    Icons.qr_code_scanner,
                                    size: 48,
                                    color: AppColors.textTertiary,
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Point camera at a student QR code',
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyMedium
                                        ?.copyWith(
                                          color: AppColors.textSecondary,
                                        ),
                                  ),
                                  const SizedBox(height: 16),
                                  TextButton.icon(
                                    onPressed: _showManualEntryDialog,
                                    icon: const Icon(Icons.keyboard),
                                    label: const Text('Enter Code Manually'),
                                  ),
                                ],
                              ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _VerificationResult extends StatelessWidget {
  final Map<String, dynamic> result;

  const _VerificationResult({required this.result});

  @override
  Widget build(BuildContext context) {
    final student = result['student'] as Map<String, dynamic>? ?? {};
    final valid = result['valid'] == true;
    final fullName = student['full_name'] as String? ?? '';
    final initial = fullName.isNotEmpty ? fullName[0].toUpperCase() : '?';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Icon(
            valid ? Icons.check_circle : Icons.cancel,
            size: 80,
            color: valid ? AppColors.success : AppColors.error,
          ),
          const SizedBox(height: 16),
          Text(
            valid ? 'Identity Verified' : 'Verification Failed',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          const SizedBox(height: 24),
          if (student.isNotEmpty) ...[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 40,
                      backgroundColor: AppColors.primary,
                      child: Text(
                        initial,
                        style: const TextStyle(
                          fontSize: 32,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      student['full_name'] as String? ?? 'Unknown',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 4),
                    if (student['enrollment_number'] != null)
                      Text(
                        student['enrollment_number'] as String,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: AppColors.textSecondary,
                            ),
                      ),
                    const SizedBox(height: 8),
                    StatusBadge(status: student['status'] as String? ?? 'UNKNOWN'),
                    const SizedBox(height: 16),
                    if (valid)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.success.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.success.withOpacity(0.3)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.verified_user, color: AppColors.success, size: 16),
                            const SizedBox(width: 8),
                            Text(
                              student['status'] == 'ACTIVE' ? 'Verified by EduLink • Active Student' : 'Verified by EduLink',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: AppColors.success,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    const SizedBox(height: 16),
                    if (student['institution_name'] != null)
                      _InfoRow(
                        label: 'Institution',
                        value: student['institution_name'] as String,
                      ),
                    if (student['department'] != null)
                      _InfoRow(
                        label: 'Department',
                        value: student['department'] as String,
                      ),
                  ],
                ),
              ),
            ),
          ],
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Scan Another'),
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(color: AppColors.textSecondary)),
          Text(value, style: Theme.of(context).textTheme.bodyMedium),
        ],
      ),
    );
  }
}
