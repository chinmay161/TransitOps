# TransitOps Business Rules

This document defines all business rules enforced by the TransitOps platform. These rules ensure data integrity, operational safety, and compliance across vehicles, drivers, trips, maintenance, and financial operations.

---

# 1. Authentication & Authorization

## BR-001: Authentication Required
- Every API endpoint (except login) requires authentication.
- Unauthenticated users cannot access any protected resource.

## BR-002: Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| Fleet Manager | Full access to fleet, trips, maintenance |
| Dispatcher | Manage trips and assignments |
| Safety Officer | View/update drivers and compliance |
| Financial Analyst | Manage expenses, reports, analytics |

Users may only perform actions permitted by their role.

---

# 2. Vehicle Rules

## BR-101: Unique Registration Number

Each vehicle must have a unique registration number.

Validation:
```
Registration Number must be UNIQUE.
```

---

## BR-102: Allowed Vehicle Status

Vehicle status can only be one of:

```
Available
On Trip
In Shop
Retired
```

---

## BR-103: Retired Vehicle

Retired vehicles:

- cannot be dispatched
- cannot enter maintenance
- cannot record fuel logs
- remain visible in registry only

---

## BR-104: Vehicle Availability

Only vehicles with status

```
Available
```

may be selected during dispatch.

---

## BR-105: Load Capacity

Trip cargo weight must never exceed vehicle capacity.

Validation

```
Cargo Weight <= Maximum Load Capacity
```

Otherwise

```
Dispatch Rejected
```

---

## BR-106: Odometer

Vehicle odometer

- cannot decrease
- must always increase

Validation

```
New Odometer >= Previous Odometer
```

---

# 3. Driver Rules

## BR-201: License Number

Driver license numbers must be unique.

---

## BR-202: Driver Status

Allowed values

```
Available
On Trip
Off Duty
Suspended
```

---

## BR-203: License Validity

Expired licenses cannot be assigned.

Validation

```
License Expiry Date > Today
```

---

## BR-204: Suspended Driver

Suspended drivers

- cannot be assigned
- cannot dispatch trips

---

## BR-205: Driver Availability

Only

```
Available
```

drivers appear in dispatch.

---

# 4. Trip Rules

## BR-301: Trip Status

Trip lifecycle

```
Draft
↓

Dispatched
↓

Completed

or

Cancelled
```

Allowed transitions only.

---

## BR-302: Vehicle Assignment

A vehicle already

```
On Trip
```

cannot be assigned again.

---

## BR-303: Driver Assignment

A driver already

```
On Trip
```

cannot be assigned again.

---

## BR-304: Dispatch Validation

Before dispatch, system validates

✓ Vehicle Available

✓ Driver Available

✓ Driver License Valid

✓ Vehicle Capacity

✓ Vehicle not Retired

✓ Vehicle not In Shop

If any validation fails

```
Dispatch Denied
```

---

## BR-305: Dispatch Status Update

Successful dispatch automatically updates

Vehicle

```
Available
↓

On Trip
```

Driver

```
Available
↓

On Trip
```

Trip

```
Draft
↓

Dispatched
```

---

## BR-306: Complete Trip

Completing a trip

- updates final odometer
- records fuel used
- marks driver available
- marks vehicle available
- updates analytics

---

## BR-307: Cancel Trip

Cancelling

- restores vehicle availability
- restores driver availability

Only dispatched trips may be cancelled.

Completed trips cannot.

---

# 5. Maintenance Rules

## BR-401: Maintenance Creation

Creating an active maintenance record

automatically changes

```
Vehicle Status

Available
↓

In Shop
```

---

## BR-402: Maintenance Restriction

Vehicles in

```
In Shop
```

cannot

- dispatch trips
- record mileage
- record fuel

---

## BR-403: Closing Maintenance

Closing maintenance changes

```
In Shop
↓

Available
```

unless vehicle is retired.

---

# 6. Fuel Rules

## BR-501: Fuel Log

Fuel log requires

- Vehicle
- Date
- Liters
- Cost

---

## BR-502: Positive Fuel

```
Fuel > 0

Cost > 0
```

---

## BR-503: Fuel Efficiency

Automatically calculated

```
Fuel Efficiency

Distance Travelled

/
Fuel Used
```

---

# 7. Expense Rules

## BR-601: Expense Types

Allowed

- Fuel
- Toll
- Maintenance
- Other

---

## BR-602: Expense Amount

```
Amount > 0
```

---

## BR-603: Operational Cost

```
Operational Cost

=

Fuel Cost

+

Maintenance Cost

+

Other Expenses
```

---

# 8. Dashboard Rules

Dashboard KPIs update automatically whenever

- Trip dispatched
- Trip completed
- Vehicle status changes
- Maintenance created
- Maintenance closed
- Fuel logged
- Expense recorded

---

# 9. Analytics Rules

Fleet Utilization

```
(On Trip Vehicles)

/

(Total Active Vehicles)

×100
```

---

Fuel Efficiency

```
Distance

/

Fuel
```

---

Vehicle ROI

```
Revenue

-

(Maintenance + Fuel)

----------------------

Acquisition Cost
```

---

# 10. Data Integrity Rules

## DR-001

Every Trip references

- one Vehicle
- one Driver

---

## DR-002

Maintenance must reference an existing vehicle.

---

## DR-003

Fuel log must reference an existing vehicle.

---

## DR-004

Expense must reference an existing vehicle.

---

## DR-005

Deleting

- Vehicle
- Driver

is prohibited if referenced by trips.

Use soft delete or Retired status instead.

---

# 11. Automatic State Transitions

| Event | Vehicle | Driver | Trip |
|---------|----------|---------|------|
| Dispatch | On Trip | On Trip | Dispatched |
| Complete | Available | Available | Completed |
| Cancel | Available | Available | Cancelled |
| Maintenance Start | In Shop | — | — |
| Maintenance End | Available | — | — |
| Retire Vehicle | Retired | — | — |

---

# 12. Validation Summary

| Validation | Result |
|------------|--------|
| Duplicate Registration | Reject |
| Duplicate License | Reject |
| Expired License | Reject |
| Suspended Driver | Reject |
| Vehicle In Shop | Reject |
| Vehicle Retired | Reject |
| Vehicle On Trip | Reject |
| Driver On Trip | Reject |
| Cargo > Capacity | Reject |
| Negative Fuel | Reject |
| Negative Expense | Reject |
| Lower Odometer | Reject |

---

# 13. Example Workflow

1. Register Vehicle (Available)
2. Register Driver (Available)
3. Create Trip
4. Validate Business Rules
5. Dispatch Trip
6. Vehicle → On Trip
7. Driver → On Trip
8. Complete Trip
9. Vehicle → Available
10. Driver → Available
11. Record Fuel
12. Record Expense
13. Create Maintenance
14. Vehicle → In Shop
15. Close Maintenance
16. Vehicle → Available
17. Dashboard & Analytics Refresh