# HOW TO CONNECT TO YOUR CHATGPT ACCOUNT

## Overview
This guide explains how to connect the US Climate & Energy Policy Agent to your ChatGPT account using ChatGPT Actions.

## Prerequisites Checklist
- [ ] ChatGPT Plus, Team, or Enterprise subscription
- [ ] Application deployed to Vercel (or running locally)
- [ ] Vercel URL (e.g., `https://us-climate-policy-xxx.vercel.app`)
- [ ] Access to ChatGPT's GPT creation interface

---

## Step 1: Deploy to Vercel

### If Not Already Deployed:

**Option A: Using Git (Recommended)**
```bash
cd "c:\Users\Administrator\Desktop\US UN History"
git init
git add .
git commit -m "US Climate Policy Agent"
git remote add origin https://github.com/YOUR_USERNAME/us-climate-policy.git
git push -u origin main
```

Then on vercel.com:
1. Click "New Project"
2. Select your GitHub repo
3. Click "Deploy"
4. Copy your Vercel URL

**Option B: Using Vercel CLI**
```bash
npm i -g vercel
cd "c:\Users\Administrator\Desktop\US UN History"
vercel
# Follow prompts and copy the URL
```

**Your Vercel URL will look like**: `https://us-climate-policy-xxx.vercel.app`

---

## Step 2: Access ChatGPT GPT Creation

1. Go to [ChatGPT](https://chatgpt.com)
2. Click your **profile icon** (bottom left)
3. Select **"My GPTs"** or **"Create a new GPT"**
4. Click **"Create a new GPT"** button

---

## Step 3: Create Your Custom GPT

### 3.1 Basic Information

1. Name your GPT: **"US Climate Policy Analyst"**
2. Description: **"Expert analysis of US climate and energy policy positions, statements, and strategic shifts from June 2025-June 2026"**
3. Click the **"Actions"** section on the right panel

---

## Step 4: Add the Action

### 4.1 Create New Action

1. In the Actions panel, click **"Create new action"** or **"Add action"**
2. Choose **"API"** as the action type
3. Copy and paste this OpenAPI Schema:

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
      "url": "https://YOUR_VERCEL_URL"
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
                    "description": "The policy question or topic to analyze"
                  },
                  "context": {
                    "type": "string",
                    "description": "Optional context for the query"
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
                      "type": "string"
                    },
                    "findings": {
                      "type": "array",
                      "items": {
                        "type": "object"
                      }
                    },
                    "themes": {
                      "type": "array",
                      "items": {
                        "type": "object"
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

### 4.2 Replace Placeholder

**IMPORTANT:** Replace `"https://YOUR_VERCEL_URL"` with your actual Vercel URL:

```json
"url": "https://us-climate-policy-abc123.vercel.app"
```

### 4.3 Authentication

Leave authentication settings as:
- **Authentication type**: "None"
- No API key needed (public API)

---

## Step 5: Configure System Instructions

In the GPT's "Instructions" field, paste:

```
You are an expert policy analyst specializing in US climate and energy policy. 
You have access to a comprehensive database of US climate and energy policy statements 
and positions from June 2025 - June 2026.

When users ask questions about US climate or energy policy:

1. Use the Policy API to query the database for relevant information
2. Always provide direct quotes with proper attribution (date, speaker, source)
3. Identify whether positions show consistency or represent policy shifts
4. Note areas of ambiguity or non-commitment
5. Provide balanced analysis suitable for diplomats, researchers, and professionals
6. Reference specific policy themes when relevant:
   - International Commitments
   - Domestic Energy Transition
   - Renewable Energy & Technology
   - Climate Finance
   - Methane Reduction
   - Competition with China
   - Just Transition
   - Adaptation & Resilience

Format your responses with clear structure:
- Opening summary
- Key quote(s) with attribution
- Analysis of consistency/shifts
- Related policy areas
- Areas of ambiguity

Always cite your sources with dates and official positions.
```

---

## Step 6: Add a Description

In the "Description" field:
```
An expert policy analyst with access to comprehensive US climate and energy policy data 
from 2025-2026. Provides citations, analyzes consistency, identifies shifts, and highlights 
ambiguous areas for professional stakeholder engagement.
```

---

## Step 7: Test the GPT

1. Click **"Save"** to save your GPT
2. In the preview window, try asking:
   - "What is the US position on renewable energy?"
   - "How has US climate policy shifted in the last year?"
   - "Show me US statements on climate finance"
   - "What are the key areas of ambiguity in US energy policy?"

3. ChatGPT should call the API and return policy analysis
4. Look for proper citations with dates and speakers

---

## Step 8: Configure Sharing (Optional)

### Make it Public
1. Click **"Share"**
2. Select **"Public - Anyone can use this GPT"**
3. Copy the public link to share
4. Your GPT will be available in the ChatGPT GPT Store

### Keep it Private
1. Click **"Share"**
2. Select **"Only me"**
3. You can only access it from your account

### Share with Organization
1. Click **"Share"**
2. Select **"Specific people"**
3. Add team member emails
4. They can access it with your ChatGPT account

---

## Step 9: Use Your GPT

### Start a Conversation
1. Go to [ChatGPT](https://chatgpt.com)
2. Click on your "US Climate Policy Analyst" GPT
3. Click **"Start a conversation"**
4. Ask policy questions

### Example Questions
```
"What did the US say about just transition in 2025?"
"Compare US positions on methane emissions and renewable energy"
"Is the US consistent on climate finance commitments?"
"What are the ambiguous areas in US climate policy?"
"Show me recent quotes from US climate officials"
"Analyze the evolution of US methane policy"
```

---

## How It Works Behind the Scenes

1. **You ask**: "What's the US position on renewable energy?"
2. **ChatGPT processes** your question
3. **Calls your API**: POST to `/api/chat-gpt-action` with your query
4. **Server searches** policy database (8 themes, 17+ statements)
5. **Returns results**: Relevant statements, quotes, analysis
6. **ChatGPT formats** response with citations and analysis
7. **You receive**: Professional policy analysis with sources

---

## Troubleshooting

### "Action failed to complete"
- ✓ Check Vercel URL is correct
- ✓ Verify endpoint is `/api/chat-gpt-action`
- ✓ Check Vercel deployment is active
- ✓ Look at Vercel Function logs for errors

### "No results returned"
- ✓ Try rewording your question more specifically
- ✓ Ask about topics in the database (climate, energy, policy, etc.)
- ✓ Ask about specific policy areas (renewable, finance, transition, etc.)

### "API timeout"
- ✓ Vercel may need time to warm up
- ✓ Retry the question
- ✓ Check Vercel logs for performance issues

### "API returned invalid response"
- ✓ Verify the OpenAPI schema is correctly formatted
- ✓ Check that Vercel URL is accessible
- ✓ Test endpoint directly: `https://your-url.vercel.app/api/chat-gpt-action` (GET request)

---

## Advanced: Custom ChatGPT GPT in Your Organization

### For ChatGPT Team/Enterprise

1. Have team admin create workspace
2. Click **"Create a new GPT"** in your workspace
3. Follow same steps above
4. Set visibility to **"Available to all team members"**
5. All team members can now use the GPT
6. API calls tracked through team account

### Use Cases
- **Policy Briefings**: Quick reference for teams
- **Stakeholder Engagement**: Share with diplomatic partners
- **Research Teams**: Collaborative policy analysis
- **Education**: Teaching international relations students
- **Government**: Internal policy coordination

---

## Monitoring & Updates

### Monitor Usage
1. Go to Vercel dashboard
2. Select your project
3. View "Analytics" tab
4. See API call frequency and response times
5. Identify most-asked questions

### Update Policy Data
As new US statements are released:
1. Edit `/src/lib/policyData.ts`
2. Add new PolicyStatement objects
3. Commit and push to Git (auto-deploys to Vercel)
4. GPT immediately has access to new data

### Example: Adding a New Statement
```typescript
{
  id: 'stmt-018',
  date: 'June 2026',
  source: 'State Department',
  speaker: 'Jane Smith',
  position: 'US commits to enhanced climate finance',
  context: 'Statement at UN Climate Summit',
  quote: '"Climate finance is central to our partnership with developing nations"',
  category: 'international',
  consistency: 'consistent',
}
```

---

## Security Best Practices

✅ **Current Setup**
- No authentication required (public API)
- Read-only data access
- No personal information stored
- No external data exposure
- Safe for public deployment

⚠️ **Future Considerations**
- For sensitive data: Add API key authentication
- Rate limiting: Prevent abuse
- Audit logging: Track API calls
- CORS configuration: Restrict access if needed

---

## Advanced Options: Alternative Connection Methods

### Option A: ChatGPT Plugins (Legacy)
- ChatGPT Plugins are deprecated as of June 2024
- Use ChatGPT Actions instead (recommended)

### Option B: Direct API Integration
```javascript
// Use the API directly in your application
const response = await fetch('https://your-url.vercel.app/api/chat-gpt-action', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'US renewable energy policy',
    context: 'briefing'
  })
});
```

### Option C: Zapier Integration
1. Create Zapier account
2. Create webhook to your API
3. Connect to ChatGPT or other tools
4. Automate policy data distribution

---

## Support Resources

- **ChatGPT Help**: https://help.openai.com
- **Vercel Docs**: https://vercel.com/docs
- **API Documentation**: In this project's README.md
- **Troubleshooting**: CHATGPT_ACTION_SETUP.md

---

## Quick Links

- **This Project**: `c:\Users\Administrator\Desktop\US UN History`
- **Vercel Dashboard**: https://vercel.com/dashboard
- **ChatGPT**: https://chatgpt.com
- **OpenAI Docs**: https://platform.openai.com/docs

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Create your ChatGPT GPT
3. ✅ Add the action with correct URL
4. ✅ Test with sample questions
5. ✅ Share with colleagues (optional)
6. ✅ Monitor usage in Vercel dashboard
7. ✅ Update policy data as needed

---

**Status**: Ready to Connect  
**Date**: June 12, 2026  
**Support**: See project documentation for additional help
