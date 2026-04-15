# Changelog

All notable changes to paymebackpls will be documented in this file.

## [0.1.0.1] - 2026-04-15

### Fixed
- Mobile users can now choose an existing photo from their gallery instead of being forced to use the camera

## [0.1.0.0] - 2026-04-14

### Added
- Supabase Postgres persistence — receipts now survive server restarts and deploys
- Phone OTP authentication for receipt creators (Partiful-style, optional, non-blocking)
- "Save this receipt" prompt on the share screen after creating a receipt
- "My Receipts" page at `/receipts` for logged-in users to view past receipts
- Database schema with RLS policies for secure access
- Vitest test framework with 21 unit tests covering receipt math and validation

### Fixed
- Auth endpoints now verify Supabase access tokens server-side instead of trusting client-sent user IDs

## [0.0.0.3] - 2026-04-14

### Added
- Test framework (Vitest + happy-dom + Testing Library) with 33 tests covering validation and receipt logic

### Changed
- Home page header updates live as the payer types their name, falls back to "paymebackpls" when empty
- Payer name in header is now **bold and underlined** across home page and friend view for emphasis

## [0.0.0.1] - 2026-04-14

### Changed
- Receipt header now shows the payer's name (e.g., "payAlexbackpls") instead of the generic "paymebackpls" when friends open the shared link
