# Solombala Shipyard Archive Site

A static website for the Solombala Shipyard historical archive, built with [Zola](https://www.getzola.org/).

## About

This project hosts the digital archive of the Solombala Shipyard, preserving historical materials and making them accessible online. The site is deployed at [archive-v2.seapractic.ru](https://archive-v2.seapractic.ru).

## Technology

- **Static Site Generator**: [Zola](https://www.getzola.org/) - A fast static site generator in Rust
- **Templating**: Tera
- **Deployment**: GitHub Pages via GitHub Actions
- **Hosting**: GitHub Pages with custom domain

## Project Structure

```
.
├── config.toml          # Zola configuration
├── content/             # Markdown content files
├── templates/           # HTML templates (Tera)
├── static/              # Static assets (CSS, JS, images)
├── .github/workflows/   # GitHub Actions for deployment
└── .claude/             # Claude Code configuration
```

## Getting Started

### Prerequisites

- [Zola](https://www.getzola.org/documentation/getting-started/installation/) installed on your system

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/netangel/solombala-shipyard-archive-site.git
   cd solombala-shipyard-archive-site
   ```

2. Serve the site locally:
   ```bash
   zola serve
   ```

3. Open your browser to `http://127.0.0.1:1111`

The development server includes live reload - changes to content and templates will automatically refresh the browser.

### Building

To build the static site:

```bash
zola build
```

The generated site will be in the `public/` directory.

### Checking

To check for errors in content and configuration:

```bash
zola check
```

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the main branch. The deployment is handled by GitHub Actions (see `.github/workflows/zola.yml`).

## Content Management

### Adding a New Page

Create a new Markdown file in the `content/` directory:

```markdown
+++
title = "Page Title"
date = 2025-11-16
[taxonomies]
tags = ["tag1", "tag2"]
+++

Your content here...
```

### Templates

Templates are located in the `templates/` directory and use the Tera templating language:

- `base.html` - Base template with common layout
- `index.html` - Homepage template
- `page.html` - Individual page template
- `section.html` - Section listing template
- `taxonomy_list.html` - List of all tags
- `taxonomy_single.html` - Single tag page

## Features

- Full-text search (enabled via `build_search_index = true`)
- Tag taxonomy with RSS feeds
- Sass compilation
- Archive materials integration via bucket URL

## Claude Code Integration

This project is configured for [Claude Code](https://docs.claude.com/en/docs/claude-code). Useful commands:

- `/build` - Build the site
- `/check` - Check for issues
- `/serve` - Start local development server
- `/new-page` - Create a new content page

See `.claude/project.md` for more details.

## License

See [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
