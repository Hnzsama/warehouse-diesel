# 12. Technical Guidelines & Stack Architecture

## 1. Stack Technology Overview

```mermaid
flowchart TD
    subgraph Frontend["Frontend Layer (SPA)"]
        React["React 19 / TSX"]
        Inertia["Inertia.js v3"]
        Tailwind["Tailwind CSS v4"]
        Recharts["Recharts Charts"]
    end

    subgraph Backend["Backend Layer (Laravel)"]
        PHP["PHP 8.5"]
        Laravel["Laravel 13 Framework"]
        Fortify["Laravel Fortify Auth"]
        Spatie["Spatie Permission RBAC"]
        DomPDF["Laravel DomPDF"]
        PhpSpreadsheet["PhpSpreadsheet Excel"]
    end

    subgraph DB["Data Layer"]
        MySQL["MySQL 8.0 / SQLite"]
    end

    Frontend <-->|"Inertia Protocol"| Backend
    Backend <--> DB
```

---

## 2. Key Commands
- `php artisan serve`: Running local dev server.
- `npm run dev`: Running Vite dev server.
- `php artisan test --compact`: Running Pest automated tests (48 Passed).
- `vendor/bin/pint --dirty --format agent`: Code formatting.
