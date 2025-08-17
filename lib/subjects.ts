export enum Subject {
  MATHEMATICS = 'MATHEMATICS',
  ENGLISH = 'ENGLISH',
  SCIENCE = 'SCIENCE',
  PHYSICS = 'PHYSICS',
  CHEMISTRY = 'CHEMISTRY',
  BIOLOGY = 'BIOLOGY',
  HISTORY = 'HISTORY',
  GEOGRAPHY = 'GEOGRAPHY',
  COMPUTER_SCIENCE = 'COMPUTER_SCIENCE',
  PROGRAMMING = 'PROGRAMMING',
  LANGUAGES = 'LANGUAGES',
  SPANISH = 'SPANISH',
  FRENCH = 'FRENCH',
  ART = 'ART',
  MUSIC = 'MUSIC',
  ECONOMICS = 'ECONOMICS',
  PSYCHOLOGY = 'PSYCHOLOGY'
}

// Display names for the UI
export const SUBJECT_DISPLAY_NAMES: Record<Subject, string> = {
  [Subject.MATHEMATICS]: 'Mathematics',
  [Subject.ENGLISH]: 'English',
  [Subject.SCIENCE]: 'Science',
  [Subject.PHYSICS]: 'Physics',
  [Subject.CHEMISTRY]: 'Chemistry',
  [Subject.BIOLOGY]: 'Biology',
  [Subject.HISTORY]: 'History',
  [Subject.GEOGRAPHY]: 'Geography',
  [Subject.COMPUTER_SCIENCE]: 'Computer Science',
  [Subject.PROGRAMMING]: 'Programming',
  [Subject.LANGUAGES]: 'Languages',
  [Subject.SPANISH]: 'Spanish',
  [Subject.FRENCH]: 'French',
  [Subject.ART]: 'Art',
  [Subject.MUSIC]: 'Music',
  [Subject.ECONOMICS]: 'Economics',
  [Subject.PSYCHOLOGY]: 'Psychology'
};

// Array of all subjects for dropdowns
export const ALL_SUBJECTS = Object.values(Subject);

// Array of display names for dropdowns
export const ALL_SUBJECT_DISPLAY_NAMES = Object.values(SUBJECT_DISPLAY_NAMES);

// Helper function to convert display name to enum value
export function displayNameToSubject(displayName: string): Subject | null {
  const entry = Object.entries(SUBJECT_DISPLAY_NAMES).find(([_, name]) => name === displayName);
  return entry ? entry[0] as Subject : null;
}

// Helper function to convert enum value to display name
export function subjectToDisplayName(subject: Subject): string {
  return SUBJECT_DISPLAY_NAMES[subject];
}
