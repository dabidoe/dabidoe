# Adventure Images

This directory contains images for adventure mode.

## Directory Structure

```
adventures/
├── pyramid-raid/
│   ├── entrance.jpg          - Pyramid entrance with jackal statues
│   ├── grand-corridor.jpg    - Main corridor with hieroglyphics
│   ├── burial-chamber.jpg    - Mummy-filled burial chamber
│   ├── treasure-chamber.jpg  - Pharaoh's treasure room
│   ├── mummy-combat.jpg      - Combat with guardian mummies
│   └── pharaoh-combat.jpg    - Boss fight with Ka-Amon-Ra
├── default-exterior.jpg       - Generic exterior fallback
├── default-corridor.jpg       - Generic corridor fallback
├── default-chamber.jpg        - Generic chamber fallback
├── default-treasure.jpg       - Generic treasure room fallback
├── default-combat.jpg         - Generic combat fallback
└── default-boss.jpg           - Generic boss fight fallback
```

## Image Guidelines

### Format
- JPG or PNG
- Recommended size: 1920x1080 or 16:9 aspect ratio
- Optimized for web (compressed)

### Style
- Cinematic, atmospheric
- Dark fantasy aesthetic
- Egyptian/ancient themes for Pyramid Raid
- Photorealistic or high-quality illustration

### Fallback Images
Generic placeholder images used when specific scenes don't have custom artwork.

### AI Generation
Scene images can be generated using the `aiPrompt` field in adventure-trees.js
Use services like:
- DALL-E 3
- Midjourney
- Stable Diffusion

## Adding New Images

1. Place image in appropriate adventure folder
2. Update `sceneImage.preset` path in adventure-trees.js
3. Provide `aiPrompt` for dynamic generation
4. Set `fallback` to generic placeholder
