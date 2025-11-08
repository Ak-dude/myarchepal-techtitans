// Archaeologist Verification Codes
// In a real application, these would be stored securely in a database
// and managed by administrators

export const ARCHAEOLOGIST_VERIFICATION_CODES = [
  'ARCH2024',
  'EXCAVATE2024',
  'HERITAGE2024',
  'ANCIENT2024',
  'DISCOVERY2024',
  'SITE2024',
  'ARTIFACT2024',
  'RESEARCH2024',
  'FIELDWORK2024',
  'MUSEUM2024'
];

export class VerificationService {
  // Verify if the provided code is valid
  static isValidVerificationCode(code: string): boolean {
    return ARCHAEOLOGIST_VERIFICATION_CODES.includes(code.toUpperCase().trim());
  }

  // Get hint about verification codes (for demo purposes)
  static getVerificationHint(): string {
    return `Valid codes include: ${ARCHAEOLOGIST_VERIFICATION_CODES.slice(0, 3).join(', ')}, etc.`;
  }

  // Check if email domain is from a recognized institution (optional additional verification)
  static isAcademicEmail(email: string): boolean {
    const academicDomains = [
      '.edu',
      '.ac.uk',
      '.ac.',
      'university',
      'college',
      'museum'
    ];

    const lowercaseEmail = email.toLowerCase();
    return academicDomains.some(domain => lowercaseEmail.includes(domain));
  }
}