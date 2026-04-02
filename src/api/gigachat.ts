const GIGACHAT_API_URL = '/api/api/v1/chat/completions';
const AUTH_URL = '/gigachat/api/v2/oauth';

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

async function getAccessToken(clientId: string, secret: string) {
  const credentials = btoa(`${clientId}:${secret}`);

  const response = await fetch(AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'RqUID': crypto.randomUUID(),
      'Authorization': `Basic ${credentials}`,
    },
    body: 'scope=GIGACHAT_API_PERS',
  });

  if (!response.ok) {
    throw new Error(`Failed to get token: ${response.status}`);
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_at * 1000);
  return accessToken;
}

async function ensureToken(clientId: string, secret: string) {
  if (!accessToken || (tokenExpiry && Date.now() >= tokenExpiry)) {
    await getAccessToken(clientId, secret);
  }
  return accessToken;
}

export async function sendMessageToGigaChat(
  messages: { role: string; content: string }[],
  clientId: string,
  secret: string
) {
  try {
    const token = await ensureToken(clientId, secret);

    const response = await fetch(GIGACHAT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: 'GigaChat',
        messages: messages,
        temperature: 0.7,
        stream: false,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('GigaChat API error:', error);
    return `Ошибка API: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}. Проверьте ключи доступа.`;
  }
}