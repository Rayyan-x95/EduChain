import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:edulink_mobile/features/student_profile/domain/entities/profile_entity.dart';
import 'package:edulink_mobile/features/student_profile/domain/usecases/get_profile_usecase.dart';
import 'package:edulink_mobile/features/student_profile/domain/usecases/update_profile_usecase.dart';

// Events
abstract class ProfileEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class ProfileLoadRequested extends ProfileEvent {}

class ProfileUpdateRequested extends ProfileEvent {
  final Map<String, dynamic> data;
  ProfileUpdateRequested(this.data);

  @override
  List<Object?> get props => [data];
}

// States
abstract class ProfileState extends Equatable {
  @override
  List<Object?> get props => [];
}

class ProfileInitial extends ProfileState {}
class ProfileLoading extends ProfileState {}

class ProfileLoaded extends ProfileState {
  final ProfileEntity profile;
  ProfileLoaded(this.profile);

  @override
  List<Object?> get props => [profile.id];
}

class ProfileUpdating extends ProfileState {
  final ProfileEntity profile;
  ProfileUpdating(this.profile);
}

class ProfileError extends ProfileState {
  final String message;
  ProfileError(this.message);

  @override
  List<Object?> get props => [message];
}

// Bloc
class ProfileBloc extends Bloc<ProfileEvent, ProfileState> {
  final GetProfileUseCase getProfileUseCase;
  final UpdateProfileUseCase updateProfileUseCase;

  ProfileBloc({
    required this.getProfileUseCase,
    required this.updateProfileUseCase,
  }) : super(ProfileInitial()) {
    on<ProfileLoadRequested>(_onLoad);
    on<ProfileUpdateRequested>(_onUpdate);
  }

  Future<void> _onLoad(
    ProfileLoadRequested event,
    Emitter<ProfileState> emit,
  ) async {
    emit(ProfileLoading());
    final result = await getProfileUseCase();
    result.fold(
      (error) => emit(ProfileError(error)),
      (profile) => emit(ProfileLoaded(profile)),
    );
  }

  Future<void> _onUpdate(
    ProfileUpdateRequested event,
    Emitter<ProfileState> emit,
  ) async {
    final current = state;
    if (current is ProfileLoaded) {
      emit(ProfileUpdating(current.profile));
    }
    final result = await updateProfileUseCase(event.data);
    result.fold(
      (error) => emit(ProfileError(error)),
      (profile) => emit(ProfileLoaded(profile)),
    );
  }
}
