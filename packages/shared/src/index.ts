
export type UserRole = 'ADMIN' | 'MANAGER' | 'SURVEYOR' | 'INTERNAL_OFFICE' | 'CLIENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  approved: boolean;
  createdAt: FirebaseTimestamp;
}

export interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
}

export type ElectionType =
  | 'MLA' | 'MP' | 'MLC' | 'Sarpanch' | 'MPTC' | 'ZPTC'
  | 'GHMC' | 'Municipality' | 'Municipal Corporation' | 'Other';

export interface LocationHierarchy {
  stateId: string;
  districtId: string;
  constituencyId: string;
  mandalId?: string;
  villageId?: string;
  wardId?: string;
  ghmcZoneId?: string;
  municipalityId?: string;
  municipalCorporationId?: string;
}

export interface Assignment {
  id: string;
  managerId: string;
  surveyorId: string;
  electionType: ElectionType;
  location: LocationHierarchy;
  deadline: FirebaseTimestamp;
  instructions?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'INTERNAL_ADDED' | 'APPROVED' | 'VERSION_UPDATED' | 'ASSIGNED' | 'EXPIRED';
  createdAt: FirebaseTimestamp;
}

export interface SurveyData {
  assignmentId: string;
  surveyorId: string;
  locationData: LocationHierarchy;
  sampleData: {
    gender: { male: number; female: number; other: number };
    totalSample: number;
  };
  partySupport: Record<string, number>;
  candidateAnalysis: {
    candidateName: string;
    partyName: string;
    strength: number;
    weakness: string;
  }[];
  observations: string;
  mapImageUrl?: string;
  additionalImages?: string[];
  internalNotes?: string;
  locked: boolean;
  submittedAt: FirebaseTimestamp;
}

export interface Report {
  id: string;
  assignmentId: string;
  version: number;
  data: SurveyData;
  generatedBy: string;
  generatedAt: FirebaseTimestamp;
  active: boolean;
  editNotes?: string;
}

export interface ClientAssignment {
  reportId: string;
  clientId: string;
  assignedBy: string;
  expiryDate: FirebaseTimestamp;
  createdAt: FirebaseTimestamp;
}
