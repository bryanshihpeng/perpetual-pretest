import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [reserves, setReserves] = useState({});

  useEffect(() => {
    const fetchReserves = async () => {
      try {
        const response = await axios.get('http://localhost:3000/exchange/reserves');
        setReserves(response.data);
      } catch (error) {
        console.error('Error fetching reserves:', error);
      }
    };

    fetchReserves();
  }, []);

  return (
    <div className="App">
      <h1>Currency Reserves</h1>
      <ul>
        {Object.entries(reserves).map(([currency, amount]) => (
          <li key={currency}>{currency}: {amount}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
