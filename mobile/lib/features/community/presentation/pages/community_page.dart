import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:edulink_mobile/config/theme/app_colors.dart';
import 'package:edulink_mobile/core/di/injection.dart';
import 'package:edulink_mobile/core/widgets/empty_state.dart';
import 'package:edulink_mobile/features/community/presentation/bloc/community_bloc.dart';
import 'package:edulink_mobile/features/community/domain/entities/community_entities.dart';

class CommunityPage extends StatelessWidget {
  const CommunityPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) =>
          getIt<CommunityBloc>()..add(CommunityLoadRequested()),
      child: DefaultTabController(
        length: 3,
        child: Scaffold(
          appBar: AppBar(
            title: const Text('Community'),
            bottom: const TabBar(
              tabs: [
                Tab(text: 'Reputation'),
                Tab(text: 'Leaderboard'),
                Tab(text: 'Badges'),
              ],
            ),
          ),
          body: BlocBuilder<CommunityBloc, CommunityState>(
            builder: (context, state) {
              if (state is CommunityLoading) {
                return const Center(child: CircularProgressIndicator());
              }
              if (state is CommunityError) {
                return ErrorDisplay(
                  message: state.message,
                  onRetry: () => context
                      .read<CommunityBloc>()
                      .add(CommunityLoadRequested()),
                );
              }
              if (state is CommunityLoaded) {
                return TabBarView(
                  children: [
                    _ReputationTab(reputation: state.reputation),
                    _LeaderboardTab(entries: state.leaderboard),
                    _BadgesTab(allBadges: state.allBadges, myBadges: state.myBadges),
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

// ─── Reputation Tab ──────────────────────────────────────────
class _ReputationTab extends StatelessWidget {
  final ReputationEntity reputation;
  const _ReputationTab({required this.reputation});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          // Overall score card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primary, AppColors.secondary],
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: [
                Text(
                  reputation.overallScore.toStringAsFixed(1),
                  style: const TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  reputation.tier.toUpperCase(),
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.white70,
                    letterSpacing: 2,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Overall Reputation',
                  style: TextStyle(color: Colors.white60),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          _ScoreRow('Academic', reputation.academicScore, Icons.school),
          _ScoreRow('Community', reputation.communityScore, Icons.people),
          _ScoreRow('Projects', reputation.projectScore, Icons.code),
          const SizedBox(height: 24),
          Row(
            children: [
              _StatCard('Credentials', '${reputation.credentialCount}', Icons.verified),
              const SizedBox(width: 12),
              _StatCard('Endorsements', '${reputation.endorsementCount}', Icons.thumb_up),
              const SizedBox(width: 12),
              _StatCard('Badges', '${reputation.badgeCount}', Icons.emoji_events),
            ],
          ),
        ],
      ),
    );
  }
}

class _ScoreRow extends StatelessWidget {
  final String label;
  final double score;
  final IconData icon;
  const _ScoreRow(this.label, this.score, this.icon);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.primary),
          const SizedBox(width: 12),
          Expanded(child: Text(label)),
          SizedBox(
            width: 120,
            child: LinearProgressIndicator(
              value: score / 100,
              backgroundColor: AppColors.primary.withOpacity(0.1),
              valueColor: const AlwaysStoppedAnimation(AppColors.primary),
              borderRadius: BorderRadius.circular(4),
            ),
          ),
          const SizedBox(width: 12),
          SizedBox(
            width: 40,
            child: Text(
              score.toStringAsFixed(0),
              textAlign: TextAlign.end,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  const _StatCard(this.label, this.value, this.icon);

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            children: [
              Icon(icon, color: AppColors.secondary),
              const SizedBox(height: 4),
              Text(value,
                  style: const TextStyle(
                      fontSize: 20, fontWeight: FontWeight.bold)),
              Text(label,
                  style: Theme.of(context).textTheme.labelSmall),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Leaderboard Tab ──────────────────────────────────────────
class _LeaderboardTab extends StatelessWidget {
  final List<LeaderboardEntry> entries;
  const _LeaderboardTab({required this.entries});

  @override
  Widget build(BuildContext context) {
    if (entries.isEmpty) {
      return const EmptyState(
        icon: Icons.leaderboard,
        title: 'No Leaderboard Data',
        description: 'The leaderboard will populate as students earn reputation.',
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: entries.length,
      itemBuilder: (context, index) {
        final e = entries[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: _rankColor(e.rank),
              child: Text(
                '#${e.rank}',
                style: const TextStyle(
                    color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
            title: Text(e.fullName),
            subtitle: Text(e.tier),
            trailing: Text(
              e.reputationScore.toStringAsFixed(1),
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
          ),
        );
      },
    );
  }

  Color _rankColor(int rank) {
    switch (rank) {
      case 1:
        return const Color(0xFFFFD700);
      case 2:
        return const Color(0xFFC0C0C0);
      case 3:
        return const Color(0xFFCD7F32);
      default:
        return AppColors.primary;
    }
  }
}

// ─── Badges Tab ──────────────────────────────────────────────
class _BadgesTab extends StatelessWidget {
  final List<BadgeEntity> allBadges;
  final List<BadgeEntity> myBadges;
  const _BadgesTab({required this.allBadges, required this.myBadges});

  @override
  Widget build(BuildContext context) {
    final myBadgeIds = myBadges.map((b) => b.id).toSet();
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.8,
      ),
      itemCount: allBadges.length,
      itemBuilder: (context, index) {
        final badge = allBadges[index];
        final earned = myBadgeIds.contains(badge.id);
        return Card(
          color: earned ? null : Theme.of(context).colorScheme.surfaceContainerHighest,
          child: Padding(
            padding: const EdgeInsets.all(8),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.emoji_events,
                  size: 36,
                  color: earned ? AppColors.secondary : Colors.grey,
                ),
                const SizedBox(height: 8),
                Text(
                  badge.name,
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: earned ? null : Colors.grey,
                  ),
                ),
                if (!earned)
                  const Icon(Icons.lock, size: 14, color: Colors.grey),
              ],
            ),
          ),
        );
      },
    );
  }
}
