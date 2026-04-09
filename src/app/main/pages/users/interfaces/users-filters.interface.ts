import {USER_STATUS_ENUM} from '../../../../core/enums/users-status.enum';
import {TRAINING_TYPE_ENUM} from '../../../../core/enums/training-type.enum';

export interface UsersFiltersInterface {
  status: USER_STATUS_ENUM | null;
  coachId: string | null;
  trainingType: TRAINING_TYPE_ENUM | null;
  search: string | null;
}
