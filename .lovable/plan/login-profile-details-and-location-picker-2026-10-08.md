# Login profile details and location picker

## Goal
Add phone, UPI ID, address, and a consent-based, adjustable Google Maps location picker to account creation while preserving the current sign-in behavior and visual design.

## Implementation
- Keep email/password sign-in exactly as it is; show the new required contact/address fields only during sign-up.
- Validate phone number, UPI ID, and address before account creation. Offer current-location detection only after an explicit button press, explain denied/unavailable permission, and allow a user to type a location or adjust the marker on the map.
- Load the Maps JavaScript API with the linked managed browser key from its public environment setting; keep gateway/server credentials out of the browser.
- Store these personal details in a dedicated private table, not the broadly readable profiles table. Copy validated signup metadata during the existing auth-user creation trigger; allow only the account owner to read their row.
- Verify the sign-in and signup form states, validation, permission-denied messaging, and desktop/mobile layout. Google Maps live rendering cannot be tested in this sandbox and will need verification on the deployed site.

## Technical details
- Apply the additive schema change with the Lovable Database migration tool, including explicit grants, RLS, and owner-only reads.
- Extend the existing new-user trigger without changing role assignment or the separate role table.
- Keep location coordinates nullable so manual location entry remains possible when device permission or Maps access is unavailable.
