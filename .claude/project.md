# Solombala Shipyard Archive Site

This is a static website built with [Zola](https://www.getzola.org/), a fast static site generator written in Rust. The site serves as an archive for the Solombala Shipyard historical materials.

## Project Structure

- `config.toml` - Main Zola configuration file
- `content/` - Markdown content files for the site
- `templates/` - HTML templates using Tera templating engine
- `static/` - Static assets (CSS, JS, images)
- `.github/workflows/` - GitHub Actions for automated deployment

## Technology Stack

- **Static Site Generator**: Zola, version set in `.zola-version`
- **Templating**: Tera
- **Production**: built by Gitea Actions in the `metadata` repository, hosted on S3 (Garage)
- **Preview**: GitHub Pages via `.github/workflows/dev-preview.yml`
- **Base URL**: https://archive.seapractic.ru

## Key Features

- Search index enabled
- Sass compilation
- Tag taxonomy with RSS feeds
- Custom bucket URL for archive materials: http://archive.seapractic.ru/archive

## Development Workflow

1. **Local Development**: Use `zola serve` to run a local development server
2. **Building**: Use `zola build` to generate the static site
3. **Preview**: Pushing to `main` or `claude/**` publishes a preview with real metadata. Production updates only on a `metadata` deploy

## Useful Commands

- Build the site: `zola build`
- Serve locally with live reload: `zola serve`
- Check site: `zola check`

## Content Management

- Pages are written in Markdown in the `content/` directory
- Templates use the Tera templating language
- Tags can be added to pages for categorization
