import {USER_ROLES_ENUM} from "../enums/users-roles.enum";
import {USER_STATUS_ENUM} from "../enums/users-status.enum";
import {Timestamp} from "@angular/fire/firestore";
import {TRAINING_TYPE_ENUM} from '../enums/training-type.enum';

export interface UserInterface {
  createdAt: Timestamp;
  id: string;
  status: USER_STATUS_ENUM;
  role: USER_ROLES_ENUM;
  email: string;
  phone: string;
  name: string;
  secondName: string;
}


export interface ClientInterface {
  createdAt: Timestamp;
  payDate: Timestamp;
  id: string;
  coachId: string | null;
  status: USER_STATUS_ENUM;
  role: USER_ROLES_ENUM;
  trainingType: TRAINING_TYPE_ENUM;
  email: string;
  phone: string;
  name: string;
  secondName: string;
  tgUser:any;
  tgChatId:any;
}
