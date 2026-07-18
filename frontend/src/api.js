import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

export async function predictHeartDisease(payload) {
  const response = await axios.post(`${API_BASE_URL}/predict`, payload);
  return response.data;
}
