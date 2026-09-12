# ChatGPT Action Integration Guide

This guide explains how to integrate the US Climate & Energy Policy Agent with ChatGPT as a custom action.

## What is a ChatGPT Action?

A ChatGPT Action allows ChatGPT to make API calls to your service when users ask relevant questions. This enables ChatGPT to provide real-time, accurate policy information from your database.

## Prerequisites

1. ChatGPT Plus, Team, or Enterprise subscription
2. Your Vercel deployment URL (e.g., `https://us-climate-policy.vercel.app`)
3. Access to ChatGPT's Actions feature

## Setup Instructions

### Step 1: Deploy to Vercel

If not already deployed, follow these steps:

```bash
npm run build
vercel
```

Your deployment URL will be provided. Example: `https://us-climate-policy-xxx.vercel.app`

### Step 2: Create the Action in ChatGPT

1. Go to [ChatGPT](https://chatgpt.com) or [ChatGPT Plus](https://openai.com/chatgpt)
2. Click on your profile icon → "My GPTs" (or settings)
3. Create new GPT or go to existing custom GPT
4. Click "Create new action"
5. Select "API"

### Step 3: Configure the Action

#### 3.1 Authentication
- **Authentication Type**: None (for public API)
- Leave auth fields empty

#### 3.2 API Schema

Fill in the "Schema" field with the following configuration:

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "US Climate & Energy Policy API",
    "version": "1.0.0",
    "description": "Query US climate and energy policy positions and statements"
  },
  "servers": [
    {
      "url": "https://your-deployment-url.vercel.app"
    }
  ],
  "paths": {
    "/api/chat-gpt-action": {
      "post": {
        "summary": "Query US climate and energy policy database",
        "operationId": "queryPolicyDatabase",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "query": {
                    "type": "string",
                    "description": "The policy question or topic to analyze",
                    "example": "What is the US position on renewable energy?"
                  },
                  "context": {
                    "type": "string",
                    "description": "Optional context for the query",
                    "example": "policy briefing"
                  }
                },
                "required": ["query"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Policy analysis results",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "query": {
                      "type": "string",
                      "description": "The original query"
                    },
                    "findings": {
                      "type": "array",
                      "description": "Relevant policy statements and findings",
                      "items": {
                        "type": "object",
                        "properties": {
                          "date": { "type": "string" },
                          "speaker": { "type": "string" },
                          "quote": { "type": "string" },
                          "context": { "type": "string" }
                        }
                      }
                    },
                    "themes": {
                      "type": "array",
                      "description": "Related policy themes",
                      "items": {
                        "type": "object",
                        "properties": {
                          "title": { "type": "string" },
                          "position": { "type": "string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

#### 3.3 System Instructions

Add these system instructions to your GPT:

```
You are an expert policy analyst specializing in US climate and energy policy. 
When users ask about US climate or energy policy, use the Policy API to query 
the comprehensive policy database covering June 2025 - June 2026.

Always cite specific dates, speakers, and quotes from the database.
Provide balanced analysis showing areas of consistency, policy shifts, and ambiguity.
Present information in a professional manner suitable for policy researchers and diplomats.

When you retrieve policy information:
1. Highlight key statements with proper attribution
2. Note whether positions show consistency or have shifted
3. Identify areas of ambiguity or non-commitment
4. Provide context for understanding policy decisions
5. Always cite your sources with dates and official positions
```

### Step 4: Configure the Action Details

1. **Name**: "US Climate Policy Analyst"
2. **Description**: "Queries comprehensive database of US climate and energy policy statements and analysis"
3. **Instructions for use**: 
   - "Ask about specific policy areas"
   - "Request analysis of policy consistency"
   - "Get official quotes and statements"
   - "Understand US positions on international agreements"

### Step 5: Test the Integration

1. In your ChatGPT session, ask:
   - "What is the US position on renewable energy?"
   - "How has US climate policy shifted in the last 13 months?"
   - "Show me US statements on international climate commitments"

2. ChatGPT should make API calls to your backend and provide responses

## Optional: Attach to Your ChatGPT Account

If you want to use this action across your ChatGPT conversations:

1. Create a custom GPT that uses this action
2. Set it to private (only you can access)
3. Save and use it whenever needed

To create a personal GPT:
1. Go to ChatGPT → "Create a GPT"
2. Add the action following steps above
3. Set system instructions
4. Click "Save" and select "Only me"

## Advanced: Connecting Your Own ChatGPT Account

### Option 1: Via ChatGPT's Action Interface (Recommended)

The method above is the easiest - ChatGPT handles the connection directly.

### Option 2: Via OpenAI API (Advanced)

If you want to use the API programmatically:

```python
import openai

openai.api_key = "your-api-key"

response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[
        {
            "role": "user", 
            "content": "What is the US position on climate finance?"
        }
    ],
    functions=[
        {
            "name": "query_climate_policy",
            "description": "Query US climate policy database",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"}
                },
                "required": ["query"]
            }
        }
    ]
)
```

## Troubleshooting

### "Action failed" error
- Check that your Vercel URL is correct
- Verify API endpoint is `/api/chat-gpt-action`
- Test the endpoint directly: `curl -X GET https://your-url.vercel.app/api/chat-gpt-action`

### No results returned
- ChatGPT may need clarification on your query
- Try asking more specific questions
- The query must be relevant to climate/energy policy

### Connection timeout
- Check that Vercel deployment is active
- API endpoint should respond within 30 seconds
- Monitor Vercel logs for errors

## API Response Format

The API returns structured data:

```json
{
  "query": "US renewable energy policy",
  "findings": [
    {
      "date": "May 2026",
      "speaker": "White House Climate Advisor",
      "quote": "We are ahead of schedule on renewable deployment...",
      "context": "Release of updated climate strategy",
      "category": "domestic"
    }
  ],
  "themes": [
    {
      "title": "Renewable Energy & Green Technology Leadership",
      "position": "Positioning US as global leader...",
      "recent_shifts": [...],
      "areas_of_ambiguity": [...]
    }
  ],
  "timestamp": "2026-06-12T10:30:00Z"
}
```

## Monitoring & Updates

1. **Monitor Usage**: Check Vercel analytics for API usage
2. **Update Policy Data**: Modify `/src/lib/policyData.ts` as new policies are announced
3. **Version Control**: Keep track of policy changes with Git
4. **Redeploy**: Push changes to trigger automatic Vercel redeployment

## Best Practices

1. **Keep API responses concise** - ChatGPT has token limits
2. **Use consistent formatting** - Helps ChatGPT parse responses
3. **Include metadata** - Dates, sources, speakers for credibility
4. **Update regularly** - Add new policy statements as they're released
5. **Test frequently** - Verify action works after updates

## Security Considerations

- Current setup has no authentication (public API)
- To add authentication, implement API keys in `/src/app/api/chat-gpt-action/route.ts`
- For production, consider rate limiting and usage monitoring

## Support

For issues or questions:
1. Check Vercel deployment logs
2. Test API endpoint directly
3. Review ChatGPT action configuration
4. Consult OpenAI documentation: https://platform.openai.com/docs/actions

---

**Last Updated**: June 2026
