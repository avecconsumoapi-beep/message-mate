/**
 * Normalizes a phone number to DDI+DDD+number format
 * Assumes Brazilian phones if no country code is provided
 */
export const normalizePhone = (phone: string): string => {
  // Remove all non-numeric characters
  const digits = phone.replace(/\D/g, '');
  
  if (!digits) return '';
  
  // If starts with 55 and has 12-13 digits, it's already normalized (Brazil)
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }
  
  // If it has 10-11 digits (DDD + number), add Brazil country code
  if (digits.length >= 10 && digits.length <= 11) {
    return '55' + digits;
  }
  
  // If it already has a country code (starts with other numbers)
  if (digits.length >= 12) {
    return digits;
  }
  
  // Return as-is if we can't determine the format
  return digits;
};

/**
 * Parses phones from Excel data and returns normalized, deduplicated list
 */
export const parseAndNormalizePhones = (data: Record<string, unknown>[]): string[] => {
  const phones = new Set<string>();
  
  data.forEach((row) => {
    // Look for 'phone' column (case-insensitive)
    const phoneKey = Object.keys(row).find(
      (key) => key.toLowerCase() === 'phone'
    );
    
    if (phoneKey && row[phoneKey]) {
      const normalized = normalizePhone(String(row[phoneKey]));
      if (normalized) {
        phones.add(normalized);
      }
    }
  });
  
  return Array.from(phones);
};
