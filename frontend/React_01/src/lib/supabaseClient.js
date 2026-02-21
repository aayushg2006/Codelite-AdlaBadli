import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// If keys are missing, we export a null client instead of crashing
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null

if (!supabase) {
  console.error('Supabase Error: Keys are missing from .env file!')
}

export const uploadImageToBucket = async (file, bucketName, fileName) => {
  if (!supabase) throw new Error("Supabase client not initialized")
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, { cacheControl: '3600', upsert: false })

  if (error) throw error

  return supabase.storage.from(bucketName).getPublicUrl(fileName).data.publicUrl
}