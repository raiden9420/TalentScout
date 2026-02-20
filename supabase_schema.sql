-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Candidates table
create table if not exists candidates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text,
  experience numeric,
  position text,
  location text,
  tech_stack text,
  status text default 'New',
  created_at timestamp with time zone default now()
);

-- Interviews table
create table if not exists interviews (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid references candidates(id) on delete cascade,
  current_step text not null default 'technical_questions',
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

-- Interview Messages table
create table if not exists interview_messages (
  id uuid primary key default uuid_generate_v4(),
  interview_id uuid references interviews(id) on delete cascade,
  role text not null, -- 'assistant' or 'user'
  content text not null,
  step text,
  created_at timestamp with time zone default now()
);

-- Interview Scores table
create table if not exists interview_scores (
  id uuid primary key default uuid_generate_v4(),
  interview_id uuid references interviews(id) on delete cascade,
  category text not null,
  score numeric,
  strengths text[],
  improvements text[],
  assessment text,
  created_at timestamp with time zone default now()
);

-- Resumes table
create table if not exists resumes (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid references candidates(id) on delete cascade,
  file_path text,
  content_text text,
  skills_found text[],
  score numeric,
  analysis_json jsonb,
  created_at timestamp with time zone default now()
);

-- Keywords table (for resume matching)
create table if not exists resume_keywords (
  id uuid primary key default uuid_generate_v4(),
  keyword text unique not null,
  category text,
  weight numeric default 1.0,
  created_at timestamp with time zone default now()
);

-- RLS Policies (Open availability for demo purposes)
alter table candidates enable row level security;
create policy "Public candidates" on candidates for all using (true);

alter table interviews enable row level security;
create policy "Public interviews" on interviews for all using (true);

alter table interview_messages enable row level security;
create policy "Public messages" on interview_messages for all using (true);

alter table interview_scores enable row level security;
create policy "Public scores" on interview_scores for all using (true);

alter table resumes enable row level security;
create policy "Public resumes" on resumes for all using (true);

alter table resume_keywords enable row level security;
create policy "Public keywords" on resume_keywords for all using (true);
