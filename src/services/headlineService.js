import axios from 'axios';

const LAMBDA_API = 'https://fuxcl83sng.execute-api.us-east-2.amazonaws.com/prod/headlines';

export const fetchHeadlines = async () => {
  try {
    const response = await axios.get(LAMBDA_API);
    const data = JSON.parse(response.data.body);
    console.log('Headlines response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching headlines:', error);
    return [];
  }
}; 