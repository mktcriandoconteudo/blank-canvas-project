import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify caller is admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller }, error: callerError } = await supabaseAdmin.auth.getUser(token);
    if (callerError || !caller) {
      return new Response(JSON.stringify({ error: 'Token inválido' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check admin role
    const { data: roles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .eq('role', 'admin');

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: 'Sem permissão' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { username, password, resort_id } = await req.json();

    if (!username || !password || !resort_id) {
      return new Response(JSON.stringify({ error: 'username, password e resort_id são obrigatórios' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create email from username
    const email = `${username.toLowerCase().replace(/\s+/g, '.')}@owner.caldas.app`;

    // Check if username already exists
    const { data: existing } = await supabaseAdmin
      .from('admin_usernames')
      .select('id')
      .ilike('username', username)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ error: 'Username já existe' }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create user in auth
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError || !newUser.user) {
      return new Response(JSON.stringify({ error: createError?.message || 'Erro ao criar usuário' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Assign owner role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: newUser.user.id, role: 'owner' });

    if (roleError) {
      console.error('Role error:', roleError);
    }

    // Create username mapping
    const { error: usernameError } = await supabaseAdmin
      .from('admin_usernames')
      .insert({ user_id: newUser.user.id, username });

    if (usernameError) {
      console.error('Username error:', usernameError);
    }

    // Link owner to resort (apartment)
    const { error: linkError } = await supabaseAdmin
      .from('resorts')
      .update({ owner_id: newUser.user.id })
      .eq('id', resort_id);

    if (linkError) {
      console.error('Link error:', linkError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      user_id: newUser.user.id,
      message: `Dono "${username}" criado e vinculado ao apartamento` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
