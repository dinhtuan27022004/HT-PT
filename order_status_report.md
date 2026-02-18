# Order Saving and Status Implementation Report

## Overview

The current order saving process is handled in `backend/src/services/order.service.js` via the `createOrder` function. It uses a database transaction to ensure data integrity across multiple tables.

## Saving Process (Transaction Steps)

1. **Validate Cart**: Checks if the user has an open cart with items.
2. **Calculate Totals**: Computes subtotal and adds a flat shipping fee (30,000 VND).
3. **Create Order Record**: Inserts into `orders` table.
4. **Create Order Items**: Inserts each cart item into `order_items`.
5. **Update Inventory**: Deducts item quantities from `inventory`.
6. **Create Payment Record**: Inserts into `payments` table.
7. **Close Cart**: Clears cart items and marks cart as 'converted'.
8. **Log History**: Inserts initial status into `order_status_history`.

## Order Statuses

Currently, order statuses are **hardcoded** during creation and there is **no implemented logic** to update them via the API.

### defined Statuses

The following statuses are used in the code:

| Entity | Status Value | Condition |
| :--- | :--- | :--- |
| **Order** | `pending` | **Always** set to this on creation. |
| **Payment** | `pending` | If payment method is **COD**. |
| **Payment** | `initiated` | If payment method is **NOT COD** (e.g., online payment). |
| **Order History** | `pending` | Initial history entry. |

### Missing Features

- **No Status Update Endpoint**: There is no API controller or service method to change an order's status (e.g., to 'processing', 'shipped', 'delivered', or 'cancelled').
- **No Admin Interface**: The backend does not currently support admin operations to manage order lifecycles.

## Recommendation

To support a full order lifecycle, the following should be implemented:

1. **Update Order Status API**: An endpoint (likely admin-only) to update order status.
2. **Status Enum**: Define valid statuses (e.g., `pending`, `confirmed`, `shipping`, `completed`, `cancelled`) to prevent invalid data.
3. **Inventory Handling on Cancel**: Logic to restore inventory if an order is cancelled.
