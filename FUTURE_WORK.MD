# Future Work and Major Features

This document outlines major features and enhancements planned for future development of the ShearHub application.

## 1. Online Payment Gateway Integration

**Objective**: Implement a real online payment gateway to allow clients to pay for bookings directly through the platform, particularly for barbershops on premium ("Gold") subscription plans.

**Details**:
-   **User Need**: Based on feedback for a "Gold" plan, enabling online payments is a key feature for barbershops wanting to secure bookings and streamline their payment collection.
-   **Provider Selection**: Research and select a suitable payment gateway provider (e.g., Stripe, Mercado Pago, PayPal). Considerations include transaction fees, ease of integration, supported payment methods, and regional availability.
-   **SDK Integration**: Integrate the chosen provider's SDK for handling payment processing.
-   **Payment Flow Management**:
    -   Implement payment initiation logic within the booking process.
    -   Handle payment redirects (if applicable) or embedded payment forms.
    -   Develop webhook endpoints to securely receive and process payment status updates from the gateway (e.g., payment success, failure, refunds).
    -   Update the `payments` table to store transaction IDs, payment gateway status, and any other relevant information from the provider.
-   **Security**: Securely manage API keys and sensitive payment information, adhering to PCI DSS compliance standards if necessary (often handled by the gateway's SDKs/iframes).
-   **UI/UX Changes**:
    -   Modify the booking UI (`ClientBooking.tsx`, `PaymentMethodCard.tsx`) to include options for online payment.
    -   Provide clear feedback to users about payment status.
    -   Allow barbershops to view and manage online transaction details.

## 2. Subscription Plan Management

**Objective**: Introduce different subscription tiers for barbershops (e.g., Basic, Gold), with varying feature access, including enabling online payment processing for higher-tier plans.

**Details**:
-   **Requirement**: Barbershops will be able to subscribe to different plans, with features like online payment acceptance being exclusive to premium tiers (e.g., "Gold" plan).
-   **System Components**:
    -   **Plan Definition**: Create a system (e.g., in the database, or configured in an admin panel) to define subscription plans, their features (e.g., online payments, number of barbers, advanced reporting), pricing, and billing cycles (monthly/annual).
    -   **Subscription Lifecycle**:
        -   Allow barbershop owners to subscribe to a plan, upgrade, or downgrade their current plan.
        -   Integrate with a payment gateway (potentially the same one as for client payments, or one specialized for subscriptions like Stripe Billing) to handle recurring subscription payments.
        -   Manage subscription status (active, past_due, canceled, etc.).
    -   **Feature Gating/Access Control**: Implement logic throughout the application to check a barbershop's current subscription status and plan, and conditionally enable/disable features. For example, the option to configure and accept online payments would only be available if the barbershop is on an active "Gold" plan.
    -   **Billing Management**: Provide an interface for barbershop owners to manage their subscription, view billing history, and update payment methods.

## 3. Full Client Booking Flow Implementation

**Objective**: Transition the client booking process (`ClientBooking.tsx` and related components) from a mocked/prototype state to a fully functional system integrated with the backend (Supabase).

**Details**:
-   **Current State**: The `ClientBooking.tsx` page currently uses mocked data or placeholder logic for selecting barbershops, services, barbers, and available time slots.
-   **Backend Integrations (Supabase)**:
    -   **Fetch Barbershops**: Implement logic to fetch a list of barbershops from the `barbershops` table. Consider adding location-based filtering (e.g., search by city, find nearby) and other search criteria (name, services offered).
    -   **Fetch Services per Barbershop**: When a barbershop is selected, fetch the specific services offered by that barbershop from the `services` table (linking `services.barbershop_id` to `barbershops.id`).
    -   **Fetch Barbers per Barbershop**: After a service is selected (or concurrently), fetch the list of barbers associated with the selected barbershop from the `barbers` table (linking `barbers.barbershop_id`).
    -   **Dynamic Availability/Time Slot Generation**: This is a critical and complex part.
        -   Develop logic to determine available time slots based on:
            -   The selected barber's working hours/schedule (potentially stored in a `barber_schedules` table).
            -   The duration of the selected service.
            -   Existing appointments for the selected barber to avoid overlaps.
            -   Potentially include buffer times between appointments.
        -   This may involve creating Supabase database functions (e.g., `plpgsql`) for efficient querying of available slots or handling this logic primarily on the client-side after fetching necessary data (schedules, existing appointments).
    -   **Save Confirmed Bookings**:
        -   Upon confirmation by the client, save the new appointment to an `appointments` table.
        -   The `appointments` table should store all relevant details: `client_id`, `barbershop_id`, `barber_id`, `service_id`, `appointment_time_start`, `appointment_time_end`, `status` (e.g., 'confirmed', 'pending_payment'), `price_paid` (if online payment is made), `payment_method`, etc.
-   **UI/UX Updates**:
    -   Replace all static/mocked data in the booking flow with data fetched from Supabase.
    -   Implement dynamic loading states and user feedback during data fetching.
    *   Ensure the UI allows for smooth selection of barbershop, service, barber, date, and time slot based on real-time availability.
    *   Update the booking summary to reflect accurate selections and pricing.
    *   Handle the transition to payment if online payment is selected and enabled for the barbershop.

---
This documentation will be part of the project's record, guiding future development efforts.
