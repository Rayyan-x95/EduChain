import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:edulink_mobile/features/appeals/domain/entities/appeal_entity.dart';
import 'package:edulink_mobile/features/appeals/domain/usecases/get_appeals_usecase.dart';
import 'package:edulink_mobile/features/appeals/domain/usecases/create_appeal_usecase.dart';

// Events
abstract class AppealsEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class AppealsLoadRequested extends AppealsEvent {}

class AppealCreateRequested extends AppealsEvent {
  final String reason;
  AppealCreateRequested(this.reason);
  @override
  List<Object?> get props => [reason];
}

// States
abstract class AppealsState extends Equatable {
  @override
  List<Object?> get props => [];
}

class AppealsInitial extends AppealsState {}
class AppealsLoading extends AppealsState {}

class AppealsLoaded extends AppealsState {
  final List<AppealEntity> appeals;
  AppealsLoaded(this.appeals);
  @override
  List<Object?> get props => [appeals.length];
}

class AppealCreating extends AppealsState {}

class AppealCreated extends AppealsState {
  final AppealEntity appeal;
  AppealCreated(this.appeal);
}

class AppealsError extends AppealsState {
  final String message;
  AppealsError(this.message);
  @override
  List<Object?> get props => [message];
}

// Bloc
class AppealsBloc extends Bloc<AppealsEvent, AppealsState> {
  final GetAppealsUseCase getAppealsUseCase;
  final CreateAppealUseCase createAppealUseCase;

  AppealsBloc({
    required this.getAppealsUseCase,
    required this.createAppealUseCase,
  }) : super(AppealsInitial()) {
    on<AppealsLoadRequested>(_onLoad);
    on<AppealCreateRequested>(_onCreate);
  }

  Future<void> _onLoad(AppealsLoadRequested event, Emitter<AppealsState> emit) async {
    emit(AppealsLoading());
    final result = await getAppealsUseCase();
    result.fold(
      (error) => emit(AppealsError(error)),
      (appeals) => emit(AppealsLoaded(appeals)),
    );
  }

  Future<void> _onCreate(AppealCreateRequested event, Emitter<AppealsState> emit) async {
    emit(AppealCreating());
    final result = await createAppealUseCase(event.reason);
    result.fold(
      (error) => emit(AppealsError(error)),
      (appeal) => emit(AppealCreated(appeal)),
    );
  }
}
