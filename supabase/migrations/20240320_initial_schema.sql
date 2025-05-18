-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create habits table
create table habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  icon text not null,
  color text not null,
  target integer not null,
  frequency text not null check (frequency in ('daily', 'weekly', 'custom')),
  category text not null check (category in ('health', 'productivity', 'learning', 'mindfulness', 'finance', 'social', 'custom')),
  custom_days integer[],
  progress integer default 0,
  streak integer default 0,
  reminder_time time,
  reminder_enabled boolean default false,
  count_type text not null check (count_type in ('completion', 'count')),
  count_unit text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create habit_history table
create table habit_history (
  id uuid default uuid_generate_v4() primary key,
  habit_id uuid references habits not null,
  date date not null,
  count integer not null,
  completed boolean not null,
  time_of_completion timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index habits_user_id_idx on habits(user_id);
create index habit_history_habit_id_idx on habit_history(habit_id);
create index habit_history_date_idx on habit_history(date);

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger update_habits_updated_at
  before update on habits
  for each row
  execute function update_updated_at_column();

-- Set up Row Level Security (RLS)
alter table habits enable row level security;
alter table habit_history enable row level security;

-- Create policies for habits table
create policy "Users can view their own habits"
  on habits for select
  using (auth.uid() = user_id);

create policy "Users can insert their own habits"
  on habits for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own habits"
  on habits for update
  using (auth.uid() = user_id);

create policy "Users can delete their own habits"
  on habits for delete
  using (auth.uid() = user_id);

-- Create policies for habit_history table
create policy "Users can view their own habit history"
  on habit_history for select
  using (exists (
    select 1 from habits
    where habits.id = habit_history.habit_id
    and habits.user_id = auth.uid()
  ));

create policy "Users can insert their own habit history"
  on habit_history for insert
  with check (exists (
    select 1 from habits
    where habits.id = habit_history.habit_id
    and habits.user_id = auth.uid()
  ));

create policy "Users can update their own habit history"
  on habit_history for update
  using (exists (
    select 1 from habits
    where habits.id = habit_history.habit_id
    and habits.user_id = auth.uid()
  ));

create policy "Users can delete their own habit history"
  on habit_history for delete
  using (exists (
    select 1 from habits
    where habits.id = habit_history.habit_id
    and habits.user_id = auth.uid()
  )); 