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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      calendar_events: {
        Row: {
          color: string
          created_at: string
          created_by: string | null
          end_date: string | null
          event_date: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          event_date: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          event_date?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          author_name: string | null
          category: string | null
          content: string | null
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string
          event_time: string | null
          id: string
          image: string | null
          location: string | null
          slug: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          image?: string | null
          location?: string | null
          slug: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          image?: string | null
          location?: string | null
          slug?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      member_files: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          folder_id: string | null
          id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          folder_id?: string | null
          id?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          folder_id?: string | null
          id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_files_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "member_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      member_folders: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "member_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      member_profiles: {
        Row: {
          can_upload: boolean
          created_at: string
          display_name: string
          email: string | null
          id: string
          recovery_email: string | null
          user_id: string
        }
        Insert: {
          can_upload?: boolean
          created_at?: string
          display_name: string
          email?: string | null
          id?: string
          recovery_email?: string | null
          user_id: string
        }
        Update: {
          can_upload?: boolean
          created_at?: string
          display_name?: string
          email?: string | null
          id?: string
          recovery_email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          features: string[]
          icon: string | null
          id: string
          image: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          features?: string[]
          icon?: string | null
          id?: string
          image?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          features?: string[]
          icon?: string | null
          id?: string
          image?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      screening_checks: {
        Row: {
          checked: boolean
          checked_at: string | null
          evaluator_id: string
          screening_item_id: string
        }
        Insert: {
          checked?: boolean
          checked_at?: string | null
          evaluator_id: string
          screening_item_id: string
        }
        Update: {
          checked?: boolean
          checked_at?: string | null
          evaluator_id?: string
          screening_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "screening_checks_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "screening_evaluators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "screening_checks_screening_item_id_fkey"
            columns: ["screening_item_id"]
            isOneToOne: false
            referencedRelation: "screening_items"
            referencedColumns: ["id"]
          },
        ]
      }
      screening_evaluators: {
        Row: {
          display_name: string
          display_order: number
          division: string
          id: string
          user_id: string | null
        }
        Insert: {
          display_name: string
          display_order?: number
          division: string
          id?: string
          user_id?: string | null
        }
        Update: {
          display_name?: string
          display_order?: number
          division?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      screening_items: {
        Row: {
          created_at: string
          created_by: string | null
          division: string
          due_at: string | null
          id: string
          link: string | null
          material: string
          notes: string | null
          sequence_no: number
          status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          division: string
          due_at?: string | null
          id?: string
          link?: string | null
          material: string
          notes?: string | null
          sequence_no: number
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          division?: string
          due_at?: string | null
          id?: string
          link?: string | null
          material?: string
          notes?: string | null
          sequence_no?: number
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      screening_notes: {
        Row: {
          author_name: string
          created_at: string
          id: string
          message: string
          screening_item_id: string
          user_id: string
        }
        Insert: {
          author_name?: string
          created_at?: string
          id?: string
          message: string
          screening_item_id: string
          user_id: string
        }
        Update: {
          author_name?: string
          created_at?: string
          id?: string
          message?: string
          screening_item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "screening_notes_screening_item_id_fkey"
            columns: ["screening_item_id"]
            isOneToOne: false
            referencedRelation: "screening_items"
            referencedColumns: ["id"]
          },
        ]
      }
      primary_administrator: {
        Row: {
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          recruitment_application_url: string | null
          recruitment_deadline: string | null
          recruitment_description: string
          recruitment_eyebrow: string
          recruitment_open: boolean
          recruitment_requirements: string[]
          recruitment_title: string
          updated_at: string
        }
        Insert: {
          id: string
          recruitment_application_url?: string | null
          recruitment_deadline?: string | null
          recruitment_description?: string
          recruitment_eyebrow?: string
          recruitment_open?: boolean
          recruitment_requirements?: string[]
          recruitment_title?: string
          updated_at?: string
        }
        Update: {
          id?: string
          recruitment_application_url?: string | null
          recruitment_deadline?: string | null
          recruitment_description?: string
          recruitment_eyebrow?: string
          recruitment_open?: boolean
          recruitment_requirements?: string[]
          recruitment_title?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string | null
          created_at: string
          display_order: number
          division: string | null
          id: string
          linkedin: string | null
          name: string
          photo: string | null
            role: string
            updated_at: string
            user_id: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_order?: number
          division?: string | null
          id?: string
          linkedin?: string | null
          name: string
          photo?: string | null
            role: string
            updated_at?: string
            user_id?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_order?: number
          division?: string | null
          id?: string
          linkedin?: string | null
          name?: string
          photo?: string | null
            role?: string
            updated_at?: string
            user_id?: string | null
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
      user_content_permissions: {
        Row: {
          created_at: string
          id: string
          permission: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission?: string
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
      has_content_permission: {
        Args: {
          _permission: string
          _user_id: string
        }
        Returns: boolean
      }
      is_primary_administrator: {
        Args: {
          _user_id: string
        }
        Returns: boolean
      }
      can_update_screening_check: {
        Args: {
          _evaluator_id: string
          _screening_item_id: string
        }
        Returns: boolean
      }
      can_create_screening_item: {
        Args: {
          _division: string
          _user_id: string
        }
        Returns: boolean
      }
      can_manage_screening_item: {
        Args: {
          _division: string
          _user_id: string
        }
        Returns: boolean
      }
      is_screening_executive: {
        Args: {
          _user_id: string
        }
        Returns: boolean
      }
      transfer_primary_administrator: {
        Args: {
          _target_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "member"
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
      app_role: ["admin", "member"],
    },
  },
} as const
