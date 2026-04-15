# Changelog

All notable changes to paymebackpls will be documented in this file.

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

## [0.0.0.1] - 2026-04-14

### Changed
- Receipt header now shows the payer's name (e.g., "payAlexbackpls") instead of the generic "paymebackpls" when friends open the shared link
