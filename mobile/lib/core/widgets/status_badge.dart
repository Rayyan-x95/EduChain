import 'package:flutter/material.dart';
import 'package:edulink_mobile/config/theme/app_colors.dart';

class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({super.key, required this.status});

  Color get _color {
    switch (status.toLowerCase()) {
      case 'verified':
      case 'approved':
      case 'active':
        return AppColors.verified;
      case 'pending':
      case 'pending_review':
        return AppColors.pending;
      case 'rejected':
      case 'final_rejected':
      case 'revoked':
        return AppColors.rejected;
      case 'suspended':
      case 'blacklisted':
        return AppColors.suspended;
      default:
        return AppColors.textTertiary;
    }
  }

  String get _label {
    return status.replaceAll('_', ' ').toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: _color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: _color.withOpacity(0.2), width: 1),
      ),
      child: Text(
        _label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: _color,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.5,
            ),
      ),
    );
  }
}

