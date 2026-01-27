import React, { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  onClose: () => void;
  duration?: number;
  type?: 'success' | 'error';
}

const notificationStyles = {
    success: {
        bg: 'bg-green-500',
        icon: 'fa-check-circle'
    },
    error: {
        bg: 'bg-red-500',
        icon: 'fa-exclamation-circle'
    }
}

const Notification: React.FC<NotificationProps> = ({ message, onClose, duration = 3000, type = 'success' }) => {
  const [visible, setVisible] = useState(false);
  const styles = notificationStyles[type];

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      const closeTimer = setTimeout(onClose, 300); 
      return () => clearTimeout(closeTimer);
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-4 px-6 py-4 rounded-xl shadow-2xl text-white ${styles.bg} transition-all duration-300 transform ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
      role="alert"
    >
      <i className={`fa-solid ${styles.icon} text-xl`}></i>
      <p className="font-medium">{message}</p>
      <button onClick={onClose} className="text-2xl leading-none opacity-70 hover:opacity-100">&times;</button>
    </div>
  );
};

export default Notification;