import React from 'react';

interface DateTimeLabelProps {
  dateTime: string;
}

const DateTimeLabel: React.FC<DateTimeLabelProps> = ({ dateTime }) => {
  const formatted = React.useMemo(() => {
    const date = new Date(dateTime);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins} 分钟前`;
    if (diffHours < 24) return `${diffHours} 小时前`;
    if (diffDays < 7) return `${diffDays} 天前`;

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    if (date.getFullYear() === now.getFullYear()) {
      return `${month}-${day} ${hours}:${minutes}`;
    }
    return `${date.getFullYear()}-${month}-${day} ${hours}:${minutes}`;
  }, [dateTime]);

  return (
    <time
      dateTime={dateTime}
      className="text-sm text-gray-400 tabular-nums"
      title={new Date(dateTime).toLocaleString('zh-CN')}
    >
      {formatted}
    </time>
  );
};

export default DateTimeLabel;