export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      banners: {
        Row: {
          cta_href: string | null;
          cta_label: string | null;
          id: string;
          image_url: string;
          is_active: boolean;
          sort_order: number;
          subtitle: string | null;
          theme: string;
          title: string;
        };
        Insert: {
          cta_href?: string | null;
          cta_label?: string | null;
          id?: string;
          image_url: string;
          is_active?: boolean;
          sort_order?: number;
          subtitle?: string | null;
          theme?: string;
          title: string;
        };
        Update: {
          cta_href?: string | null;
          cta_label?: string | null;
          id?: string;
          image_url?: string;
          is_active?: boolean;
          sort_order?: number;
          subtitle?: string | null;
          theme?: string;
          title?: string;
        };
        Relationships: [];
      };
      brands: {
        Row: {
          id: string;
          logo_url: string | null;
          name: string;
          slug: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          logo_url?: string | null;
          name: string;
          slug: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          logo_url?: string | null;
          name?: string;
          slug?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          description: string | null;
          icon: string | null;
          id: string;
          image_url: string | null;
          is_active: boolean;
          name: string;
          parent_id: string | null;
          slug: string;
          sort_order: number;
        };
        Insert: {
          description?: string | null;
          icon?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name: string;
          parent_id?: string | null;
          slug: string;
          sort_order?: number;
        };
        Update: {
          description?: string | null;
          icon?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name?: string;
          parent_id?: string | null;
          slug?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      code_counters: {
        Row: {
          last_value: number;
          prefix: string;
          year: number;
        };
        Insert: {
          last_value?: number;
          prefix: string;
          year: number;
        };
        Update: {
          last_value?: number;
          prefix?: string;
          year?: number;
        };
        Relationships: [];
      };
      product_history: {
        Row: {
          action: string;
          changed_at: string;
          entity: string;
          entity_id: string;
          id: number;
          new_data: Json | null;
          old_data: Json | null;
          product_id: string;
        };
        Insert: {
          action: string;
          changed_at?: string;
          entity: string;
          entity_id: string;
          id?: never;
          new_data?: Json | null;
          old_data?: Json | null;
          product_id: string;
        };
        Update: {
          action?: string;
          changed_at?: string;
          entity?: string;
          entity_id?: string;
          id?: never;
          new_data?: Json | null;
          old_data?: Json | null;
          product_id?: string;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          alt: string | null;
          id: string;
          product_id: string;
          sort_order: number;
          url: string;
          variant_id: string | null;
        };
        Insert: {
          alt?: string | null;
          id?: string;
          product_id: string;
          sort_order?: number;
          url: string;
          variant_id?: string | null;
        };
        Update: {
          alt?: string | null;
          id?: string;
          product_id?: string;
          sort_order?: number;
          url?: string;
          variant_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "v_catalog_products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_images_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_images_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "v_catalog_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variants: {
        Row: {
          battery_health: number | null;
          capacity: string | null;
          color: string | null;
          color_hex: string | null;
          compare_at_price: number | null;
          created_at: string;
          id: string;
          is_active: boolean;
          min_wholesale_qty: number;
          price_retail: number;
          price_wholesale: number | null;
          product_id: string;
          sku: string | null;
          sort_order: number;
          stock: number;
          unlock_type: Database["public"]["Enums"]["unlock_type"] | null;
          updated_at: string;
        };
        Insert: {
          battery_health?: number | null;
          capacity?: string | null;
          color?: string | null;
          color_hex?: string | null;
          compare_at_price?: number | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          min_wholesale_qty?: number;
          price_retail: number;
          price_wholesale?: number | null;
          product_id: string;
          sku?: string | null;
          sort_order?: number;
          stock?: number;
          unlock_type?: Database["public"]["Enums"]["unlock_type"] | null;
          updated_at?: string;
        };
        Update: {
          battery_health?: number | null;
          capacity?: string | null;
          color?: string | null;
          color_hex?: string | null;
          compare_at_price?: number | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          min_wholesale_qty?: number;
          price_retail?: number;
          price_wholesale?: number | null;
          product_id?: string;
          sku?: string | null;
          sort_order?: number;
          stock?: number;
          unlock_type?: Database["public"]["Enums"]["unlock_type"] | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "v_catalog_products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          brand_id: string | null;
          category_id: string;
          condition: Database["public"]["Enums"]["product_condition"];
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          is_featured: boolean;
          name: string;
          short_description: string | null;
          slug: string;
          sort_order: number;
          specs: NonNullable<Json>;
          updated_at: string;
          warranty_note: string | null;
        };
        Insert: {
          brand_id?: string | null;
          category_id: string;
          condition?: Database["public"]["Enums"]["product_condition"];
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          is_featured?: boolean;
          name: string;
          short_description?: string | null;
          slug: string;
          sort_order?: number;
          specs?: NonNullable<Json>;
          updated_at?: string;
          warranty_note?: string | null;
        };
        Update: {
          brand_id?: string | null;
          category_id?: string;
          condition?: Database["public"]["Enums"]["product_condition"];
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          is_featured?: boolean;
          name?: string;
          short_description?: string | null;
          slug?: string;
          sort_order?: number;
          specs?: NonNullable<Json>;
          updated_at?: string;
          warranty_note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey";
            columns: ["brand_id"];
            isOneToOne: false;
            referencedRelation: "brands";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          business_name: string | null;
          created_at: string;
          email: string | null;
          estimated_volume: string | null;
          full_name: string | null;
          id: string;
          phone: string | null;
          rnc: string | null;
          role: Database["public"]["Enums"]["user_role"];
          wholesale_approved: boolean;
          wholesale_reviewed_at: string | null;
        };
        Insert: {
          business_name?: string | null;
          created_at?: string;
          email?: string | null;
          estimated_volume?: string | null;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          rnc?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          wholesale_approved?: boolean;
          wholesale_reviewed_at?: string | null;
        };
        Update: {
          business_name?: string | null;
          created_at?: string;
          email?: string | null;
          estimated_volume?: string | null;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          rnc?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          wholesale_approved?: boolean;
          wholesale_reviewed_at?: string | null;
        };
        Relationships: [];
      };
      quote_items: {
        Row: {
          id: string;
          line_total: number;
          product_name: string;
          quantity: number;
          quote_id: string;
          unit_price: number;
          variant_id: string | null;
          variant_label: string | null;
        };
        Insert: {
          id?: string;
          line_total: number;
          product_name: string;
          quantity: number;
          quote_id: string;
          unit_price: number;
          variant_id?: string | null;
          variant_label?: string | null;
        };
        Update: {
          id?: string;
          line_total?: number;
          product_name?: string;
          quantity?: number;
          quote_id?: string;
          unit_price?: number;
          variant_id?: string | null;
          variant_label?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey";
            columns: ["quote_id"];
            isOneToOne: false;
            referencedRelation: "quotes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quote_items_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quote_items_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "v_catalog_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      quotes: {
        Row: {
          business_name: string | null;
          channel: Database["public"]["Enums"]["quote_channel"];
          code: string;
          created_at: string;
          customer_email: string | null;
          customer_name: string;
          customer_phone: string;
          id: string;
          note: string | null;
          status: Database["public"]["Enums"]["quote_status"];
          subtotal: number;
          tier: Database["public"]["Enums"]["price_tier"];
          user_id: string | null;
        };
        Insert: {
          business_name?: string | null;
          channel: Database["public"]["Enums"]["quote_channel"];
          code: string;
          created_at?: string;
          customer_email?: string | null;
          customer_name: string;
          customer_phone: string;
          id?: string;
          note?: string | null;
          status?: Database["public"]["Enums"]["quote_status"];
          subtotal: number;
          tier?: Database["public"]["Enums"]["price_tier"];
          user_id?: string | null;
        };
        Update: {
          business_name?: string | null;
          channel?: Database["public"]["Enums"]["quote_channel"];
          code?: string;
          created_at?: string;
          customer_email?: string | null;
          customer_name?: string;
          customer_phone?: string;
          id?: string;
          note?: string | null;
          status?: Database["public"]["Enums"]["quote_status"];
          subtotal?: number;
          tier?: Database["public"]["Enums"]["price_tier"];
          user_id?: string | null;
        };
        Relationships: [];
      };
      repair_requests: {
        Row: {
          code: string;
          created_at: string;
          customer_email: string | null;
          customer_name: string;
          customer_phone: string;
          device: string;
          id: string;
          issue_description: string;
          service_id: string | null;
          status: Database["public"]["Enums"]["quote_status"];
        };
        Insert: {
          code: string;
          created_at?: string;
          customer_email?: string | null;
          customer_name: string;
          customer_phone: string;
          device: string;
          id?: string;
          issue_description: string;
          service_id?: string | null;
          status?: Database["public"]["Enums"]["quote_status"];
        };
        Update: {
          code?: string;
          created_at?: string;
          customer_email?: string | null;
          customer_name?: string;
          customer_phone?: string;
          device?: string;
          id?: string;
          issue_description?: string;
          service_id?: string | null;
          status?: Database["public"]["Enums"]["quote_status"];
        };
        Relationships: [
          {
            foreignKeyName: "repair_requests_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      services: {
        Row: {
          description: string | null;
          device_types: string[];
          icon: string | null;
          id: string;
          is_active: boolean;
          name: string;
          price_from: number | null;
          slug: string;
          sort_order: number;
          turnaround: string | null;
        };
        Insert: {
          description?: string | null;
          device_types?: string[];
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          price_from?: number | null;
          slug: string;
          sort_order?: number;
          turnaround?: string | null;
        };
        Update: {
          description?: string | null;
          device_types?: string[];
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          price_from?: number | null;
          slug?: string;
          sort_order?: number;
          turnaround?: string | null;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          key: string;
          updated_at: string;
          value: NonNullable<Json>;
        };
        Insert: {
          key: string;
          updated_at?: string;
          value: NonNullable<Json>;
        };
        Update: {
          key?: string;
          updated_at?: string;
          value?: NonNullable<Json>;
        };
        Relationships: [];
      };
    };
    Views: {
      v_catalog_images: {
        Row: {
          alt: string | null;
          id: string | null;
          product_id: string | null;
          sort_order: number | null;
          url: string | null;
          variant_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "v_catalog_products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_images_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_images_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "v_catalog_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      v_catalog_products: {
        Row: {
          brand_id: string | null;
          category_id: string | null;
          condition: Database["public"]["Enums"]["product_condition"] | null;
          created_at: string | null;
          description: string | null;
          id: string | null;
          is_featured: boolean | null;
          name: string | null;
          short_description: string | null;
          slug: string | null;
          sort_order: number | null;
          specs: Json | null;
          updated_at: string | null;
          warranty_note: string | null;
        };
        Insert: {
          brand_id?: string | null;
          category_id?: string | null;
          condition?: Database["public"]["Enums"]["product_condition"] | null;
          created_at?: string | null;
          description?: string | null;
          id?: string | null;
          is_featured?: boolean | null;
          name?: string | null;
          short_description?: string | null;
          slug?: string | null;
          sort_order?: number | null;
          specs?: Json | null;
          updated_at?: string | null;
          warranty_note?: string | null;
        };
        Update: {
          brand_id?: string | null;
          category_id?: string | null;
          condition?: Database["public"]["Enums"]["product_condition"] | null;
          created_at?: string | null;
          description?: string | null;
          id?: string | null;
          is_featured?: boolean | null;
          name?: string | null;
          short_description?: string | null;
          slug?: string | null;
          sort_order?: number | null;
          specs?: Json | null;
          updated_at?: string | null;
          warranty_note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey";
            columns: ["brand_id"];
            isOneToOne: false;
            referencedRelation: "brands";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      v_catalog_variants: {
        Row: {
          battery_health: number | null;
          capacity: string | null;
          color: string | null;
          color_hex: string | null;
          compare_at_price: number | null;
          id: string | null;
          is_active: boolean | null;
          price_retail: number | null;
          product_id: string | null;
          sku: string | null;
          sort_order: number | null;
          stock: number | null;
          unlock_type: Database["public"]["Enums"]["unlock_type"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "v_catalog_products";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      next_request_code: { Args: { p_prefix: string }; Returns: string };
    };
    Enums: {
      price_tier: "retail" | "wholesale";
      product_condition: "nuevo" | "open_box" | "usado" | "reacondicionado";
      quote_channel: "whatsapp" | "email" | "both";
      quote_status: "nueva" | "contactada" | "cotizada" | "cerrada" | "cancelada";
      unlock_type: "factory" | "artista";
      user_role: "customer" | "wholesale" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      price_tier: ["retail", "wholesale"],
      product_condition: ["nuevo", "open_box", "usado", "reacondicionado"],
      quote_channel: ["whatsapp", "email", "both"],
      quote_status: ["nueva", "contactada", "cotizada", "cerrada", "cancelada"],
      unlock_type: ["factory", "artista"],
      user_role: ["customer", "wholesale", "admin"],
    },
  },
} as const;
