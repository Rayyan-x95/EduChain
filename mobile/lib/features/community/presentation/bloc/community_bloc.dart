import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:edulink_mobile/features/community/domain/entities/community_entities.dart';
import 'package:edulink_mobile/features/community/domain/usecases/community_usecases.dart';

// Events
abstract class CommunityEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class CommunityLoadRequested extends CommunityEvent {}
class LeaderboardLoadRequested extends CommunityEvent {}
class BadgesLoadRequested extends CommunityEvent {}

// States
abstract class CommunityState extends Equatable {
  @override
  List<Object?> get props => [];
}

class CommunityInitial extends CommunityState {}
class CommunityLoading extends CommunityState {}

class CommunityLoaded extends CommunityState {
  final ReputationEntity reputation;
  final List<LeaderboardEntry> leaderboard;
  final List<BadgeEntity> allBadges;
  final List<BadgeEntity> myBadges;

  CommunityLoaded({
    required this.reputation,
    required this.leaderboard,
    required this.allBadges,
    required this.myBadges,
  });

  @override
  List<Object?> get props => [reputation, leaderboard.length, allBadges.length, myBadges.length];
}

class CommunityError extends CommunityState {
  final String message;
  CommunityError(this.message);
  @override
  List<Object?> get props => [message];
}

// Bloc
class CommunityBloc extends Bloc<CommunityEvent, CommunityState> {
  final GetReputationUseCase getReputationUseCase;
  final GetLeaderboardUseCase getLeaderboardUseCase;
  final GetBadgesUseCase getBadgesUseCase;

  CommunityBloc({
    required this.getReputationUseCase,
    required this.getLeaderboardUseCase,
    required this.getBadgesUseCase,
  }) : super(CommunityInitial()) {
    on<CommunityLoadRequested>(_onLoad);
  }

  Future<void> _onLoad(
    CommunityLoadRequested event,
    Emitter<CommunityState> emit,
  ) async {
    emit(CommunityLoading());

    final results = await Future.wait([
      getReputationUseCase(),
      getLeaderboardUseCase(),
      getBadgesUseCase.callAll(),
      getBadgesUseCase.callMine(),
    ]);

    final reputationResult = results[0] as dynamic;
    final leaderboardResult = results[1] as dynamic;
    final allBadgesResult = results[2] as dynamic;
    final myBadgesResult = results[3] as dynamic;

    // Check for errors
    String? error;
    reputationResult.fold((e) => error = e, (_) {});
    if (error != null) { emit(CommunityError(error!)); return; }
    leaderboardResult.fold((e) => error = e, (_) {});
    if (error != null) { emit(CommunityError(error!)); return; }
    allBadgesResult.fold((e) => error = e, (_) {});
    if (error != null) { emit(CommunityError(error!)); return; }
    myBadgesResult.fold((e) => error = e, (_) {});
    if (error != null) { emit(CommunityError(error!)); return; }

    late ReputationEntity reputation;
    late List<LeaderboardEntry> leaderboard;
    late List<BadgeEntity> allBadges;
    late List<BadgeEntity> myBadges;

    reputationResult.fold((_) {}, (r) => reputation = r);
    leaderboardResult.fold((_) {}, (l) => leaderboard = l);
    allBadgesResult.fold((_) {}, (a) => allBadges = a);
    myBadgesResult.fold((_) {}, (m) => myBadges = m);

    emit(CommunityLoaded(
      reputation: reputation,
      leaderboard: leaderboard,
      allBadges: allBadges,
      myBadges: myBadges,
    ));
  }
}
