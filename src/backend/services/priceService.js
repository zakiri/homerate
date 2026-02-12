// Example price service for real-time updates
import { BinanceService } from './binanceService.js';
import io from 'socket.io';

export const PriceService = {
  async updatePrices(ioServer, symbols) {
    setInterval(async () => {
      for (const symbol of symbols) {
        try {
          const price = await BinanceService.getPrice(symbol);
          
          ioServer.to(`market_${symbol}`).emit('price_update', {
            symbol,
            price,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error(`Error updating price for ${symbol}:`, error);
        }
      }
    }, 5000); // Update every 5 seconds
  },

  async broadcastMarketData(ioServer) {
    setInterval(async () => {
      try {
        const topMovers = await BinanceService.getTopMovers();
        
        ioServer.emit('top_movers_update', {
          data: topMovers,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error broadcasting market data:', error);
      }
    }, 10000); // Update every 10 seconds
  }
};
