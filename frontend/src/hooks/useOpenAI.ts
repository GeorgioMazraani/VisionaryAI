import { useState, useCallback } from 'react';

interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: any[];
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export const useOpenAI = (apiKey: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(
    async (text: string, imageData: string | null = null): Promise<string | null> => {
      if (!apiKey) {
        setError(new Error('API key is required'));
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const messages: OpenAIMessage[] = [
          {
            role: 'system',
            content: [
              {
                type: 'text',
                text: 'You are a helpful AI assistant that can see and understand images. Respond concisely and helpfully. When referring to elements in the image, be specific and descriptive.'
              }
            ]
          }
        ];

        // Create content array for user message
        const userContent: any[] = [];
        
        // Add text content
        if (text) {
          userContent.push({
            type: 'text',
            text
          });
        }
        
        // Add image content if available
        if (imageData) {
          userContent.push({
            type: 'image_url',
            image_url: {
              url: imageData
            }
          });
        }
        
        // Add user message
        messages.push({
          role: 'user',
          content: userContent
        });

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages,
            max_tokens: 500
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to get response from OpenAI');
        }

        const data: OpenAIResponse = await response.json();
        return data.choices[0].message.content;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to process message'));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey]
  );

  return {
    sendMessage,
    isLoading,
    error
  };
};