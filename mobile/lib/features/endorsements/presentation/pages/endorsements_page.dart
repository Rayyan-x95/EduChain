import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:edulink_mobile/config/theme/app_colors.dart';
import 'package:edulink_mobile/core/di/injection.dart';
import 'package:edulink_mobile/core/widgets/empty_state.dart';
import 'package:edulink_mobile/features/endorsements/presentation/bloc/endorsements_bloc.dart';
import 'package:edulink_mobile/features/endorsements/domain/entities/endorsement_entity.dart';

class EndorsementsPage extends StatelessWidget {
  const EndorsementsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) =>
          getIt<EndorsementsBloc>()..add(EndorsementsLoadRequested()),
      child: DefaultTabController(
        length: 2,
        child: Scaffold(
          appBar: AppBar(
            title: const Text('Endorsements'),
            bottom: const TabBar(
              tabs: [
                Tab(text: 'Received'),
                Tab(text: 'Given'),
              ],
            ),
          ),
          body: BlocBuilder<EndorsementsBloc, EndorsementsState>(
            builder: (context, state) {
              if (state is EndorsementsLoading) {
                return const Center(child: CircularProgressIndicator());
              }
              if (state is EndorsementsError) {
                return ErrorDisplay(
                  message: state.message,
                  onRetry: () => context
                      .read<EndorsementsBloc>()
                      .add(EndorsementsLoadRequested()),
                );
              }
              if (state is EndorsementsLoaded) {
                return TabBarView(
                  children: [
                    _EndorsementList(endorsements: state.received, isReceived: true),
                    _EndorsementList(endorsements: state.given, isReceived: false),
                  ],
                );
              }
              return const SizedBox.shrink();
            },
          ),
        ),
      ),
    );
  }
}

class _EndorsementList extends StatelessWidget {
  final List<EndorsementEntity> endorsements;
  final bool isReceived;

  const _EndorsementList({
    required this.endorsements,
    required this.isReceived,
  });

  @override
  Widget build(BuildContext context) {
    if (endorsements.isEmpty) {
      return EmptyState(
        icon: Icons.thumb_up_outlined,
        title: isReceived ? 'No Endorsements Yet' : 'No Endorsements Given',
        description: isReceived
            ? 'When someone endorses you, it will appear here.'
            : 'Endorse fellow students to help build their reputation.',
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: endorsements.length,
      itemBuilder: (context, index) {
        final e = endorsements[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 10),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: AppColors.secondary.withOpacity(0.1),
              child: Text(
                (isReceived ? e.endorserName : e.endorseeName)[0].toUpperCase(),
                style: const TextStyle(
                  color: AppColors.secondary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            title: Text(isReceived ? e.endorserName : e.endorseeName),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(e.category,
                    style: const TextStyle(color: AppColors.primary)),
                if (e.comment != null) Text(e.comment!),
              ],
            ),
            trailing: Text(
              DateFormat.MMMd().format(e.createdAt),
              style: Theme.of(context).textTheme.labelSmall,
            ),
          ),
        );
      },
    );
  }
}
