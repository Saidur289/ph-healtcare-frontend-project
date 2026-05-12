enum Gender {
  Male = "MALE",
  Female = "FEMALE",
  Other = "OTHER",
}
export enum UserStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
  DELETED = "DELETED",
}

export interface IDoctors {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string;
  contactNumber?: string;
  address?: string;
  registrationNumber: string;
  experience?: number;
  gender: Gender;
  appointmentFee: number;
  qualification: string;
  averageRating: number;
  createdAt: Date;
  currentWorkingPlace: string;
  designation: string;
  user: {
    status: UserStatus;
  };
  specialties: Array<{
    specialtyId: string;
    doctorId: string;
    specialty: {
      id: string;
      title: string;
      icon?: string;
    };
  }>;
}
