
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle OPTIONS request for CORS
Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get request body
    const { user_id, admin_key } = await req.json()

    // Verify admin key for security
    const ADMIN_KEY = Deno.env.get('ADMIN_KEY') || 'supersecretkey123'
    if (!admin_key || admin_key !== ADMIN_KEY) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid admin key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate user_id
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'Bad request: user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role
    // Use hardcoded values since env variables might not be properly set
    const supabaseUrl = "https://lxluyeezxvhyqtjduwbb.supabase.co"
    const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4bHV5ZWV6eHZoeXF0amR1d2JiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjAzNDUxNSwiZXhwIjoyMDYxNjEwNTE1fQ.dLlJvQwQ8IT-Jv5AycEzBNcEbjfThVDGMRJW_FMyJTc"
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user_id)
      .single()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update user role to superuser
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: 'superuser' })
      .eq('id', user_id)
      .select()

    if (error) {
      console.error('Error updating user role:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to update user role' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log the action
    await supabase.rpc('log_activity', {
      action: 'promote_to_superuser',
      target_type: 'user',
      target_id: user_id,
      metadata: { previous_role: user.role }
    }).catch(e => console.error('Error logging activity:', e))

    return new Response(
      JSON.stringify({ 
        message: 'User successfully promoted to superuser',
        user: data[0]
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
