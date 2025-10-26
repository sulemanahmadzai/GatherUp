-- Database Performance Optimization Migration
-- This migration adds indexes to improve query performance

-- Service Records Indexes
CREATE INDEX IF NOT EXISTS idx_service_records_team_id_created_at 
ON service_records(team_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_service_records_vehicle_reg 
ON service_records(vehicle_reg);

CREATE INDEX IF NOT EXISTS idx_service_records_service_type 
ON service_records(service_type);

CREATE INDEX IF NOT EXISTS idx_service_records_status 
ON service_records(status);

-- Customers Indexes
CREATE INDEX IF NOT EXISTS idx_customers_team_id_created_at 
ON customers(team_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_customers_registration_number 
ON customers(registration_number);

CREATE INDEX IF NOT EXISTS idx_customers_name 
ON customers(name);

CREATE INDEX IF NOT EXISTS idx_customers_mobile_number 
ON customers(mobile_number);

-- Staff Indexes
CREATE INDEX IF NOT EXISTS idx_staff_team_id_created_at 
ON staff(team_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_staff_status 
ON staff(status);

CREATE INDEX IF NOT EXISTS idx_staff_role 
ON staff(role);

CREATE INDEX IF NOT EXISTS idx_staff_full_name 
ON staff(full_name);

-- Bookings Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_created_at 
ON bookings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_status 
ON bookings(status);

CREATE INDEX IF NOT EXISTS idx_bookings_car_reg 
ON bookings(car_reg);

-- Team Members Indexes
CREATE INDEX IF NOT EXISTS idx_team_members_user_id 
ON team_members(user_id);

CREATE INDEX IF NOT EXISTS idx_team_members_team_id 
ON team_members(team_id);

