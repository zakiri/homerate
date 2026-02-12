export const NotificationService = {
  async createNotification(userId, data, io) {
    try {
      const notification = {
        userId,
        type: data.type, // 'transaction', 'price_alert', 'system'
        title: data.title,
        message: data.message,
        data: data.data,
        read: false,
        createdAt: new Date()
      };

      // Emit real-time notification via Socket.io
      if (io) {
        io.to(`user_${userId}`).emit('notification', notification);
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  async sendTransactionNotification(userId, transaction, io) {
    return this.createNotification(
      userId,
      {
        type: 'transaction',
        title: `${transaction.type.toUpperCase()} İşlemi`,
        message: `${transaction.fromAmount} ${transaction.fromSymbol} işleminin durumu: ${transaction.status}`,
        data: {
          transactionId: transaction._id,
          hash: transaction.transactionHash
        }
      },
      io
    );
  },

  async sendPriceAlert(userId, symbol, price, threshold, io) {
    return this.createNotification(
      userId,
      {
        type: 'price_alert',
        title: `${symbol} Fiyat Uyarısı`,
        message: `${symbol} fiyatı ${threshold} eşiğini geçti: ${price}`,
        data: {
          symbol,
          price,
          threshold
        }
      },
      io
    );
  },

  async sendSystemNotification(userId, title, message, io) {
    return this.createNotification(
      userId,
      {
        type: 'system',
        title,
        message,
        data: {}
      },
      io
    );
  }
};
