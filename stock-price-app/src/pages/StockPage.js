import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

function StockPage() {
  const [stocks, setStocks] = useState({});
  const [selectedStock, setSelectedStock] = useState('');
  const [timeMinutes, setTimeMinutes] = useState(50);
  const [priceData, setPriceData] = useState([]);
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

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
        
        const firstStock = Object.values(response.data.stocks)[0];
        setSelectedStock(firstStock);
      } catch (error) {
        console.error('Failed to fetch stocks:', error);
      }
    }

    fetchStocks();
  }, [token]);

  useEffect(() => {
    if (!token || !selectedStock) return;

    async function fetchStockData() {
      try {
        const response = await api.get(`/evaluation-service/stocks/${selectedStock}?minutes=${timeMinutes}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const formattedData = response.data.map(item => ({
          time: new Date(item.lastUpdatedAt).toLocaleTimeString(),
          price: item.price
        }));
        
        setPriceData(formattedData);
        
        const sum = formattedData.reduce((acc, item) => acc + item.price, 0);
        setAverage(sum / formattedData.length);
      } catch (error) {
        console.error('Failed to fetch stock data:', error);
      }
    }

    fetchStockData();
  }, [token, selectedStock, timeMinutes]);

  const handleStockChange = (e) => {
    setSelectedStock(e.target.value);
  };

  const handleTimeChange = (e) => {
    setTimeMinutes(e.target.value);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="stock-container">
      <h1>Stock Price Chart</h1>
      <div className="stock-selector">
        <select onChange={handleStockChange} value={selectedStock}>
          {Object.entries(stocks).map(([name, ticker]) => (
            <option key={ticker} value={ticker}>{name} ({ticker})</option>
          ))}
        </select>
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

      <div className="chart-container">
        {priceData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="price" stroke="#8884d8" activeDot={{ r: 8 }} />
              <ReferenceLine y={average} stroke="red" strokeDasharray="3 3" label="Average" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div>No data available</div>
        )}
      </div>

      <div className="stock-info">
        <h3>Stock Information</h3>
        <p>Selected Stock: {selectedStock}</p>
        <p>Average Price: ${average.toFixed(2)}</p>
        <p>Data Points: {priceData.length}</p>
      </div>
    </div>
  );
}

export default StockPage;