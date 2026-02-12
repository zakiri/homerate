import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Mock data - API endpoint would be implemented
      const mockNotifications = [
        {
          _id: '1',
          type: 'transaction',
          title: 'Satın Alma İşlemi',
          message: '50 GOLD satın aldınız',
          read: false,
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          type: 'price_alert',
          title: 'Fiyat Uyarısı',
          message: 'GOLD fiyatı arttı: $105.50',
          read: true,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      transaction: 'bg-blue-900 text-blue-200',
      price_alert: 'bg-yellow-900 text-yellow-200',
      system: 'bg-gray-700 text-gray-200',
      warning: 'bg-red-900 text-red-200'
    };
    return colors[type] || colors.system;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Bildirimler</h1>

        {loading ? (
          <div className="text-center py-12">Yükleniyor...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Bildiriminiz bulunmamaktadır
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 rounded-lg backdrop-blur ${
                  notification.read
                    ? 'bg-gray-800 bg-opacity-30'
                    : 'bg-gray-800 border-l-4 border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${getTypeColor(
                          notification.type
                        )}`}
                      >
                        {notification.type}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg">{notification.title}</h3>
                    <p className="text-gray-300">{notification.message}</p>
                    <p className="text-gray-500 text-sm mt-2">
                      {new Date(notification.createdAt).toLocaleString('tr-TR')}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-3 h-3 rounded-full bg-blue-500 mt-2 ml-4"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
