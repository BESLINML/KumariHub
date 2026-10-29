
const API_URL = import.meta.env.VITE_API_URL;
export const business = async () => {
  try {
    const response = await fetch(`${API_URL}/api/businesses`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};
