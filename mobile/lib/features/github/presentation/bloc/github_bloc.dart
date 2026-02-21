import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:edulink_mobile/features/github/domain/entities/github_entities.dart';
import 'package:edulink_mobile/features/github/domain/usecases/github_usecases.dart';

// Events
abstract class GithubEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class GithubConnectRequested extends GithubEvent {}

class GithubCallbackReceived extends GithubEvent {
  final String code;
  GithubCallbackReceived(this.code);
}

class GithubContributionsLoadRequested extends GithubEvent {}

class GithubDisconnectRequested extends GithubEvent {}

// States
abstract class GithubState extends Equatable {
  @override
  List<Object?> get props => [];
}

class GithubInitial extends GithubState {}
class GithubLoading extends GithubState {}

class GithubConnectUrlReady extends GithubState {
  final String url;
  GithubConnectUrlReady(this.url);
  @override
  List<Object?> get props => [url];
}

class GithubConnected extends GithubState {
  final GithubProfileEntity profile;
  GithubConnected(this.profile);
}

class GithubContributionsLoaded extends GithubState {
  final List<GithubContribution> contributions;
  GithubContributionsLoaded(this.contributions);
}

class GithubDisconnected extends GithubState {}

class GithubError extends GithubState {
  final String message;
  GithubError(this.message);
  @override
  List<Object?> get props => [message];
}

// Bloc
class GithubBloc extends Bloc<GithubEvent, GithubState> {
  final ConnectGithubUseCase connectGithubUseCase;
  final CompleteGithubConnectionUseCase completeConnectionUseCase;
  final GetGithubContributionsUseCase getContributionsUseCase;
  final DisconnectGithubUseCase disconnectGithubUseCase;

  GithubBloc({
    required this.connectGithubUseCase,
    required this.completeConnectionUseCase,
    required this.getContributionsUseCase,
    required this.disconnectGithubUseCase,
  }) : super(GithubInitial()) {
    on<GithubConnectRequested>(_onConnect);
    on<GithubCallbackReceived>(_onCallback);
    on<GithubContributionsLoadRequested>(_onLoadContributions);
    on<GithubDisconnectRequested>(_onDisconnect);
  }

  Future<void> _onConnect(
    GithubConnectRequested event,
    Emitter<GithubState> emit,
  ) async {
    emit(GithubLoading());
    final result = await connectGithubUseCase();
    result.fold(
      (error) => emit(GithubError(error)),
      (url) => emit(GithubConnectUrlReady(url)),
    );
  }

  Future<void> _onCallback(
    GithubCallbackReceived event,
    Emitter<GithubState> emit,
  ) async {
    emit(GithubLoading());
    final result = await completeConnectionUseCase(event.code);
    result.fold(
      (error) => emit(GithubError(error)),
      (profile) => emit(GithubConnected(profile)),
    );
  }

  Future<void> _onLoadContributions(
    GithubContributionsLoadRequested event,
    Emitter<GithubState> emit,
  ) async {
    emit(GithubLoading());
    final result = await getContributionsUseCase();
    result.fold(
      (error) => emit(GithubError(error)),
      (contributions) => emit(GithubContributionsLoaded(contributions)),
    );
  }

  Future<void> _onDisconnect(
    GithubDisconnectRequested event,
    Emitter<GithubState> emit,
  ) async {
    emit(GithubLoading());
    final result = await disconnectGithubUseCase();
    result.fold(
      (error) => emit(GithubError(error)),
      (_) => emit(GithubDisconnected()),
    );
  }
}
