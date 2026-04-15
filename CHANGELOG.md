# Changelog

All notable changes to paymebackpls will be documented in this file.

## [0.0.0.3] - 2026-04-14

### Added
- Test framework (Vitest + happy-dom + Testing Library) with 33 tests covering validation and receipt logic

### Changed
- Home page header updates live as the payer types their name, falls back to "paymebackpls" when empty
- Payer name in header is now **bold and underlined** across home page and friend view for emphasis

## [0.0.0.1] - 2026-04-14

### Changed
- Receipt header now shows the payer's name (e.g., "payAlexbackpls") instead of the generic "paymebackpls" when friends open the shared link
