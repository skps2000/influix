-- ============================================
-- InfluiX Database Schema
-- Supabase PostgreSQL
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'MEMBER', 'VIEWER');
CREATE TYPE workspace_member_role AS ENUM ('OWNER', 'ADMIN', 'EDITOR', 'VIEWER');
CREATE TYPE content_source_type AS ENUM ('VIDEO', 'IMAGE', 'TEXT', 'AUDIO', 'MIXED');
CREATE TYPE content_platform AS ENUM ('YOUTUBE', 'TIKTOK', 'INSTAGRAM', 'TWITTER', 'LINKEDIN', 'OTHER');
CREATE TYPE content_status AS ENUM ('PENDING', 'ANALYZING', 'ANALYZED', 'FAILED');
CREATE TYPE insight_status AS ENUM ('GENERATING', 'COMPLETE', 'FAILED', 'STALE');
CREATE TYPE prompt_category AS ENUM ('CONTENT_ANALYSIS', 'HOOK_DETECTION', 'TONE_ANALYSIS', 'NARRATIVE_STRUCTURE', 'ENGAGEMENT_LOGIC', 'COMPARISON', 'CUSTOM');

-- ============================================
-- USERS
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'MEMBER',
    preferences JSONB NOT NULL DEFAULT '{"theme": "dark", "language": "en", "notifications": {"email": true, "inApp": true, "digest": "weekly"}}',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- REFRESH TOKENS
-- ============================================

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token VARCHAR(500) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- ============================================
-- WORKSPACES
-- ============================================

CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    settings JSONB NOT NULL DEFAULT '{"defaultContentVisibility": "private", "aiAnalysisEnabled": true, "retentionDays": 365}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX idx_workspaces_slug ON workspaces(slug);

-- ============================================
-- WORKSPACE MEMBERS
-- ============================================

CREATE TABLE workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role workspace_member_role NOT NULL DEFAULT 'VIEWER',
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);

-- ============================================
-- AI PROMPTS
-- ============================================

CREATE TABLE ai_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    version INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_default BOOLEAN NOT NULL DEFAULT false,
    category prompt_category NOT NULL,
    template JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_prompts_category ON ai_prompts(category);
CREATE INDEX idx_ai_prompts_is_active ON ai_prompts(is_active);
CREATE INDEX idx_ai_prompts_slug ON ai_prompts(slug);

-- ============================================
-- CONTENT
-- ============================================

CREATE TABLE content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    source_url TEXT,
    source_type content_source_type NOT NULL,
    platform content_platform NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    transcript TEXT,
    status content_status NOT NULL DEFAULT 'PENDING',
    last_analyzed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_workspace_id ON content(workspace_id);
CREATE INDEX idx_content_created_by ON content(created_by);
CREATE INDEX idx_content_platform ON content(platform);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_created_at ON content(created_at DESC);

-- ============================================
-- INSIGHTS
-- ============================================

CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES ai_prompts(id),
    prompt_version INT NOT NULL,
    analysis JSONB NOT NULL,
    confidence FLOAT NOT NULL DEFAULT 0,
    status insight_status NOT NULL DEFAULT 'GENERATING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_insights_content_id ON insights(content_id);
CREATE INDEX idx_insights_workspace_id ON insights(workspace_id);
CREATE INDEX idx_insights_prompt_id ON insights(prompt_id);
CREATE INDEX idx_insights_status ON insights(status);
CREATE INDEX idx_insights_created_at ON insights(created_at DESC);

-- ============================================
-- NOTES
-- ============================================

CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    content_id UUID REFERENCES content(id) ON DELETE SET NULL,
    insight_id UUID REFERENCES insights(id) ON DELETE SET NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_workspace_id ON notes(workspace_id);
CREATE INDEX idx_notes_created_by ON notes(created_by);
CREATE INDEX idx_notes_is_archived ON notes(is_archived);
CREATE INDEX idx_notes_content_id ON notes(content_id);
CREATE INDEX idx_notes_insight_id ON notes(insight_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workspace_members_updated_at BEFORE UPDATE ON workspace_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_prompts_updated_at BEFORE UPDATE ON ai_prompts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insights_updated_at BEFORE UPDATE ON insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED: Default AI Prompts
-- ============================================

INSERT INTO ai_prompts (id, name, slug, description, version, is_active, is_default, category, template) VALUES
(
    uuid_generate_v4(),
    'Content Analysis',
    'content-analysis-v1',
    'Primary prompt for analyzing any content - hooks, tone, patterns, and reuse strategies',
    1,
    true,
    true,
    'CONTENT_ANALYSIS',
    '{
        "systemIntent": "You are an expert content analyst specializing in understanding why content resonates with audiences. Your role is to analyze content and provide actionable insights that help creators understand: Why content works, What patterns are being used, How to adapt these techniques. You always respond with structured JSON. You focus on the \"why\" not just the \"what\". Be insightful, not obvious. Provide analysis that makes the user feel smarter.",
        "analysisInstruction": "Analyze the following content thoroughly. Focus on: 1. The hook/opening - what makes it attention-grabbing 2. The tone and how it maintains engagement 3. The narrative structure and flow 4. Specific patterns that can be reused 5. Why this content is effective (be specific, not generic). Provide your analysis in the exact JSON format specified. Be concise but insightful.",
        "outputSchema": {
            "type": "object",
            "properties": {
                "summary": {"type": "string"},
                "whyItWorks": {"type": "array", "items": {"type": "string"}},
                "patterns": {"type": "array"},
                "reuseStrategy": {"type": "string"},
                "hookAnalysis": {"type": "object"},
                "toneAnalysis": {"type": "object"},
                "narrativeStructure": {"type": "object"},
                "engagementLogic": {"type": "object"}
            },
            "required": ["summary", "whyItWorks", "patterns", "reuseStrategy"]
        }
    }'::jsonb
),
(
    uuid_generate_v4(),
    'Hook Detection',
    'hook-detection-v1',
    'Specialized prompt for analyzing hooks and opening lines',
    1,
    true,
    false,
    'HOOK_DETECTION',
    '{
        "systemIntent": "You are an expert at analyzing content hooks and opening lines. You understand what makes people stop scrolling and pay attention. You provide specific, actionable feedback on hooks.",
        "analysisInstruction": "Analyze the opening of this content (first 10 seconds or first paragraph). Identify: 1. The type of hook being used 2. What makes it effective or ineffective 3. The specific elements that grab attention 4. How to improve it. Be specific and practical. Avoid generic advice.",
        "outputSchema": {
            "type": "object",
            "properties": {
                "hookType": {"type": "string"},
                "strength": {"type": "string"},
                "elements": {"type": "array", "items": {"type": "string"}},
                "whyItWorks": {"type": "string"},
                "improvement": {"type": "string"},
                "examples": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["hookType", "strength", "elements", "whyItWorks"]
        }
    }'::jsonb
),
(
    uuid_generate_v4(),
    'Content Comparison',
    'comparison-v1',
    'For comparing two pieces of content',
    1,
    true,
    false,
    'COMPARISON',
    '{
        "systemIntent": "You are an expert at comparing content performance and identifying what makes one piece more effective than another. You focus on actionable differences, not surface-level observations.",
        "analysisInstruction": "Compare the two pieces of content provided. Analyze: 1. What Content A does better than Content B 2. What Content B does better than Content A 3. Key patterns that differentiate them 4. What can be learned from each. Provide specific, actionable insights.",
        "outputSchema": {
            "type": "object",
            "properties": {
                "winner": {"type": "string"},
                "contentAStrengths": {"type": "array", "items": {"type": "string"}},
                "contentBStrengths": {"type": "array", "items": {"type": "string"}},
                "keyDifferences": {"type": "array"},
                "lessonsLearned": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["winner", "contentAStrengths", "contentBStrengths", "keyDifferences", "lessonsLearned"]
        }
    }'::jsonb
);
