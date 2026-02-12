import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../components/Button';
import Alert from '../components/Alert';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    twoFactorEnabled: false,
    notificationsEnabled: true,
    emailNotifications: true,
    priceAlerts: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data.settings || {});
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleToggle = (key) => {
    setSettings({
      ...settings,
      [key]: !settings[key]
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await axios.put(
        `${API_URL}/user/profile`,
        { settings },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Ayarlar başarıyla kaydedildi');
    } catch (error) {
      setMessage('Ayarlar kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Ayarlar</h1>

        {message && (
          <Alert
            type={message.includes('başarıyla') ? 'success' : 'error'}
            message={message}
            onClose={() => setMessage('')}
          />
        )}

        <div className="bg-gray-800 rounded-lg p-8 space-y-6">
          {/* Two Factor Authentication */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">İki Faktörlü Kimlik Doğrulama</h3>
              <p className="text-gray-400 text-sm">Hesabınızı ek güvenlik katmanı ile koruyun</p>
            </div>
            <input
              type="checkbox"
              checked={settings.twoFactorEnabled || false}
              onChange={() => handleToggle('twoFactorEnabled')}
              className="w-6 h-6 cursor-pointer"
            />
          </div>

          <hr className="border-gray-700" />

          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="font-bold">Bildirimler</h3>

            <div className="flex items-center justify-between">
              <div>
                <p>Web Bildirimleri</p>
                <p className="text-gray-400 text-sm">Tarayıcıda anlık bildirimler</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notificationsEnabled || false}
                onChange={() => handleToggle('notificationsEnabled')}
                className="w-6 h-6 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p>Email Bildirimleri</p>
                <p className="text-gray-400 text-sm">E-postaya bildirim gönder</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications || false}
                onChange={() => handleToggle('emailNotifications')}
                className="w-6 h-6 cursor-pointer"
              />
            </div>
          </div>

          <hr className="border-gray-700" />

          {/* Price Alerts */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">Fiyat Uyarıları</h3>
              <p className="text-gray-400 text-sm">Fiyat değişimleri hakkında uyarı al</p>
            </div>
            <input
              type="checkbox"
              checked={settings.priceAlerts || false}
              onChange={() => handleToggle('priceAlerts')}
              className="w-6 h-6 cursor-pointer"
            />
          </div>

          <hr className="border-gray-700" />

          {/* Save Button */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleSave}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </Button>
        </div>
      </div>
    </div>
  );
}
