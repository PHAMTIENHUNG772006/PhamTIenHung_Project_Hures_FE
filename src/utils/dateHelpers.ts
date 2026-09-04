export const formatDate = (date: string | Date | undefined | null): string => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatTime = (date: string | Date | undefined | null): string => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const formatDateTime = (date: string | Date | undefined | null): string => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return `${formatDate(d)} ${formatTime(d)}`;
};

export const getShiftName = (time: string): string => {
  const hour = parseInt(time.split(':')[0], 10);
  if (hour >= 6 && hour < 14) return 'Ca Sáng (06:00 - 14:00)';
  if (hour >= 14 && hour < 22) return 'Ca Chiều (14:00 - 22:00)';
  return 'Ca Tối (22:00 - 06:00)';
};
