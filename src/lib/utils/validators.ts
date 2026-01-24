/**
 * Utility functions for validation
 */

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validate password strength
   * @param password - Password to validate
   * @returns Object with validation result and message
   */
  export const validatePassword = (password: string): {
    isValid: boolean;
    message?: string;
  } => {
    if (!password) {
      return { isValid: false, message: 'La contraseña es requerida' };
    }
  
    if (password.length < 6) {
      return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }
  
    if (password.length > 50) {
      return { isValid: false, message: 'La contraseña no puede tener más de 50 caracteres' };
    }
  
    return { isValid: true };
  };
  
  /**
   * Validate phone number (Colombian format)
   * @param phone - Phone number to validate
   * @returns True if valid, false otherwise
   */
  export const isValidPhone = (phone: string): boolean => {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Colombian phone numbers are 10 digits
    return cleaned.length === 10;
  };
  
  /**
   * Validate required field
   * @param value - Value to validate
   * @returns True if not empty, false otherwise
   */
  export const isRequired = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return !isNaN(value);
    if (Array.isArray(value)) return value.length > 0;
    return true;
  };
  
  /**
   * Validate minimum length
   * @param value - Value to validate
   * @param min - Minimum length
   * @returns True if valid, false otherwise
   */
  export const minLength = (value: string, min: number): boolean => {
    return value.length >= min;
  };
  
  /**
   * Validate maximum length
   * @param value - Value to validate
   * @param max - Maximum length
   * @returns True if valid, false otherwise
   */
  export const maxLength = (value: string, max: number): boolean => {
    return value.length <= max;
  };
  
  /**
   * Validate number range
   * @param value - Number to validate
   * @param min - Minimum value
   * @param max - Maximum value
   * @returns True if valid, false otherwise
   */
  export const inRange = (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  };
  
  /**
   * Validate date format (YYYY-MM-DD)
   * @param date - Date string to validate
   * @returns True if valid, false otherwise
   */
  export const isValidDate = (date: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
  
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  };
  
  /**
   * Validate time format (HH:MM)
   * @param time - Time string to validate
   * @returns True if valid, false otherwise
   */
  export const isValidTime = (time: string): boolean => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(time);
  };
  
  /**
   * Validate that end time is after start time
   * @param startTime - Start time (HH:MM)
   * @param endTime - End time (HH:MM)
   * @returns True if valid, false otherwise
   */
  export const isEndTimeAfterStart = (startTime: string, endTime: string): boolean => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
  
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
  
    return endMinutes > startMinutes;
  };
  
  /**
   * Validate that date is not in the past
   * @param date - Date string (YYYY-MM-DD)
   * @returns True if valid, false otherwise
   */
  export const isNotPastDate = (date: string): boolean => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    return selectedDate >= today;
  };
  
  /**
   * Sanitize string (remove special characters)
   * @param str - String to sanitize
   * @returns Sanitized string
   */
  export const sanitizeString = (str: string): string => {
    return str.replace(/[<>]/g, '');
  };
  
  /**
   * Validate URL format
   * @param url - URL to validate
   * @returns True if valid, false otherwise
   */
  export const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };