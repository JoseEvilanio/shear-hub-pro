
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
    const ADMIN_KEY = Deno.env.get('ADMIN_KEY')
    if (!ADMIN_KEY || admin_key !== ADMIN_KEY) {
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
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
    })

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
