# 🏗️ SentinelCore SecureOps - Architecture Documentation

## High-Level Design (HLD) & Low-Level Design (LLD)

---

## Table of Contents
1. [System Overview](#1-system-overview)
2. [High-Level Design (HLD)](#2-high-level-design-hld)
3. [Low-Level Design (LLD)](#3-low-level-design-lld)
4. [Complete Workflow](#4-complete-workflow)
5. [Data Flow Diagrams](#5-data-flow-diagrams)
6. [Security Architecture](#6-security-architecture)
7. [Scalability & Performance](#7-scalability--performance)

---

## 1. System Overview

### 1.1 Purpose
SentinelCore SecureOps is an **Enterprise Security Operations & Infrastructure Monitoring Platform** designed to provide real-time monitoring, vulnerability management, incident tracking, and compliance reporting for organizational infrastructure.

### 1.2 Key Capabilities
- **Real-time Infrastructure Monitoring** (CPU, Memory, Disk, Network)
- **Security Alert Management** with automated threshold-based detection
- **Incident Tracking & SLA Management**
- **Vulnerability Management** with CVE tracking
- **Audit Logging** (immutable event tracking)
- **Compliance Reporting** (PCI DSS, SOC 2, ISO 27001)
- **DevSecOps Dashboard** for unified visibility

### 1.3 System Components
```
┌─────────────────────────────────────────────────────────────┐
│                    SentinelCore Platform                     │
├─────────────────────────────────────────────────────────────┤
│  1. Sentinel Frontend (React 20 + TypeScript)               │
│  2. Assets Service (Spring Boot 4 - Core Backend)           │
│  3. PaymentServer (Telemetry Agent - OSHI-based monitoring) │
│  4. PostgreSQL Database                                      │
│  5. Authentication Layer (JWT-based Spring Security)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. High-Level Design (HLD)

### 2.1 System Architecture - 9-Layer Model

```
┌──────────────────────────────────────────────────────────────────┐
│ Layer 1: PRESENTATION LAYER                                      │
│ ─────────────────────────────────────────────────────────────   │
│ React 20 | TypeScript | Material UI | Recharts                  │
│ Components: Dashboard, Assets, Alerts, Incidents, Vulnerabilities│
└──────────────────────────────────────────────────────────────────┘
                              ↓ HTTP/HTTPS
┌──────────────────────────────────────────────────────────────────┐
│ Layer 2: API GATEWAY (Future)                                    │
│ ─────────────────────────────────────────────────────────────   │
│ Spring Cloud Gateway | OAuth2 | JWT Validation | Rate Limiting  │
└──────────────────────────────────────────────────────────────────┘
                              ↓ REST API
┌──────────────────────────────────────────────────────────────────┐
│ Layer 3: BUSINESS SERVICES                                       │
│ ─────────────────────────────────────────────────────────────   │
│ AuthController | AssetController | AlertController               │
│ IncidentController | VulnerabilityController | DashboardController│
│ MetricController | TelemetryIngestionController                 │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ Layer 4: CORE SERVICES                                           │
│ ─────────────────────────────────────────────────────────────   │
│ InfrastructureMonitoringService | DashboardService               │
│ AssetService | IncidentService | IncidentSlaEngine              │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ Layer 5: DOMAIN LAYER                                            │
│ ─────────────────────────────────────────────────────────────   │
│ Spring Data JPA | Spring Security | Business Logic               │
│ Entities: User, Asset, Alert, Incident, Vulnerability, Metric   │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ Layer 6: EVENT LAYER (Planned)                                   │
│ ─────────────────────────────────────────────────────────────   │
│ Apache Kafka | Event Sourcing | Audit Trail | Notifications     │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ Layer 7: DATA LAYER                                              │
│ ─────────────────────────────────────────────────────────────   │
│ PostgreSQL 15+ | Redis Cache (Planned) | Repositories           │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ Layer 8: SECURITY LAYER                                          │
│ ─────────────────────────────────────────────────────────────   │
│ JWT Authentication | Spring Security | RBAC | Encryption         │
│ SecurityConfig | JwtFilter | JwtService | CustomUserDetailsService│
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ Layer 9: INFRASTRUCTURE LAYER                                    │
│ ─────────────────────────────────────────────────────────────   │
│ Docker | Kubernetes (Planned) | AWS/Azure | Monitoring           │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Interaction Diagram

```
┌──────────────────┐
│  Monitored       │
│  Infrastructure  │◄────┐
│  (Servers/Cloud) │     │
└─────────┬────────┘     │
          │              │ Telemetry
          │ System       │ Collection
          │ Metrics      │ (OSHI Library)
          ↓              │
┌──────────────────────┐ │
│  PaymentServer       │─┘
│  (Telemetry Agent)   │
│  - AgentTelemetryService
│  - OSHI CPU/Memory   │
│  - 2s polling cycle  │
└─────────┬────────────┘
          │
          │ POST /api/v1/telemetry/ingest
          │ (PerformanceMetric JSON)
          ↓
┌────────────────────────────────────────────────────────┐
│         Assets Service (Core Backend)                  │
│  ┌──────────────────────────────────────────────────┐ │
│  │  TelemetryIngestionController                    │ │
│  │    └─► InfrastructureMonitoringService          │ │
│  │          ├─► processRealTelemetry()              │ │
│  │          ├─► evaluateRulesAndHealth()            │ │
│  │          ├─► checkMetricThreshold()              │ │
│  │          ├─► triggerAlertIfNew()                 │ │
│  │          └─► monitorAssetConnectivity()          │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Other Controllers                                │ │
│  │  - AssetController (CRUD)                        │ │
│  │  - AlertController (Query Alerts)                │ │
│  │  - IncidentController (Incident Management)      │ │
│  │  - VulnerabilityController (CVE Tracking)        │ │
│  │  - DashboardController (Aggregated Views)        │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────┬──────────────────────────────┘
                          │
                          │ REST API
                          ↓
                ┌──────────────────────┐
                │  Sentinel Frontend   │
                │  - Dashboard Page    │
                │  - Assets Page       │
                │  - Alerts Page       │
                │  - Incidents Page    │
                │  - Vulnerabilities   │
                │  - Metrics Page      │
                └──────────────────────┘
```

### 2.3 Microservices Architecture (Current vs Planned)

#### Current Implementation
```
Single Monolithic Service:
- Assets Service (All-in-one backend)
```

#### Planned Microservices (Per README)
```
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ User Service  │  │ Asset Service │  │Incident Service│
│ - Auth/RBAC   │  │ - Monitoring  │  │ - Tracking    │
└───────┬───────┘  └───────┬───────┘  └───────┬───────┘
        │                  │                  │
        └──────────────────┴──────────────────┘
                           │
                    ┌──────▼──────┐
                    │ Kafka Event │
                    │   Backbone  │
                    └──────┬──────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                  │                  │
┌───────▼───────┐  ┌───────▼───────┐  ┌───────▼───────┐
│ Audit Service │  │ Alert Service │  │Report Service │
│ - Immutable   │  │ - Realtime    │  │ - Compliance  │
│   Logs        │  │   Alerting    │  │   Reports     │
└───────────────┘  └───────────────┘  └───────────────┘
```

---

## 3. Low-Level Design (LLD)

### 3.1 Database Schema

#### Entity Relationship Diagram
```
┌─────────────────────┐
│      users          │
├─────────────────────┤
│ user_id (UUID) PK   │
│ username (varchar)  │
│ password (varchar)  │◄────────┐
│ email (varchar)     │         │
│ role (enum)         │         │
│ created_at          │         │
└─────────────────────┘         │
                                │
┌─────────────────────┐         │
│      assets         │         │
├─────────────────────┤         │
│ asset_id (UUID) PK  │         │ Created By
│ ip (varchar)        │         │ (Implicit)
│ name (varchar)      │         │
│ type (enum)         │─────────┘
│ status (enum)       │
│ created_at          │
│ updated_at          │
└──────┬──────────────┘
       │ 1:N
       │
       ├─────────────────────────────┐
       │                             │
       │ 1:N                         │ 1:N
┌──────▼──────────────┐    ┌─────────▼────────────┐
│ performance_metrics │    │      alerts          │
├─────────────────────┤    ├──────────────────────┤
│ metric_id (UUID) PK │    │ alert_id (UUID) PK   │
│ asset_id (UUID) FK  │    │ asset_id (UUID) FK   │
│ cpu_usage (float)   │    │ metric_name (varchar)│
│ memory_usage (float)│    │ violation_value      │
│ disk_usage (float)  │    │ server_name          │
│ network_usage       │    │ severity (enum)      │
│ timestamp           │    │ solution (text)      │
└─────────────────────┘    │ created_at           │
                           └──────────────────────┘
       │
       │ Triggers
       ↓
┌─────────────────────┐
│     incidents       │
├─────────────────────┤
│ id (UUID) PK        │
│ incident_ticket     │
│ severity (enum)     │
│ status (enum)       │
│ type (varchar)      │
│ source_ip (varchar) │
│ impact_summary      │
│ assigned_team       │
│ sla_hours (int)     │
│ eta_minutes (int)   │
│ created_at          │
└─────────────────────┘

┌─────────────────────┐
│  vulnerabilities    │
├─────────────────────┤
│ id (UUID) PK        │
│ cve_id (varchar)    │
│ title (varchar)     │
│ description (text)  │
│ severity (enum)     │
│ cvss_score (float)  │
│ patch_status (enum) │
│ affected_servers    │
│ patched_servers     │
│ scanner_source      │
│ last_scanned_at     │
│ created_at          │
└─────────────────────┘
```

#### Enums Definition
```sql
-- Asset Types
CREATE TYPE asset_type AS ENUM ('SERVER', 'CLOUD_AWS', 'CLOUD_AZURE', 'K8S_POD');

-- Health Status
CREATE TYPE health_status AS ENUM ('HEALTHY', 'WARNING', 'CRITICAL', 'OFFLINE');

-- Alert Severity
CREATE TYPE alert_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- Incident Severity
CREATE TYPE incident_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- Incident Status
CREATE TYPE incident_status AS ENUM ('OPEN', 'ASSIGNED', 'INVESTIGATION', 'RESOLVED');

-- Vulnerability Severity
CREATE TYPE vuln_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- Patch Status
CREATE TYPE patch_status AS ENUM ('PENDING', 'TESTING', 'PATCHED', 'FAILED');
```

### 3.2 API Endpoints Specification

#### Authentication APIs
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - User login (returns JWT)
```

#### Asset Management APIs
```
GET    /api/assets           - List all assets
POST   /api/assets           - Create new asset
GET    /api/assets/{id}      - Get asset by ID
PUT    /api/assets/{id}      - Update asset
DELETE /api/assets/{id}      - Delete asset
```

#### Telemetry Ingestion API
```
POST   /api/v1/telemetry/ingest  - Ingest real-time metrics from agents
```

#### Alert Management APIs
```
GET    /api/alerts           - List all alerts
GET    /api/alerts/{id}      - Get alert by ID
DELETE /api/alerts/{id}      - Delete/resolve alert
```

#### Incident Management APIs
```
GET    /api/incidents        - List all incidents
POST   /api/incidents        - Create incident
GET    /api/incidents/{id}   - Get incident by ID
PUT    /api/incidents/{id}   - Update incident status
```

#### Vulnerability Management APIs
```
GET    /api/vulnerabilities           - List all vulnerabilities
POST   /api/vulnerabilities           - Report new vulnerability
GET    /api/vulnerabilities/{id}      - Get vulnerability by ID
PATCH  /api/vulnerabilities/{id}/patch - Update patch status
```

#### Dashboard APIs
```
GET    /api/dashboard/overview            - Get dashboard summary
GET    /api/dashboard/system-health       - Get system health metrics
GET    /api/dashboard/performance-metrics - Get performance metrics
GET    /api/dashboard/recent-alerts       - Get recent alerts
GET    /api/dashboard/recent-incidents    - Get recent incidents
GET    /api/dashboard/resource-summary    - Get resource summary
GET    /api/dashboard/charts              - Get time-series chart data
```

#### Metrics APIs
```
GET    /api/metrics          - Get all performance metrics
GET    /api/metrics/{assetId} - Get metrics for specific asset
```

### 3.3 Class Diagram - Backend Services

```
┌──────────────────────────────────────────────────────────┐
│              Controller Layer                             │
├──────────────────────────────────────────────────────────┤
│ @RestController                                           │
│ - AuthController                                          │
│ - AssetController                                         │
│ - AlertController                                         │
│ - IncidentController                                      │
│ - VulnerabilityController                                 │
│ - DashboardController                                     │
│ - MetricController                                        │
│ - TelemetryIngestionController                           │
└─────────────────────┬────────────────────────────────────┘
                      │ @Autowired
                      ↓
┌──────────────────────────────────────────────────────────┐
│              Service Layer                                │
├──────────────────────────────────────────────────────────┤
│ @Service                                                  │
│ - AssetService                                            │
│ - DashboardService                                        │
│ - IncidentService                                         │
│ - IncidentSlaEngine                                       │
│ - InfrastructureMonitoringService                        │
│   ├─► processRealTelemetry()                            │
│   ├─► evaluateRulesAndHealth()                          │
│   ├─► checkMetricThreshold()                            │
│   ├─► triggerAlertIfNew()                               │
│   ├─► resolveAlertsIfAny()                              │
│   └─► monitorAssetConnectivity() [@Scheduled]           │
└─────────────────────┬────────────────────────────────────┘
                      │ @Autowired
                      ↓
┌──────────────────────────────────────────────────────────┐
│              Repository Layer                             │
├──────────────────────────────────────────────────────────┤
│ @Repository (Spring Data JPA)                            │
│ - UserRepository                                          │
│ - AssetRepository                                         │
│ - AlertRepository                                         │
│ - IncidentRepository                                      │
│ - VulnerabilityRepository                                │
│ - PerformanceMetricRepository                            │
└─────────────────────┬────────────────────────────────────┘
                      │ JDBC
                      ↓
┌──────────────────────────────────────────────────────────┐
│              Database Layer                               │
├──────────────────────────────────────────────────────────┤
│ PostgreSQL 15+                                            │
│ Tables: users, assets, alerts, incidents,                │
│         vulnerabilities, performance_metrics             │
└──────────────────────────────────────────────────────────┘
```

### 3.4 Security Layer Components

```
┌──────────────────────────────────────────────────────────┐
│                   SecurityConfig                          │
├──────────────────────────────────────────────────────────┤
│ @Configuration                                            │
│ @EnableWebSecurity                                        │
│                                                           │
│ securityFilterChain(HttpSecurity http)                   │
│   ├─► Disable CSRF (for REST APIs)                      │
│   ├─► Configure CORS                                     │
│   ├─► Permit: /api/auth/**                              │
│   ├─► Authenticate: all other requests                  │
│   └─► Add JwtFilter before UsernamePasswordAuth         │
│                                                           │
│ passwordEncoder() → BCryptPasswordEncoder                │
│ authenticationManager() → DaoAuthenticationManager       │
└─────────────────────┬────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ↓                           ↓
┌──────────────────┐      ┌──────────────────────┐
│    JwtFilter     │      │    JwtService        │
├──────────────────┤      ├──────────────────────┤
│ @Component       │      │ @Service             │
│                  │      │                      │
│ doFilterInternal()│     │ generateToken()      │
│ ├─► Extract JWT  │◄────┤ extractUsername()    │
│ ├─► Validate     │     │ validateToken()      │
│ └─► SetAuth      │     │ extractAllClaims()   │
└──────────────────┘      └──────────────────────┘
        │
        ↓
┌─────────────────────────────┐
│ CustomUserDetailsService    │
├─────────────────────────────┤
│ @Service                    │
│ implements UserDetailsService│
│                              │
│ loadUserByUsername()         │
│   └─► Query UserRepository  │
└─────────────────────────────┘
```

### 3.5 Monitoring Engine - Detailed Algorithm

#### InfrastructureMonitoringService Flow

```java
// STEP 1: Telemetry Ingestion
processRealTelemetry(PerformanceMetric incomingMetric) {
    1. Verify asset exists in database
    2. Check if metric record exists
       - If exists: UPDATE existing record
       - If not: CREATE new metric record
    3. Save metric to database
    4. Trigger: evaluateRulesAndHealth(asset, metric)
}

// STEP 2: Health Evaluation
evaluateRulesAndHealth(Asset asset, PerformanceMetric metric) {
    Initialize: targetStatus = HEALTHY
    
    Check CPU threshold:
        targetStatus = checkMetricThreshold(asset, "CPU", metric.cpuUsage, targetStatus)
    
    Check Memory threshold:
        targetStatus = checkMetricThreshold(asset, "Memory", metric.memoryUsage, targetStatus)
    
    Check Disk threshold:
        targetStatus = checkMetricThreshold(asset, "Disk", metric.diskUsage, targetStatus)
    
    If (asset.status != targetStatus) {
        Update asset status in database
        
        If (targetStatus == CRITICAL) {
            Trigger: incidentService.triggerIncidentFromFailure(asset, metric)
        }
    }
}

// STEP 3: Threshold Checking
checkMetricThreshold(Asset asset, String metricName, float value, HealthStatus currentStatus) {
    
    IF (value >= 90.0) {
        // CRITICAL threshold breached
        nextStatus = CRITICAL
        triggerAlertIfNew(asset, metricName, value, CRITICAL)
    }
    ELSE IF (value >= 75.0) {
        // HIGH threshold breached
        IF (currentStatus != CRITICAL) {
            nextStatus = WARNING
        }
        triggerAlertIfNew(asset, metricName, value, HIGH)
    }
    ELSE {
        // Metric is healthy
        resolveAlertsIfAny(asset.assetId, metricName)
    }
    
    RETURN nextStatus
}

// STEP 4: Alert Creation (Deduplication)
triggerAlertIfNew(Asset asset, String metricName, float value, AlertSeverity severity) {
    
    // Fetch existing alerts for this asset
    activeAlerts = alertRepository.findByAssetId(asset.assetId)
    
    // Check if alert already exists for this metric
    alreadyFired = activeAlerts.stream()
                               .anyMatch(a -> a.metricName == metricName)
    
    IF (!alreadyFired) {
        // Determine solution based on metric type
        solution = determineSolution(metricName)
        
        // Create new alert
        alert = new Alert(asset.assetId, metricName, value, asset.name, severity, solution)
        
        // Save to database
        alertRepository.save(alert)
    }
}

// STEP 5: Alert Resolution
resolveAlertsIfAny(UUID assetId, String metricName) {
    
    // Fetch all active alerts for this asset
    activeAlerts = alertRepository.findByAssetId(assetId)
    
    // Delete alerts matching the metric name (metric is now healthy)
    activeAlerts.stream()
                .filter(a -> a.metricName == metricName)
                .forEach(alertRepository::delete)
}

// STEP 6: Connectivity Monitoring (Scheduled Task)
@Scheduled(fixedRate = 10000) // Every 10 seconds
monitorAssetConnectivity() {
    
    // Define threshold: 15 seconds without telemetry = OFFLINE
    thresholdTime = now - 15 seconds
    
    FOR EACH asset IN assetRepository.findAll() {
        
        metric = metricRepository.findByAssetId(asset.assetId)
        
        IF (metric.timestamp < thresholdTime && asset.status != OFFLINE) {
            
            // Mark asset as OFFLINE
            asset.status = OFFLINE
            asset.updatedAt = now
            assetRepository.save(asset)
            
            // Trigger connectivity alert
            triggerAlertIfNew(asset, "Connectivity", 100.0, CRITICAL)
        }
    }
}
```

#### Thresholds Configuration
```
Metric Thresholds:
├─► CPU, Memory, Disk:
│   ├─► >= 90%  → CRITICAL (Asset Status: CRITICAL, Alert Severity: CRITICAL)
│   ├─► >= 75%  → WARNING  (Asset Status: WARNING,  Alert Severity: HIGH)
│   └─►  < 75%  → HEALTHY  (Asset Status: HEALTHY,  Resolve Alerts)
│
└─► Connectivity:
    └─► No telemetry for 15s → OFFLINE (Alert Severity: CRITICAL)
```

### 3.6 Frontend Architecture

```
sentinel-frontend/
├── src/
│   ├── App.jsx                    # Main application component
│   ├── main.jsx                   # Entry point
│   │
│   ├── pages/                     # Page components
│   │   ├── LandingPage.jsx        # Public landing page
│   │   ├── AuthPage.jsx           # Login/Register
│   │   ├── DashboardPage.jsx      # Main dashboard with charts
│   │   ├── AssetsPage.jsx         # Asset management
│   │   ├── AlertsPage.jsx         # Alert monitoring
│   │   ├── IncidentsPage.jsx      # Incident tracking
│   │   ├── VulnerabilitiesPage.jsx # CVE management
│   │   └── MetricsPage.jsx        # Performance metrics
│   │
│   ├── components/                # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── ChartComponents/
│   │   └── ...
│   │
│   ├── context/                   # React Context
│   │   └── AuthContext.jsx        # Authentication state management
│   │
│   ├── services/                  # API service layer
│   │   └── api.js                 # Axios-based API calls
│   │
│   └── utils/                     # Utility functions
│       └── helpers.js
```

#### State Management Pattern
```
AuthContext (React Context API)
├─► Manages: user, token, isAuthenticated
├─► Actions: login(), logout(), register()
└─► Persists: localStorage (JWT token)

Component State (useState, useEffect)
├─► DashboardPage: aggregated metrics, charts
├─► AssetsPage: asset list, filters, CRUD operations
├─► AlertsPage: alert list, filtering, resolution
└─► ...
```

---

## 4. Complete Workflow

### 4.1 End-to-End Monitoring Workflow

```
┌───────────────────────────────────────────────────────────────┐
│ PHASE 1: Asset Registration                                   │
└───────────────────────────────────────────────────────────────┘
1. Admin logs into Sentinel Frontend (AuthPage)
2. Navigate to Assets Page
3. Click "Create Asset"
4. Enter: Name, IP, Type (SERVER/CLOUD_AWS/CLOUD_AZURE/K8S_POD)
5. Submit → POST /api/assets
6. Backend creates asset record with status = HEALTHY
7. Note down the generated asset_id (UUID)

┌───────────────────────────────────────────────────────────────┐
│ PHASE 2: Agent Deployment                                     │
└───────────────────────────────────────────────────────────────┘
8. Deploy PaymentServer (Telemetry Agent) on target infrastructure
9. Configure agent with:
   - SOC_INGEST_URL: https://<backend>/api/v1/telemetry/ingest
   - ASSET_ID: UUID from step 7
10. Agent starts AgentTelemetryService
11. @Scheduled task runs every 2 seconds:
    - Collect real-time metrics using OSHI library:
      • CPU usage (%)
      • Memory usage (%)
      • Disk usage (%) [hardcoded in current implementation]
      • Network usage (Mbps) [hardcoded]

┌───────────────────────────────────────────────────────────────┐
│ PHASE 3: Telemetry Streaming                                  │
└───────────────────────────────────────────────────────────────┘
12. Agent POST to /api/v1/telemetry/ingest with payload:
    {
      "assetId": "uuid",
      "cpuUsage": 45.2,
      "memoryUsage": 68.7,
      "diskUsage": 45.0,
      "networkUsage": 12.5
    }

13. TelemetryIngestionController receives request
14. Calls InfrastructureMonitoringService.processRealTelemetry()

┌───────────────────────────────────────────────────────────────┐
│ PHASE 4: Metric Processing & Health Evaluation                │
└───────────────────────────────────────────────────────────────┘
15. Verify asset exists in database
16. Update/Create PerformanceMetric record with timestamp
17. Trigger evaluateRulesAndHealth():
    
    FOR EACH metric (CPU, Memory, Disk):
        Check threshold:
        
        IF value >= 90:
            status = CRITICAL
            Create alert with severity = CRITICAL
        
        ELSE IF value >= 75:
            status = WARNING
            Create alert with severity = HIGH
        
        ELSE:
            status = HEALTHY
            Delete any existing alerts for this metric

18. Update asset.status if changed
19. IF status == CRITICAL:
    Trigger: IncidentService.triggerIncidentFromFailure()

┌───────────────────────────────────────────────────────────────┐
│ PHASE 5: Alert Generation                                     │
└───────────────────────────────────────────────────────────────┘
20. Alert created with:
    - alert_id (UUID)
    - asset_id
    - metric_name (CPU/Memory/Disk)
    - violation_value (actual value)
    - severity (CRITICAL/HIGH)
    - solution (Auto Scaling / Stop processes / Clean Up)
    - timestamp

21. Alert stored in database
22. Frontend polls /api/dashboard/recent-alerts
23. Alert appears in real-time on Dashboard & Alerts Page

┌───────────────────────────────────────────────────────────────┐
│ PHASE 6: Incident Creation (if CRITICAL)                      │
└───────────────────────────────────────────────────────────────┘
24. IncidentService creates incident:
    - incident_ticket (generated)
    - severity (CRITICAL)
    - status (OPEN)
    - type (Infrastructure Failure)
    - source_ip (asset IP)
    - impact_summary
    - sla_hours (calculated by IncidentSlaEngine)
    - eta_minutes

25. Incident stored in database
26. Appears on Dashboard & Incidents Page

┌───────────────────────────────────────────────────────────────┐
│ PHASE 7: Connectivity Monitoring                              │
└───────────────────────────────────────────────────────────────┘
27. InfrastructureMonitoringService runs @Scheduled task every 10s
28. Check if any asset has not sent telemetry in last 15 seconds
29. IF metric.timestamp < (now - 15 seconds):
    - Set asset.status = OFFLINE
    - Create alert: Connectivity / CRITICAL
30. Frontend displays asset as OFFLINE

┌───────────────────────────────────────────────────────────────┐
│ PHASE 8: Dashboard Visualization                              │
└───────────────────────────────────────────────────────────────┘
31. Frontend DashboardPage polls:
    - /api/dashboard/overview (asset counts, alert stats)
    - /api/dashboard/system-health
    - /api/dashboard/performance-metrics
    - /api/dashboard/recent-alerts
    - /api/dashboard/recent-incidents
    - /api/dashboard/charts (time-series data)

32. Recharts library renders:
    - Line charts (CPU/Memory/Disk over time)
    - Bar charts (asset distribution)
    - Pie charts (alert severity distribution)
    - Real-time stat cards

┌───────────────────────────────────────────────────────────────┐
│ PHASE 9: Alert Resolution                                     │
└───────────────────────────────────────────────────────────────┘
33. When metric returns to healthy range (< 75%):
    - resolveAlertsIfAny() is called
    - Alerts for that metric are deleted from database
    - Frontend updates in real-time

34. Manual resolution:
    - Admin can DELETE /api/alerts/{id}

┌───────────────────────────────────────────────────────────────┐
│ PHASE 10: Incident Management                                 │
└───────────────────────────────────────────────────────────────┘
35. Security team views incidents on Incidents Page
36. Can update incident status:
    OPEN → ASSIGNED → INVESTIGATION → RESOLVED
37. PUT /api/incidents/{id} with new status
38. SLA tracking in IncidentSlaEngine
```

### 4.2 Vulnerability Management Workflow

```
1. Security scanner (Trivy/SonarQube/External) detects CVE
2. POST /api/vulnerabilities with:
   - cve_id (e.g., CVE-2024-1234)
   - title, description
   - severity (LOW/MEDIUM/HIGH/CRITICAL)
   - cvss_score (0.0 - 10.0)
   - patch_status (PENDING)
   - affected_servers_count

3. Vulnerability stored in database
4. Appears on Vulnerabilities Page with severity badge
5. Security admin reviews and initiates patching
6. PATCH /api/vulnerabilities/{id}/patch
   - Update patch_status: PENDING → TESTING → PATCHED
   - Update patched_servers_count

7. Dashboard shows vulnerability summary statistics
```

### 4.3 User Authentication Flow

```
Registration:
1. POST /api/auth/register { username, email, password, role }
2. Password hashed with BCryptPasswordEncoder
3. User stored in database
4. Return success message

Login:
1. POST /api/auth/login { username, password }
2. CustomUserDetailsService loads user from database
3. DaoAuthenticationManager validates credentials
4. JwtService.generateToken() creates JWT
5. Return { token, userId, username, role }
6. Frontend stores token in localStorage
7. AuthContext updates authenticated state

Protected API Calls:
1. Frontend sends request with header: Authorization: Bearer <JWT>
2. JwtFilter intercepts request
3. Extract and validate JWT
4. Load user details
5. Set SecurityContext authentication
6. Controller processes request with authenticated user
```

---

## 5. Data Flow Diagrams

### 5.1 Telemetry Data Flow

```
┌──────────────┐
│ Target Server│
│ (Linux/Win)  │
└───────┬──────┘
        │
        │ OSHI System Library
        │ reads hardware metrics
        ↓
┌────────────────────┐
│ AgentTelemetryService│ @Scheduled(2000ms)
│ ┌────────────────┐ │
│ │ CPU: 45.2%     │ │
│ │ Memory: 68.7%  │ │
│ │ Disk: 45.0%    │ │
│ │ Network: 12.5  │ │
│ └────────────────┘ │
└────────┬───────────┘
         │
         │ HTTP POST
         │ JSON Payload
         ↓
┌─────────────────────────┐
│ TelemetryIngestionController│
│  /api/v1/telemetry/ingest  │
└────────┬────────────────┘
         │
         ↓
┌────────────────────────────────┐
│ InfrastructureMonitoringService│
│                                │
│ 1. Validate Asset              │
│ 2. Save/Update Metric          │
│ 3. Evaluate Health             │
└────┬───────────────────────┬───┘
     │                       │
     │                       │
     ↓                       ↓
┌────────────┐        ┌──────────┐
│PostgreSQL  │        │  Alert   │
│ metrics    │        │  System  │
│  table     │        └──────────┘
└────────────┘
```

### 5.2 Alert Generation Flow

```
Metric Threshold Breach
        ↓
checkMetricThreshold()
        ↓
    value >= 90? ──YES──> severity = CRITICAL
        │                        ↓
        NO                  triggerAlertIfNew()
        ↓                        ↓
    value >= 75? ──YES──> severity = HIGH
        │                        ↓
        NO              Check Deduplication
        ↓                        ↓
resolveAlertsIfAny()        Alert Exists?
        ↓                        │
Delete existing alerts     NO    │    YES → Skip
        ↓                        ↓
    HEALTHY              Create Alert
                                ↓
                         determineSolution()
                         ├─► CPU → "Auto Scaling"
                         ├─► Memory → "Stop processes"
                         └─► Disk → "Clean Up"
                                ↓
                        alertRepository.save()
                                ↓
                         PostgreSQL
                                ↓
                         Frontend Poll
                                ↓
                    Dashboard/Alerts Page Update
```

---

## 6. Security Architecture

### 6.1 Authentication & Authorization

```
┌──────────────────────────────────────────────────────────┐
│                   Security Layers                         │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Layer 1: JWT Token-Based Authentication                 │
│  ├─► Token Generation: JwtService                        │
│  ├─► Token Storage: LocalStorage (Frontend)              │
│  ├─► Token Validation: JwtFilter                         │
│  └─► Expiration: Configurable (default 24h)              │
│                                                           │
│  Layer 2: Password Security                              │
│  ├─► Hashing: BCryptPasswordEncoder (strength 12)        │
│  ├─► Salt: Auto-generated per password                   │
│  └─► Validation: DaoAuthenticationManager                │
│                                                           │
│  Layer 3: Role-Based Access Control (RBAC)               │
│  ├─► Roles: ROLE_ADMIN, ROLE_USER, ROLE_AUDITOR         │
│  ├─► Enforcement: @PreAuthorize annotations              │
│  └─► User entity: role field (enum)                      │
│                                                           │
│  Layer 4: CORS Configuration                             │
│  ├─► Allowed Origins: http://localhost:5173              │
│  ├─► Allowed Methods: GET, POST, PUT, DELETE, PATCH      │
│  └─► Allow Credentials: true                             │
│                                                           │
│  Layer 5: CSRF Protection                                │
│  └─► Disabled for REST APIs (Stateless JWT)              │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### 6.2 Security Filter Chain

```
HTTP Request
     ↓
┌─────────────────────┐
│  CORS Filter        │ ← Allow cross-origin from localhost:5173
└──────┬──────────────┘
       ↓
┌─────────────────────┐
│  JwtFilter          │ ← Extract & validate JWT
│  (doFilterInternal) │
│  1. Extract token   │
│  2. Extract username│
│  3. Validate token  │
│  4. Load user       │
│  5. Set SecurityContext
└──────┬──────────────┘
       ↓
┌─────────────────────┐
│  Authorization      │ ← Check endpoint permissions
│  Filter             │
│  - /api/auth/** → PERMIT ALL
│  - Others → AUTHENTICATED
└──────┬──────────────┘
       ↓
┌─────────────────────┐
│  Controller         │ ← Process business logic
└─────────────────────┘
```

### 6.3 Planned Security Enhancements

```
Future Improvements:
├─► Keycloak Integration
│   ├─► Centralized IAM
│   ├─► SSO (Single Sign-On)
│   ├─► OAuth2 / OpenID Connect
│   └─► Fine-grained RBAC
│
├─► API Gateway Security
│   ├─► Rate Limiting
│   ├─► WAF (Web Application Firewall)
│   ├─► IP Whitelisting
│   └─► Request Validation
│
├─► Encryption
│   ├─► Database Encryption at Rest
│   ├─► TLS/SSL for Transit
│   └─► Secrets Management (HashiCorp Vault)
│
├─► Audit Logging
│   ├─► Immutable Audit Trail
│   ├─► Kafka Event Sourcing
│   └─► Compliance Reporting (PCI DSS, SOC 2)
│
└─► Security Scanning
    ├─► SonarQube (SAST)
    ├─► Trivy (Container Scanning)
    └─► Dependency Check (SCA)
```

---

## 7. Scalability & Performance

### 7.1 Current Bottlenecks

```
1. Single Monolithic Backend
   - All services in one Spring Boot application
   - Limited horizontal scaling

2. Synchronous Processing
   - No event-driven architecture (Kafka planned)
   - Blocking REST API calls

3. Database Performance
   - No caching layer (Redis planned)
   - No read replicas
   - Single PostgreSQL instance

4. Telemetry Ingestion
   - 2-second polling from agents
   - Could overwhelm backend at scale (1000+ agents)
```

### 7.2 Planned Scalability Solutions

```
┌─────────────────────────────────────────────────────────────┐
│               Microservices Architecture                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │   User     │  │   Asset    │  │  Incident  │           │
│  │  Service   │  │  Service   │  │  Service   │           │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘           │
│        │               │               │                    │
│        └───────────────┴───────────────┘                    │
│                        │                                    │
│              ┌─────────▼─────────┐                         │
│              │  Apache Kafka     │                         │
│              │  Event Bus        │                         │
│              └─────────┬─────────┘                         │
│                        │                                    │
│        ┌───────────────┴───────────────┐                   │
│        │               │               │                    │
│  ┌─────▼──────┐  ┌─────▼──────┐  ┌─────▼──────┐           │
│  │   Audit    │  │   Alert    │  │  Reporting │           │
│  │  Service   │  │  Service   │  │  Service   │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│                                                              │
│  Benefits:                                                   │
│  ├─► Independent scaling per service                        │
│  ├─► Fault isolation                                        │
│  ├─► Technology diversity                                   │
│  └─► Team autonomy                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                Caching Strategy                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Redis Cache Layer:                                          │
│  ├─► Dashboard metrics (TTL: 30s)                           │
│  ├─► Asset list (TTL: 60s, invalidate on write)            │
│  ├─► User sessions (JWT validation)                         │
│  └─► Performance metrics (recent 1 hour)                    │
│                                                              │
│  Cache Invalidation:                                         │
│  ├─► Write-through on asset updates                         │
│  ├─► Event-driven (Kafka) cache invalidation               │
│  └─► TTL-based expiration                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Database Optimization                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Read Replicas                                            │
│     ├─► Master: Write operations                            │
│     └─► Replicas: Read operations (dashboard, reports)      │
│                                                              │
│  2. Indexing Strategy                                        │
│     ├─► assets.asset_id (PK, clustered)                     │
│     ├─► alerts.asset_id (FK, indexed)                       │
│     ├─► performance_metrics.asset_id (FK, indexed)          │
│     ├─► performance_metrics.timestamp (range queries)       │
│     └─► incidents.status, severity (filtered queries)       │
│                                                              │
│  3. Partitioning                                             │
│     ├─► performance_metrics: Time-based (monthly)           │
│     └─► audit_logs: Time-based (quarterly)                  │
│                                                              │
│  4. Connection Pooling                                       │
│     └─► HikariCP (Spring Boot default, optimized)           │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│          Telemetry Ingestion Optimization                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Current: Synchronous REST POST                              │
│     ├─► Agent → Backend (2s interval)                       │
│     └─► Blocking database writes                            │
│                                                              │
│  Future: Event-Driven Ingestion                              │
│     ├─► Agent → Kafka Topic (telemetry-raw)                 │
│     ├─► Kafka Consumer → Batch Processing                   │
│     ├─► Async database writes (bulk insert)                 │
│     └─► Supports 10,000+ concurrent agents                  │
│                                                              │
│  Backpressure Handling:                                      │
│     ├─► Kafka buffer (configurable retention)               │
│     ├─► Rate limiting per agent (Token Bucket)              │
│     └─► Alert on ingestion lag                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│            Kubernetes Deployment                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Deployment Strategy:                                        │
│  ├─► Horizontal Pod Autoscaling (HPA)                       │
│  │   ├─► Metric: CPU > 70% → scale up                      │
│  │   └─► Min: 2 replicas, Max: 10 replicas                 │
│  │                                                           │
│  ├─► Service Mesh (Istio)                                   │
│  │   ├─► Traffic routing                                    │
│  │   ├─► Circuit breaking                                   │
│  │   └─► Distributed tracing                                │
│  │                                                           │
│  ├─► Persistent Volumes                                     │
│  │   ├─► PostgreSQL: StatefulSet + PVC                     │
│  │   └─► Redis: Deployment + PVC                           │
│  │                                                           │
│  └─► Helm Charts                                            │
│      ├─► Templated deployments                              │
│      ├─► Environment-specific configs                       │
│      └─► Version management                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Performance Benchmarks (Planned)

```
Target SLAs:
├─► API Response Time
│   ├─► p50: < 100ms
│   ├─► p95: < 500ms
│   └─► p99: < 1000ms
│
├─► Telemetry Ingestion
│   ├─► Throughput: 10,000 metrics/sec
│   ├─► Latency: < 50ms (agent to Kafka)
│   └─► Processing delay: < 5s (Kafka to database)
│
├─► Dashboard Load Time
│   ├─► Initial load: < 2s
│   ├─► Chart rendering: < 500ms
│   └─► Real-time updates: < 3s polling interval
│
└─► System Uptime
    └─► 99.99% availability (4.38 minutes downtime/month)
```

---

## 8. Technology Justification

### 8.1 Why Spring Boot 4?
- Latest stable release with Java 21+ support
- Built-in Spring Security for JWT authentication
- Spring Data JPA reduces boilerplate
- Excellent Kubernetes integration
- Production-ready with Actuator, Micrometer

### 8.2 Why PostgreSQL?
- ACID compliance for critical security data
- Strong JSON support (for flexible schemas)
- Excellent indexing and query optimization
- Mature ecosystem with monitoring tools
- Native enum types for status fields

### 8.3 Why React 20?
- Component-based architecture for complex UIs
- Virtual DOM for efficient rendering
- Large ecosystem (Material UI, Recharts)
- TypeScript support for type safety
- React Context for lightweight state management

### 8.4 Why Kafka (Planned)?
- High-throughput message broker (millions of messages/sec)
- Immutable event log (perfect for audit trails)
- Decouples microservices
- Supports event sourcing pattern
- Built-in durability and replication

---

## 9. Future Enhancements

### Milestone Roadmap

**M1: Infrastructure Monitoring (Weeks 1-2)** ✅ CURRENT
- Asset management
- Real-time telemetry ingestion
- Alert generation
- Dashboard visualization

**M2: Security Incident Management (Weeks 3-4)** 🚧 IN PROGRESS
- Incident tracking
- SLA management
- Team assignment
- Resolution workflow

**M3: Vulnerability Management (Weeks 5-6)** 📋 PLANNED
- CVE integration
- Patch management
- Risk scoring
- Compliance tracking

**M4: Audit & Compliance (Weeks 7-8)** 📋 PLANNED
- Immutable audit logs
- Compliance dashboards (PCI DSS, SOC 2, ISO 27001)
- Report generation
- DevSecOps integration

---

## 10. Deployment Architecture

### Current Development Setup
```
localhost:5173  ──► Frontend (Vite Dev Server)
                         │
                         │ HTTP REST
                         ↓
localhost:8080  ──► Backend (Spring Boot - Assets Service)
                         │
                         │ JDBC
                         ↓
localhost:5432  ──► PostgreSQL Database
```

### Planned Production Deployment
```
┌──────────────────────────────────────────────────────────┐
│                     AWS/Azure Cloud                       │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │  CloudFront/CDN                                     │ │
│  │  ├─► sentinel-app.example.com                      │ │
│  │  └─► Static assets caching                         │ │
│  └──────────────────┬─────────────────────────────────┘ │
│                     │                                    │
│  ┌──────────────────▼─────────────────────────────────┐ │
│  │  Application Load Balancer (ALB)                   │ │
│  │  ├─► SSL/TLS termination                           │ │
│  │  ├─► Health checks                                 │ │
│  │  └─► Path-based routing                            │ │
│  └──────────────────┬─────────────────────────────────┘ │
│                     │                                    │
│  ┌──────────────────▼─────────────────────────────────┐ │
│  │  EKS/AKS Kubernetes Cluster                        │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │  Frontend Pod (Nginx)                        │ │ │
│  │  │  Replicas: 2, Autoscale: 2-5                 │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │  Backend Pods (Spring Boot)                  │ │ │
│  │  │  Replicas: 3, Autoscale: 3-10                │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │  Redis StatefulSet                           │ │ │
│  │  │  Replicas: 3 (Master + 2 Replicas)          │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │  Kafka StatefulSet                           │ │ │
│  │  │  Brokers: 3, Zookeeper: 3                    │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  └──────────────────┬─────────────────────────────────┘ │
│                     │                                    │
│  ┌──────────────────▼─────────────────────────────────┐ │
│  │  RDS PostgreSQL (Multi-AZ)                         │ │
│  │  ├─► Primary: Write operations                     │ │
│  │  ├─► Read Replicas: 2 (Read operations)           │ │
│  │  └─► Automated backups (7-day retention)          │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Monitoring & Observability                        │ │
│  │  ├─► Prometheus (Metrics)                          │ │
│  │  ├─► Grafana (Dashboards)                          │ │
│  │  ├─► ELK Stack (Logs)                              │ │
│  │  └─► Jaeger (Distributed Tracing)                  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## Conclusion

SentinelCore SecureOps is architected as a **cloud-native, scalable, and secure** platform for enterprise infrastructure monitoring and security operations. The current implementation provides a solid foundation with:

✅ Real-time telemetry ingestion and processing  
✅ Threshold-based alert generation  
✅ Asset health monitoring with connectivity tracking  
✅ JWT-based authentication  
✅ RESTful API design  
✅ React-based responsive dashboard  

The planned evolution towards **microservices, event-driven architecture, and Kubernetes deployment** will enable the platform to scale to enterprise-grade workloads while maintaining security, compliance, and observability standards.

---

**Document Version:** 1.0  
**Last Updated:** 2026-09-16  
**Author:** SentinelCore Team  
**Status:** Living Document (Updated with each milestone)
