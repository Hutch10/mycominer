export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  mycominer: {
    Tables: {
      workflows: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          description: string | null;
          steps: Json;
          enabled: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          description?: string | null;
          steps?: Json;
          enabled?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          description?: string | null;
          steps?: Json;
          enabled?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      workflow_runs: {
        Row: {
          id: string;
          org_id: string;
          workflow_id: string;
          status: string;
          input: Json;
          scheduled_at: string;
          started_at: string | null;
          completed_at: string | null;
          cancelled_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          workflow_id: string;
          status?: string;
          input?: Json;
          scheduled_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          workflow_id?: string;
          status?: string;
          input?: Json;
          scheduled_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      orchestration_log: {
        Row: {
          id: string;
          event_type: string;
          workflow_id: string | null;
          run_id: string | null;
          actor_id: string;
          request_id: string;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          workflow_id?: string | null;
          run_id?: string | null;
          actor_id: string;
          request_id: string;
          payload?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_type?: string;
          workflow_id?: string | null;
          run_id?: string | null;
          actor_id?: string;
          request_id?: string;
          payload?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      marketplace_revenue: {
        Row: {
          id: string;
          item_id: string;
          org_id: string;
          developer_id: string | null;
          gross: number;
          fees: number;
          taxes: number;
          net: number;
          period: string;
          idempotency_key: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          org_id: string;
          developer_id?: string | null;
          gross: number;
          fees?: number;
          taxes?: number;
          net: number;
          period: string;
          idempotency_key?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          org_id?: string;
          developer_id?: string | null;
          gross?: number;
          fees?: number;
          taxes?: number;
          net?: number;
          period?: string;
          idempotency_key?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          org_id: string;
          amount: number;
          status: string;
          due_date: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          amount: number;
          status?: string;
          due_date?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          amount?: number;
          status?: string;
          due_date?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      reward_tokens: {
        Row: {
          id: string;
          org_id: string;
          token_type: string;
          amount: number;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          token_type: string;
          amount?: number;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          token_type?: string;
          amount?: number;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      license_tokens: {
        Row: {
          id: string;
          org_id: string;
          license_key: string;
          tier: string | null;
          expires_at: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          license_key: string;
          tier?: string | null;
          expires_at?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          license_key?: string;
          tier?: string | null;
          expires_at?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_workflow_with_log: {
        Args: {
          p_org_id: string;
          p_name: string;
          p_description: string | null;
          p_steps: Json;
          p_enabled: boolean;
          p_workflow_id: string | null;
          p_actor_id: string;
          p_request_id: string;
          p_payload: Json;
        };
        Returns: Json;
      };
      schedule_run_with_log: {
        Args: {
          p_org_id: string;
          p_workflow_id: string;
          p_input: Json;
          p_run_id: string | null;
          p_actor_id: string;
          p_request_id: string;
        };
        Returns: Json;
      };
      cancel_run_with_log: {
        Args: {
          p_org_id: string;
          p_run_id: string;
          p_actor_id: string;
          p_request_id: string;
        };
        Returns: Json;
      };
      checkout_marketplace_with_log: {
        Args: {
          p_org_id: string;
          p_item_id: string;
          p_developer_id: string | null;
          p_gross: number;
          p_fees: number;
          p_taxes: number;
          p_net: number;
          p_period: string;
          p_idempotency_key: string | null;
          p_actor_id: string;
          p_request_id: string;
          p_payload: Json;
        };
        Returns: Json;
      };
      begin_marketplace_checkout: {
        Args: {
          p_org_id: string;
          p_item_id: string;
          p_gross: number;
          p_fees: number;
          p_taxes: number;
          p_net: number;
          p_idempotency_key: string;
          p_actor_id: string;
          p_request_id: string;
        };
        Returns: Json;
      };
      record_marketplace_charge: {
        Args: {
          p_org_id: string;
          p_session_id: string;
          p_charge_id: string;
          p_actor_id: string;
          p_request_id: string;
        };
        Returns: Json;
      };
      complete_marketplace_checkout: {
        Args: {
          p_org_id: string;
          p_session_id: string;
          p_developer_id: string | null;
          p_period: string;
          p_actor_id: string;
          p_request_id: string;
          p_payload: Json;
        };
        Returns: Json;
      };
      mark_checkout_needs_reconciliation: {
        Args: {
          p_org_id: string;
          p_session_id: string;
          p_failure_reason: string;
          p_actor_id: string;
          p_request_id: string;
        };
        Returns: Json;
      };
      get_token_purchase_replay: {
        Args: {
          p_org_id: string;
          p_idempotency_key: string;
        };
        Returns: Json;
      };
      save_token_purchase_replay: {
        Args: {
          p_org_id: string;
          p_idempotency_key: string;
          p_response_json: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
