const TIMEZONE = 'America/Mexico_City';

export const toLocalISOString = (date: Date): string => {
  try {
    // Asegurarnos de que la fecha sea válida
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.warn('Invalid date provided to toLocalISOString:', date);
      return new Date().toISOString();
    }

    // Convertir a timestamp con timezone de México
    const mexicoDate = new Date(
      date.toLocaleString('en-US', {timeZone: TIMEZONE}),
    );

    // Ajustar el offset de timezone
    const offset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(mexicoDate.getTime() - offset);

    return adjustedDate.toISOString();
  } catch (error) {
    console.error('Error in toLocalISOString:', error);
    return new Date().toISOString();
  }
};

export const fromUTCtoLocal = (utcDateStr: string): Date => {
  try {
    const date = new Date(utcDateStr);
    if (isNaN(date.getTime())) {
      console.warn(
        'Invalid date string provided to fromUTCtoLocal:',
        utcDateStr,
      );
      return new Date();
    }

    // Convertir a timezone de México
    return new Date(date.toLocaleString('en-US', {timeZone: TIMEZONE}));
  } catch (error) {
    console.error('Error in fromUTCtoLocal:', error);
    return new Date();
  }
};

export const getCurrentLocalDate = (): Date => {
  return new Date(new Date().toLocaleString('en-US', {timeZone: TIMEZONE}));
};

export const addSeconds = (date: Date, seconds: number): Date => {
  try {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.warn('Invalid date provided to addSeconds:', date);
      return new Date();
    }
    const newDate = new Date(date);
    newDate.setSeconds(newDate.getSeconds() + seconds);
    return newDate;
  } catch (error) {
    console.error('Error in addSeconds:', error);
    return new Date();
  }
};

export const formatDisplayDate = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      console.warn('Invalid date provided to formatDisplayDate:', date);
      return 'Fecha inválida';
    }
    return dateObj.toLocaleString('es-MX', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error in formatDisplayDate:', error);
    return 'Error en fecha';
  }
};
