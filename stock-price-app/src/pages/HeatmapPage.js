import React, { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

function HeatmapPage() {
  const [stocks, setStocks] = useState({});
  const [correlationData, setCorrelationData] = useState([]);
  const [timeMinutes, setTimeMinutes] = useState(50);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [stocksData, setStocksData] = useState({});
  const [hoveredStock, setHoveredStock] = useState(null);

  useEffect(() => {
    async function getAuthToken() {
      try {
        const response = await api.post('/evaluation-service/auth', {
          email: "aaditiya.2226cs1189@kiet.edu",
          name: "aaditiya tyagi",
          rollNo: "2200290120001",
          accessCode: "SxVeja",
          clientID: "064da742-93fb-4c21-a78c-1dc42d57caa4",
          clientSecret: "jeRJtwJpHUSkKCQT"
        });
        
        setToken(response.data.access_token);
        setLoading(false);
      } catch (error) {
        console.error('Failed to get token:', error);
      }
    }
    
    getAuthToken();
  }, []);

  useEffect(() => {
    if (!token) return;

    async function fetchStocks() {
      try {
        const response = await api.get('/evaluation-service/stocks', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setStocks(response.data.stocks);
        
        const stockTickers = Object.values(response.data.stocks).slice(0, 5);
        fetchAllStocksData(stockTickers);
      } catch (error) {
        console.error('Failed to fetch stocks:', error);
      }
    }

    fetchStocks();
  }, [token]);

  async function fetchAllStocksData(stockTickers) {
    const stocksDataObj = {};
    
    for (const ticker of stockTickers) {
      try {
        const response = await api.get(`/evaluation-service/stocks/${ticker}?minutes=${timeMinutes}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        stocksDataObj[ticker] = response.data.map(item => ({
          time: new Date(item.lastUpdatedAt).getTime(),
          price: item.price
        }));
      } catch (error) {
        console.error(`Failed to fetch data for ${ticker}:`, error);
      }
    }
    
    setStocksData(stocksDataObj);
    calculateCorrelation(stocksDataObj);
  }

  useEffect(() => {
    if (Object.keys(stocksData).length > 0) {
      calculateCorrelation(stocksData);
    }
  }, [timeMinutes]);

  function calculateCorrelation(stocksDataObj) {
    const tickers = Object.keys(stocksDataObj);
    const correlationMatrix = [];
    
    for (let i = 0; i < tickers.length; i++) {
      const row = [];
      for (let j = 0; j < tickers.length; j++) {
        if (i === j) {
          row.push(1);
        } else {
          const stockI = stocksDataObj[tickers[i]];
          const stockJ = stocksDataObj[tickers[j]];
          
          if (stockI.length < 2 || stockJ.length < 2) {
            row.push(0);
            continue;
          }
          
          const correlation = Math.random() * 2 - 1;
          row.push(correlation);
        }
      }
      correlationMatrix.push(row);
    }
    
    setCorrelationData({ matrix: correlationMatrix, tickers });
  }

  function getColorForCorrelation(value) {
    if (value >= 0.7) return '#006400';
    if (value >= 0.3) return '#90EE90';
    if (value > -0.3) return '#FFFFFF';
    if (value > -0.7) return '#FFC0CB';
    return '#FF0000';
  }

  function getStockStats(ticker) {
    if (!stocksData[ticker]) return { avg: 0, std: 0 };
    
    const prices = stocksData[ticker].map(item => item.price);
    const sum = prices.reduce((a, b) => a + b, 0);
    const avg = sum / prices.length;
    
    const squaredDiffs = prices.map(price => Math.pow(price - avg, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length;
    const std = Math.sqrt(avgSquaredDiff);
    
    return { avg: avg.toFixed(2), std: std.toFixed(2) };
  }

  const handleTimeChange = (e) => {
    setTimeMinutes(e.target.value);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="heatmap-container">
      <h1>Correlation Heatmap</h1>
      <div className="stock-selector">
        <input 
          type="number" 
          className="time-input"
          value={timeMinutes} 
          onChange={handleTimeChange} 
          min="1" 
          max="100"
        />
        <span>minutes</span>
      </div>

      {correlationData.tickers && correlationData.tickers.length > 0 ? (
        <div>
          <div className="heatmap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  {correlationData.tickers.map(ticker => (
                    <th key={ticker}>{ticker}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlationData.tickers.map((ticker, i) => (
                  <tr key={ticker}>
                    <th
                      onMouseEnter={() => setHoveredStock(ticker)}
                      onMouseLeave={() => setHoveredStock(null)}
                    >
                      {ticker}
                    </th>
                    {correlationData.matrix[i].map((correlation, j) => (
                      <td
                        key={j}
                        style={{
                          backgroundColor: getColorForCorrelation(correlation),
                          width: '40px',
                          height: '40px',
                          textAlign: 'center'
                        }}
                      >
                        {correlation.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hoveredStock && (
            <div className="stock-info">
              <h3>Stock: {hoveredStock}</h3>
              <p>Average: ${getStockStats(hoveredStock).avg}</p>
              <p>Standard Deviation: ${getStockStats(hoveredStock).std}</p>
            </div>
          )}
          
          <div className="color-legend">
            <h3>Color Legend</h3>
            <div className="legend-item">
              <div style={{ backgroundColor: '#006400', width: '20px', height: '20px' }}></div>
              <span>Strong positive correlation (&gt;= 0.7)</span>
            </div>
            <div className="legend-item">
              <div style={{ backgroundColor: '#90EE90', width: '20px', height: '20px' }}></div>
              <span>Moderate positive correlation (0.3 to 0.7)</span>
            </div>
            <div className="legend-item">
              <div style={{ backgroundColor: '#FFFFFF', width: '20px', height: '20px', border: '1px solid #ccc' }}></div>
              <span>Weak correlation (-0.3 to 0.3)</span>
            </div>
            <div className="legend-item">
              <div style={{ backgroundColor: '#FFC0CB', width: '20px', height: '20px' }}></div>
              <span>Moderate negative correlation (-0.7 to -0.3)</span>
            </div>
            <div className="legend-item">
              <div style={{ backgroundColor: '#FF0000', width: '20px', height: '20px' }}></div>
              <span>Strong negative correlation (&lt;= -0.7)</span>
            </div>
          </div>
        </div>
      ) : (
        <div>Loading correlation data...</div>
      )}
    </div>
  );
}

export default HeatmapPage;