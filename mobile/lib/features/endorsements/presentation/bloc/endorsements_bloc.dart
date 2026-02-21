import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:edulink_mobile/features/endorsements/domain/entities/endorsement_entity.dart';
import 'package:edulink_mobile/features/endorsements/domain/usecases/get_endorsements_usecase.dart';
import 'package:edulink_mobile/features/endorsements/domain/usecases/give_endorsement_usecase.dart';

// Events
abstract class EndorsementsEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class EndorsementsLoadRequested extends EndorsementsEvent {}

class EndorsementGiveRequested extends EndorsementsEvent {
  final String userId;
  final String category;
  final String? comment;
  EndorsementGiveRequested({required this.userId, required this.category, this.comment});
}

// States
abstract class EndorsementsState extends Equatable {
  @override
  List<Object?> get props => [];
}

class EndorsementsInitial extends EndorsementsState {}
class EndorsementsLoading extends EndorsementsState {}

class EndorsementsLoaded extends EndorsementsState {
  final List<EndorsementEntity> received;
  final List<EndorsementEntity> given;
  EndorsementsLoaded({required this.received, required this.given});
  @override
  List<Object?> get props => [received.length, given.length];
}

class EndorsementGiving extends EndorsementsState {}

class EndorsementGiven extends EndorsementsState {
  final EndorsementEntity endorsement;
  EndorsementGiven(this.endorsement);
}

class EndorsementsError extends EndorsementsState {
  final String message;
  EndorsementsError(this.message);
  @override
  List<Object?> get props => [message];
}

// Bloc
class EndorsementsBloc extends Bloc<EndorsementsEvent, EndorsementsState> {
  final GetEndorsementsUseCase getEndorsementsUseCase;
  final GiveEndorsementUseCase giveEndorsementUseCase;

  EndorsementsBloc({
    required this.getEndorsementsUseCase,
    required this.giveEndorsementUseCase,
  }) : super(EndorsementsInitial()) {
    on<EndorsementsLoadRequested>(_onLoad);
    on<EndorsementGiveRequested>(_onGive);
  }

  Future<void> _onLoad(
    EndorsementsLoadRequested event,
    Emitter<EndorsementsState> emit,
  ) async {
    emit(EndorsementsLoading());
    final receivedResult = await getEndorsementsUseCase.callReceived();
    final givenResult = await getEndorsementsUseCase.callGiven();

    receivedResult.fold(
      (error) => emit(EndorsementsError(error)),
      (received) {
        givenResult.fold(
          (error) => emit(EndorsementsError(error)),
          (given) => emit(EndorsementsLoaded(received: received, given: given)),
        );
      },
    );
  }

  Future<void> _onGive(
    EndorsementGiveRequested event,
    Emitter<EndorsementsState> emit,
  ) async {
    emit(EndorsementGiving());
    final result = await giveEndorsementUseCase(
      userId: event.userId,
      category: event.category,
      comment: event.comment,
    );
    result.fold(
      (error) => emit(EndorsementsError(error)),
      (endorsement) => emit(EndorsementGiven(endorsement)),
    );
  }
}
