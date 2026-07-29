# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security
- Ignore Claude fleet bot telemetry paths (`data/events/fleet-*.jsonl`, `data/.last-tool-call`, `data/.idle`) at any depth — files Claudlobby supervision hooks can write relative to the session cwd (Claudfather/Claudlobby#874). Prevents a broad `git add` in an agent checkout from staging fleet telemetry; no product paths match.

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
