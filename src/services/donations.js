const FUNCTION_URL = import.meta.env.VITE_FUNCTION_URL;

export const registerDonation = async ({ userId, email, amount, type, method, currency, status }) => {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, email, amount, type, method, currency, status }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al registrar donación');
  }

  // Retorna data completa (debe incluir el id si la Cloud Function lo manda)
  return data;
};