import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css';
import { performExchange } from './services/exchangeService';
import ExchangeRateCalculator from './utils/exchange-rate-calculator';

function App() {
  const [reserves, setReserves] = useState({});
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('TWD');
  const [amount, setAmount] = useState('');
  const [estimatedResult, setEstimatedResult] = useState('');
  const [socket, setSocket] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    const handleConnect = () => {
      console.log('Connected to WebSocket');
      newSocket.emit('subscribeToReserves');
    };

    const handleReservesUpdated = (updatedReserves) => {
      console.log('Received updated reserves:', updatedReserves);
      setReserves(updatedReserves);
    };

    newSocket.on('connect', handleConnect);
    newSocket.on('reservesUpdated', handleReservesUpdated);

    return () => {
      newSocket.off('connect', handleConnect);
      newSocket.off('reservesUpdated', handleReservesUpdated);
      newSocket.emit('unsubscribeFromReserves');
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    const calculateEstimatedResult = async () => {
      if (amount && from && to) {
        try {
          const fromReserve = reserves[from];
          const toReserve = reserves[to];
          if (fromReserve && toReserve) {
            const result = ExchangeRateCalculator.calculateExchangeAmount(
              fromReserve,
              toReserve,
              parseFloat(amount),
            );
            if (!isNaN(result)) {
              const rate = result / parseFloat(amount);
              setEstimatedResult({
                amount: result.toFixed(2),
                rate: rate.toFixed(4),
              });
            } else {
              setEstimatedResult(null);
            }
          } else {
            setEstimatedResult(null);
          }
        } catch (error) {
          console.error('Error calculating estimated result:', error);
          setEstimatedResult(null);
        }
      } else {
        setEstimatedResult(null);
      }
    };

    if (amount && from && to) {
      const debounceTimer = setTimeout(async () => {
        await calculateEstimatedResult();
      }, 300);

      return () => clearTimeout(debounceTimer);
    } else {
      setEstimatedResult(null); // Reset estimatedResult when any input is empty
    }
  }, [amount, from, to, reserves]);

  const handleExchange = async (e) => {
    e.preventDefault();
    try {
      const result = await performExchange(from, to, amount);
      if (result.error) {
        alert(`Error during exchange: ${result.error}`);
      } else {
        console.log('Exchange result:', result);
        const actualAmount = result.toAmount;
        setTransactions((prevTransactions) => [
          {
            from,
            to,
            amount: parseFloat(amount),
            expectedAmount: estimatedResult
              ? parseFloat(estimatedResult.amount)
              : 0,
            actualAmount: parseFloat(actualAmount),
            timestamp: new Date().toLocaleString(),
          },
          ...prevTransactions,
        ]);
        setAmount('');
        setEstimatedResult(null); // Reset estimatedResult after successful transaction
        socket.emit('requestReserves');
      }
    } catch (error) {
      console.error('Error during exchange:', error);
    }
  };

  const handleFromChange = (e) => {
    const newFrom = e.target.value;
    setFrom(newFrom);
    if (newFrom === to) {
      setTo(newFrom === 'USD' ? 'TWD' : 'USD');
    }
  };

  const handleToChange = (e) => {
    const newTo = e.target.value;
    setTo(newTo);
    if (newTo === from) {
      setFrom(newTo === 'USD' ? 'TWD' : 'USD');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Currency Exchange</h1>
      </header>
      <main>
        <section className="reserves">
          <h3>Currency Reserves</h3>
          <div className="reserves-grid">
            {Object.entries(reserves).map(([currency, amount]) => (
              <div key={currency} className="reserve-item">
                <span className="currency">{currency}</span>
                <span className="amount">{parseFloat(amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="exchange">
          <h2>Make an Exchange</h2>
          <form onSubmit={handleExchange}>
            <div className="form-group">
              <label htmlFor="from">From:</label>
              <select id="from" value={from} onChange={handleFromChange}>
                <option value="USD">USD</option>
                <option value="TWD">TWD</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="to">To:</label>
              <select id="to" value={to} onChange={handleToChange}>
                <option value="USD">USD</option>
                <option value="TWD">TWD</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="amount">Amount:</label>
              <input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <button type="submit">Exchange</button>
          </form>
          {amount && (
            <div className="estimated-result">
              {estimatedResult ? (
                <>
                  <p>
                    Estimated Amount:{' '}
                    <strong>
                      {estimatedResult.amount} {to}
                    </strong>
                  </p>
                  <p>
                    Exchange Rate:{' '}
                    <strong>
                      1 {from} = {estimatedResult.rate} {to}
                    </strong>
                  </p>
                </>
              ) : null}
            </div>
          )}
        </section>
        <section className="transactions">
          <h3>Transaction History</h3>
          <table>
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Expected</th>
                <th>Actual</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={index}>
                  <td>
                    from {transaction.amount.toFixed(2)} {transaction.from} to{' '}
                    {transaction.expectedAmount.toFixed(2)} {transaction.to}
                  </td>
                  <td>{transaction.expectedAmount.toFixed(2)}</td>
                  <td>{transaction.actualAmount.toFixed(2)}</td>
                  <td>{transaction.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default App;
