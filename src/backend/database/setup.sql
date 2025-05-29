
-- Create the tracker database if it doesn't exist
CREATE DATABASE IF NOT EXISTS tracker;
USE tracker;

-- Create the cases table
CREATE TABLE IF NOT EXISTS cases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  leadCkt VARCHAR(255) NOT NULL,
  ipAddress VARCHAR(45),
  connectivity ENUM('Stable', 'Unstable', 'Unknown') DEFAULT 'Unknown',
  assignedDate DATETIME NOT NULL,
  dueDate DATETIME NOT NULL,
  caseRemarks TEXT,
  status ENUM('Pending', 'Overdue', 'Completed', 'OnHold') DEFAULT 'Pending',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  timeSpent INT DEFAULT 0
);

-- Create the LeadDemoData table (if you don't have it already)
CREATE TABLE IF NOT EXISTS LeadDemoData (
  sr_no VARCHAR(50) PRIMARY KEY,
  ckt VARCHAR(255) NOT NULL,
  cust_name VARCHAR(255),
  address TEXT,
  email_id VARCHAR(255),
  contact_name VARCHAR(255),
  comm_date DATE,
  pop_name VARCHAR(255),
  nas_ip_1 VARCHAR(45),
  switch_ip_1 VARCHAR(45),
  port_no_1 VARCHAR(50),
  vlan_id_1 VARCHAR(50),
  primary_pop VARCHAR(255),
  pop_name_2 VARCHAR(255),
  nas_ip_2 VARCHAR(45),
  switch_ip_2 VARCHAR(45),
  port_no_2 VARCHAR(50),
  vlan_id_2 VARCHAR(50),
  backup VARCHAR(255),
  usable_ip_address VARCHAR(45),
  subnet_mask VARCHAR(45),
  gateway VARCHAR(45),
  bandwidth VARCHAR(100),
  sales_person VARCHAR(255),
  testing_fe VARCHAR(255),
  device VARCHAR(255),
  remarks TEXT,
  mrtg VARCHAR(255)
);

-- Insert some sample lead data for testing
INSERT IGNORE INTO LeadDemoData (sr_no, ckt, cust_name, address, email_id, contact_name, usable_ip_address, bandwidth, device) VALUES
('1', 'CKT001', 'Sample Company 1', '123 Main St, City', 'contact@company1.com', 'John Doe', '192.168.1.10', '100 Mbps', 'Router-1'),
('2', 'CKT002', 'Sample Company 2', '456 Oak Ave, Town', 'info@company2.com', 'Jane Smith', '192.168.1.20', '50 Mbps', 'Switch-1'),
('3', 'CKT003', 'Sample Company 3', '789 Pine Rd, Village', 'admin@company3.com', 'Bob Johnson', '192.168.1.30', '200 Mbps', 'Router-2');
