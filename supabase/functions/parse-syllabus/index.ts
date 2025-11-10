import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { syllabusText, courseCode, courseTitle } = await req.json();
    
    console.log('Parsing syllabus for:', courseCode, courseTitle);
    console.log('Text length:', syllabusText?.length);

    if (!syllabusText || syllabusText.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'No syllabus text provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a syllabus parser. Extract all assignments from the syllabus text and return them as a JSON object with an "assignments" array. Each assignment should have:
- title (string): assignment name
- type (string): one of: "Homework", "Reading", "Quiz", "Project", "Exam", "Coding", "Recitation", "Other"
- dueDate (string): YYYY-MM-DD format
- dueTime (string): optional, HH:MM AM/PM format (e.g., "02:30 PM")
- weight (number): optional, points or percentage
- notes (string): optional, any additional details

Look for keywords like: Assignment, Homework, HW, Quiz, Exam, Midterm, Final, Project, Reading, Lab, Recitation, Due, Submit, Deadline

IMPORTANT: Return ONLY a valid JSON object with this structure:
{
  "assignments": [
    {
      "title": "Homework 1",
      "type": "Homework",
      "dueDate": "2025-11-15",
      "dueTime": "11:59 PM",
      "weight": 10,
      "notes": "Chapter 1-3"
    }
  ]
}

If no assignments found, return: {"assignments": []}`;

    const userPrompt = `Course: ${courseCode} - ${courseTitle}\n\nSyllabus text:\n${syllabusText}`;

    console.log('Calling Lovable AI...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to parse syllabus with AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');
    
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'No response from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to parse the JSON from the response
    let parsedData;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Content:', content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response', details: content }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const assignments = parsedData.assignments || [];
    console.log('Extracted assignments:', assignments.length);

    return new Response(
      JSON.stringify({ assignments }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in parse-syllabus function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
