export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          achievements_en: string[] | null
          achievements_vi: string[] | null
          created_at: string
          description_en: string | null
          description_vi: string | null
          display_order: number | null
          end_date: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          organization_en: string
          organization_vi: string
          published: boolean | null
          role_en: string | null
          role_vi: string | null
          start_date: string
          title_en: string
          title_vi: string
          updated_at: string
        }
        Insert: {
          achievements_en?: string[] | null
          achievements_vi?: string[] | null
          created_at?: string
          description_en?: string | null
          description_vi?: string | null
          display_order?: number | null
          end_date?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          organization_en: string
          organization_vi: string
          published?: boolean | null
          role_en?: string | null
          role_vi?: string | null
          start_date: string
          title_en: string
          title_vi: string
          updated_at?: string
        }
        Update: {
          achievements_en?: string[] | null
          achievements_vi?: string[] | null
          created_at?: string
          description_en?: string | null
          description_vi?: string | null
          display_order?: number | null
          end_date?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          organization_en?: string
          organization_vi?: string
          published?: boolean | null
          role_en?: string | null
          role_vi?: string | null
          start_date?: string
          title_en?: string
          title_vi?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_post_tags: {
        Row: {
          created_at: string
          id: string
          post_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_name: string | null
          category_en: string | null
          category_vi: string | null
          content_en: string
          content_vi: string
          created_at: string
          excerpt_en: string | null
          excerpt_vi: string | null
          featured: boolean | null
          featured_image_url: string | null
          id: string
          published: boolean | null
          published_at: string | null
          reading_time: number | null
          slug: string
          title_en: string
          title_vi: string
          updated_at: string
          views: number | null
        }
        Insert: {
          author_name?: string | null
          category_en?: string | null
          category_vi?: string | null
          content_en: string
          content_vi: string
          created_at?: string
          excerpt_en?: string | null
          excerpt_vi?: string | null
          featured?: boolean | null
          featured_image_url?: string | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          reading_time?: number | null
          slug: string
          title_en: string
          title_vi: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          author_name?: string | null
          category_en?: string | null
          category_vi?: string | null
          content_en?: string
          content_vi?: string
          created_at?: string
          excerpt_en?: string | null
          excerpt_vi?: string | null
          featured?: boolean | null
          featured_image_url?: string | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          reading_time?: number | null
          slug?: string
          title_en?: string
          title_vi?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: []
      }
      blog_tags: {
        Row: {
          created_at: string
          id: string
          name_en: string
          name_vi: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_en: string
          name_vi: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name_en?: string
          name_vi?: string
          slug?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          achievements_en: string[] | null
          achievements_vi: string[] | null
          company_en: string
          company_vi: string
          created_at: string
          description_en: string | null
          description_vi: string | null
          display_order: number | null
          end_date: string | null
          id: string
          image_url: string | null
          is_current: boolean | null
          location: string | null
          published: boolean | null
          start_date: string
          title_en: string
          title_vi: string
          updated_at: string
        }
        Insert: {
          achievements_en?: string[] | null
          achievements_vi?: string[] | null
          company_en: string
          company_vi: string
          created_at?: string
          description_en?: string | null
          description_vi?: string | null
          display_order?: number | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_current?: boolean | null
          location?: string | null
          published?: boolean | null
          start_date: string
          title_en: string
          title_vi: string
          updated_at?: string
        }
        Update: {
          achievements_en?: string[] | null
          achievements_vi?: string[] | null
          company_en?: string
          company_vi?: string
          created_at?: string
          description_en?: string | null
          description_vi?: string | null
          display_order?: number | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_current?: boolean | null
          location?: string | null
          published?: boolean | null
          start_date?: string
          title_en?: string
          title_vi?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_library: {
        Row: {
          alt_text_en: string | null
          alt_text_vi: string | null
          created_at: string
          file_size: number | null
          file_type: string | null
          filename: string
          id: string
          uploaded_by: string | null
          url: string
        }
        Insert: {
          alt_text_en?: string | null
          alt_text_vi?: string | null
          created_at?: string
          file_size?: number | null
          file_type?: string | null
          filename: string
          id?: string
          uploaded_by?: string | null
          url: string
        }
        Update: {
          alt_text_en?: string | null
          alt_text_vi?: string | null
          created_at?: string
          file_size?: number | null
          file_type?: string | null
          filename?: string
          id?: string
          uploaded_by?: string | null
          url?: string
        }
        Relationships: []
      }
      profile: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          github_url: string | null
          id: string
          linkedin_url: string | null
          location: string | null
          name: string
          phone: string | null
          story_en: string | null
          story_vi: string | null
          summary_en: string | null
          summary_vi: string | null
          tagline_en: string | null
          tagline_vi: string | null
          title_en: string
          title_vi: string
          twitter_url: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          name: string
          phone?: string | null
          story_en?: string | null
          story_vi?: string | null
          summary_en?: string | null
          summary_vi?: string | null
          tagline_en?: string | null
          tagline_vi?: string | null
          title_en: string
          title_vi: string
          twitter_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          name?: string
          phone?: string | null
          story_en?: string | null
          story_vi?: string | null
          summary_en?: string | null
          summary_vi?: string | null
          tagline_en?: string | null
          tagline_vi?: string | null
          title_en?: string
          title_vi?: string
          twitter_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          action_en: string | null
          action_vi: string | null
          created_at: string
          description_en: string | null
          description_vi: string | null
          display_order: number | null
          featured: boolean | null
          gallery_urls: string[] | null
          id: string
          image_url: string | null
          problem_en: string | null
          problem_vi: string | null
          project_date: string | null
          project_url: string | null
          published: boolean | null
          result_en: string | null
          result_vi: string | null
          slug: string
          tags: string[] | null
          title_en: string
          title_vi: string
          updated_at: string
        }
        Insert: {
          action_en?: string | null
          action_vi?: string | null
          created_at?: string
          description_en?: string | null
          description_vi?: string | null
          display_order?: number | null
          featured?: boolean | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          problem_en?: string | null
          problem_vi?: string | null
          project_date?: string | null
          project_url?: string | null
          published?: boolean | null
          result_en?: string | null
          result_vi?: string | null
          slug: string
          tags?: string[] | null
          title_en: string
          title_vi: string
          updated_at?: string
        }
        Update: {
          action_en?: string | null
          action_vi?: string | null
          created_at?: string
          description_en?: string | null
          description_vi?: string | null
          display_order?: number | null
          featured?: boolean | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          problem_en?: string | null
          problem_vi?: string | null
          project_date?: string | null
          project_url?: string | null
          published?: boolean | null
          result_en?: string | null
          result_vi?: string | null
          slug?: string
          tags?: string[] | null
          title_en?: string
          title_vi?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          value_en: string | null
          value_vi: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value_en?: string | null
          value_vi?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value_en?: string | null
          value_vi?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
