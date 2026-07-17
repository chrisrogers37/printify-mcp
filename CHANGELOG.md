# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- `PrintifyAPI.updateProduct()` no longer silently swallows a failed `getOne()`
  when resolving variant IDs for a print area. Previously a fetch failure was
  caught and the update continued with **zero** variant IDs — silently applying
  the print area to nothing while looking like success. It now surfaces the real
  error.

### Changed
- Library consumers of `createPrintifyMcpServer()` should note that
  `initialize()` can now **reject** on a persistent Printify API failure with no
  configured shop ID (it no longer fabricates mock shops). Wrap it in try/catch.

## [0.1.1] - 2025-05-15

### Fixed
- Fixed documentation files not being included in the npm package
- Added build step to copy documentation files to the dist directory

## [0.1.0] - 2025-05-15

### Added
- Enhanced defaults management system with `set_default` and `get_defaults` tools
- Support for setting and using aspect ratio in image generation
- Improved response formatting to show actual parameters used for generation

### Fixed
- Fixed bug where aspect ratio settings weren't properly applied
- Fixed conflict between width/height and aspect ratio parameters
- Improved handling of default parameters in image generation

## [0.0.1] - 2025-05-01

### Added
- Initial release of the Printify MCP server
- Comprehensive integration with Printify API using the official SDK
- Shop management tools (list shops, switch shops, get status)
- Product management tools (create, list, update, delete, publish)
- Blueprint and variant management tools
- Image upload and management
- AI image generation using Replicate's Flux 1.1 Pro model
- Combined workflow for generating and uploading images
- Detailed documentation and examples
