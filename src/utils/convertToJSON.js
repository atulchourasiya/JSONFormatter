
import JSON5 from 'json5';

export const convertToJSON = (input) => {
  try {
    const parsed = JSON5.parse(input);

    return {
      success: true,
      json: JSON.stringify(parsed, null, 2),
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      json: null,
      error: error.message,
    };
  }
};
