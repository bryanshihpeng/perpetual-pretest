import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const calculateExchangeRate = async (from, to, amount) => {
  try {
    const response = await axios.post(`${API_URL}/exchange/calculate`, {
      from,
      to,
      amount: parseFloat(amount),
    });
    return response.data;
  } catch (error) {
    console.error('Error calculating exchange rate:', error);
    return { error: error.message };
  }
};

export const performExchange = async (from, to, amount) => {
  try {
    const response = await axios.post(`${API_URL}/exchange`, {
      from,
      to,
      amount: parseFloat(amount),
    });
    return response.data;
  } catch (error) {
    console.error('Error performing exchange:', error);
    throw error;
  }
};
