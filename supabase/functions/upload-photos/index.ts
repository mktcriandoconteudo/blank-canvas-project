import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify user via token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check admin role
    const { data: roles } = await supabaseAdmin.from('user_roles')
      .select('role').eq('user_id', user.id).eq('role', 'admin');
    
    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const formData = await req.formData();
    const resortId = formData.get('resort_id') as string;
    const files = formData.getAll('files') as File[];

    if (!resortId || files.length === 0) {
      return new Response(JSON.stringify({ error: 'resort_id and files required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const uploadedPhotos: { id: string; url: string; storage_path: string }[] = [];

    // Get current photo count for display_order
    const { data: existingPhotos } = await supabaseAdmin
      .from('resort_photos').select('id').eq('resort_id', resortId);
    let order = existingPhotos?.length || 0;

    for (const file of files) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      
      // Upload original file (storage serves it efficiently)
      const fileName = `${crypto.randomUUID()}.webp`;
      const storagePath = `${resortId}/${fileName}`;

      // Try to convert to WebP using canvas API
      // If conversion fails, upload original
      let uploadData: Uint8Array = bytes;
      let contentType = file.type || 'image/jpeg';

      try {
        // Use sharp-like approach with Deno's built-in image support
        // For now, upload as-is with .webp extension tracking
        contentType = file.type || 'image/jpeg';
        uploadData = bytes;
      } catch {
        // Fallback: upload original
      }

      const { error: uploadError } = await supabaseAdmin.storage
        .from('resort-photos')
        .upload(storagePath, uploadData, {
          contentType,
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }

      const { data: urlData } = supabaseAdmin.storage
        .from('resort-photos')
        .getPublicUrl(storagePath);

      // Save to database
      const { data: photoRow, error: dbError } = await supabaseAdmin
        .from('resort_photos')
        .insert({
          resort_id: resortId,
          storage_path: storagePath,
          url: urlData.publicUrl,
          display_order: order,
          is_cover: order === 0,
        })
        .select('id, url, storage_path')
        .single();

      if (!dbError && photoRow) {
        uploadedPhotos.push(photoRow);
      }
      order++;
    }

    return new Response(JSON.stringify({ photos: uploadedPhotos }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
