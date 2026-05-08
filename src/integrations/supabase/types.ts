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
      about_section: {
        Row: {
          created_at: string | null
          description: string
          headline: string
          id: string
          image_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          headline?: string
          id?: string
          image_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          headline?: string
          id?: string
          image_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      activities: {
        Row: {
          category: string | null
          content: string | null
          created_at: string | null
          date: string | null
          description: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          link: string | null
          location: string | null
          published: boolean | null
          sort_order: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          link?: string | null
          location?: string | null
          published?: boolean | null
          sort_order?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          link?: string | null
          location?: string | null
          published?: boolean | null
          sort_order?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      blogs: {
        Row: {
          category_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          published: boolean | null
          slug: string | null
          sort_order: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          slug?: string | null
          sort_order?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          slug?: string | null
          sort_order?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blogs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          selected_color: string | null
          selected_size: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number
          selected_color?: string | null
          selected_size?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          selected_color?: string | null
          selected_size?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_training: {
        Row: {
          active: boolean | null
          answer: string
          created_at: string | null
          id: string
          keywords: string[]
          language: string
          priority: number | null
          question: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          answer: string
          created_at?: string | null
          id?: string
          keywords: string[]
          language?: string
          priority?: number | null
          question: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          answer?: string
          created_at?: string | null
          id?: string
          keywords?: string[]
          language?: string
          priority?: number | null
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          seen: boolean | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          seen?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          seen?: boolean | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string | null
          email: string
          id: string
          location: string | null
          map_embed_url: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          location?: string | null
          map_embed_url?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          location?: string | null
          map_embed_url?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      custom_sections: {
        Row: {
          background_style: string | null
          content: string | null
          created_at: string | null
          id: string
          image_url: string | null
          page: string
          published: boolean | null
          section_type: string
          show_title: boolean | null
          sort_order: number | null
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          background_style?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          page?: string
          published?: boolean | null
          section_type?: string
          show_title?: boolean | null
          sort_order?: number | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          background_style?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          page?: string
          published?: boolean | null
          section_type?: string
          show_title?: boolean | null
          sort_order?: number | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      education: {
        Row: {
          achievements: string[] | null
          created_at: string | null
          degree: string
          description: string | null
          field: string | null
          id: string
          institution: string
          sort_order: number | null
          updated_at: string | null
          year: string
        }
        Insert: {
          achievements?: string[] | null
          created_at?: string | null
          degree: string
          description?: string | null
          field?: string | null
          id?: string
          institution: string
          sort_order?: number | null
          updated_at?: string | null
          year: string
        }
        Update: {
          achievements?: string[] | null
          created_at?: string | null
          degree?: string
          description?: string | null
          field?: string | null
          id?: string
          institution?: string
          sort_order?: number | null
          updated_at?: string | null
          year?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          achievements: string[] | null
          company: string
          created_at: string | null
          description: string | null
          id: string
          location: string | null
          sort_order: number | null
          title: string
          updated_at: string | null
          year: string
        }
        Insert: {
          achievements?: string[] | null
          company: string
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          sort_order?: number | null
          title: string
          updated_at?: string | null
          year: string
        }
        Update: {
          achievements?: string[] | null
          company?: string
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          sort_order?: number | null
          title?: string
          updated_at?: string | null
          year?: string
        }
        Relationships: []
      }
      footer_links: {
        Row: {
          created_at: string | null
          id: string
          label: string
          section: string
          sort_order: number | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          label: string
          section: string
          sort_order?: number | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          label?: string
          section?: string
          sort_order?: number | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      hero_section: {
        Row: {
          background_image_url: string | null
          created_at: string | null
          id: string
          name: string
          profile_image_url: string | null
          quote: string
          title: string
          updated_at: string | null
        }
        Insert: {
          background_image_url?: string | null
          created_at?: string | null
          id?: string
          name?: string
          profile_image_url?: string | null
          quote?: string
          title?: string
          updated_at?: string | null
        }
        Update: {
          background_image_url?: string | null
          created_at?: string | null
          id?: string
          name?: string
          profile_image_url?: string | null
          quote?: string
          title?: string
          updated_at?: string | null
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
          url?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          product_id: string
          product_name: string
          product_price: number
          quantity: number
          selected_color: string | null
          selected_size: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          product_id: string
          product_name: string
          product_price: number
          quantity: number
          selected_color?: string | null
          selected_size?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          product_price?: number
          quantity?: number
          selected_color?: string | null
          selected_size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_address: string
          customer_message: string | null
          customer_name: string
          customer_phone: string
          delivery_time: string | null
          id: string
          status: string
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          customer_address: string
          customer_message?: string | null
          customer_name: string
          customer_phone: string
          delivery_time?: string | null
          id?: string
          status?: string
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          customer_address?: string
          customer_message?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_time?: string | null
          id?: string
          status?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          brand: string | null
          category_id: string | null
          colors: string[] | null
          created_at: string | null
          description: string | null
          discount_percent: number | null
          featured: boolean | null
          full_description: string | null
          id: string
          image_url: string | null
          images: string[] | null
          name: string
          price: number
          product_type: string
          published: boolean | null
          sizes: string[] | null
          slug: string | null
          sort_order: number | null
          stock_quantity: number
          updated_at: string | null
        }
        Insert: {
          brand?: string | null
          category_id?: string | null
          colors?: string[] | null
          created_at?: string | null
          description?: string | null
          discount_percent?: number | null
          featured?: boolean | null
          full_description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          name: string
          price: number
          product_type?: string
          published?: boolean | null
          sizes?: string[] | null
          slug?: string | null
          sort_order?: number | null
          stock_quantity?: number
          updated_at?: string | null
        }
        Update: {
          brand?: string | null
          category_id?: string | null
          colors?: string[] | null
          created_at?: string | null
          description?: string | null
          discount_percent?: number | null
          featured?: boolean | null
          full_description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          name?: string
          price?: number
          product_type?: string
          published?: boolean | null
          sizes?: string[] | null
          slug?: string | null
          sort_order?: number | null
          stock_quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          category: string
          challenge: string | null
          created_at: string | null
          description: string
          featured: boolean | null
          full_description: string | null
          id: string
          image_url: string | null
          link: string | null
          metrics: Json | null
          slug: string | null
          solution: string | null
          sort_order: number | null
          technologies: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          challenge?: string | null
          created_at?: string | null
          description: string
          featured?: boolean | null
          full_description?: string | null
          id?: string
          image_url?: string | null
          link?: string | null
          metrics?: Json | null
          slug?: string | null
          solution?: string | null
          sort_order?: number | null
          technologies?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          challenge?: string | null
          created_at?: string | null
          description?: string
          featured?: boolean | null
          full_description?: string | null
          id?: string
          image_url?: string | null
          link?: string | null
          metrics?: Json | null
          slug?: string | null
          solution?: string | null
          sort_order?: number | null
          technologies?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          created_at: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string | null
          id: string
          provider: string
          sort_order: number | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          provider: string
          sort_order?: number | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          provider?: string
          sort_order?: number | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          name: string
          published: boolean | null
          quote_en: string
          quote_vi: string
          role_en: string | null
          role_vi: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name: string
          published?: boolean | null
          quote_en?: string
          quote_vi?: string
          role_en?: string | null
          role_vi?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name?: string
          published?: boolean | null
          quote_en?: string
          quote_vi?: string
          role_en?: string | null
          role_vi?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vouchers: {
        Row: {
          active: boolean | null
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          max_discount: number | null
          min_order_amount: number | null
          product_types: string[] | null
          updated_at: string
          usage_limit: number | null
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value: number
          id?: string
          max_discount?: number | null
          min_order_amount?: number | null
          product_types?: string[] | null
          updated_at?: string
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          max_discount?: number | null
          min_order_amount?: number | null
          product_types?: string[] | null
          updated_at?: string
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
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
      validate_voucher_by_code: {
        Args: { _code: string }
        Returns: {
          active: boolean
          code: string
          created_at: string
          description: string
          discount_type: string
          discount_value: number
          id: string
          max_discount: number
          min_order_amount: number
          product_types: string[]
          updated_at: string
          usage_limit: number
          used_count: number
          valid_from: string
          valid_until: string
        }[]
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
