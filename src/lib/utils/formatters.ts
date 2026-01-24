/**
 * Utility functions for formatting data
 */

/**
 * Format price to Colombian Peso currency
 * @param price - Price in COP
 * @returns Formatted price string
 */
export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  /**
   * Format date to readable Spanish format
   * @param dateString - ISO date string
   * @returns Formatted date string
   */
  export const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };
  
  /**
   * Format date to short format
   * @param dateString - ISO date string
   * @returns Formatted date string (DD/MM/YYYY)
   */
  export const formatDateShort = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };
  
  /**
   * Format time to HH:MM format
   * @param timeString - Time string
   * @returns Formatted time
   */
  export const formatTime = (timeString: string): string => {
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
  };
  
  /**
   * Capitalize first letter of string
   * @param str - String to capitalize
   * @returns Capitalized string
   */
  export const capitalize = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };
  
  /**
   * Format phone number
   * @param phone - Phone number
   * @returns Formatted phone number
   */
  export const formatPhone = (phone: string): string => {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    return phone;
  };
  
  /**
   * Truncate text to specified length
   * @param text - Text to truncate
   * @param length - Maximum length
   * @returns Truncated text
   */
  export const truncate = (text: string, length: number): string => {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
  };
  
  /**
   * Get relative time (e.g., "hace 2 horas")
   * @param dateString - ISO date string
   * @returns Relative time string
   */
  export const getRelativeTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHours = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHours / 24);
  
      if (diffDays > 7) {
        return formatDateShort(dateString);
      } else if (diffDays > 0) {
        return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
      } else if (diffHours > 0) {
        return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
      } else if (diffMin > 0) {
        return `hace ${diffMin} minuto${diffMin > 1 ? 's' : ''}`;
      } else {
        return 'hace unos segundos';
      }
    } catch (error) {
      console.error('Error getting relative time:', error);
      return dateString;
    }
  };