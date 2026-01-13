# Image Folder Structure

This document describes the complete folder structure for all placeholder images in the application.

## Overview
Each placeholder image box in the frontend has a dedicated folder. Replace `placeholder.png` files in each folder with your actual images, and they will automatically appear in the correct UI location.

## Folder Structure

### Homepage Cards (`/images/home-cards/`)
- `community-chat/placeholder.png` - Community Chat card on homepage
- `private-chat/placeholder.png` - Private Chat card on homepage  
- `ai-advisor/placeholder.png` - AI Advisor card on homepage

### Hero Images (`/images/hero/`)
- `hero1.png` - Main hero background image (public & authenticated)
- `hero2.png` - Secondary hero background image

### Community Chat Rooms (`/images/community-chat-rooms/`)
- `freshwater/placeholder.png` - Freshwater room card
- `saltwater/placeholder.png` - Saltwater room card
- `reef/placeholder.png` - Reef Systems room card
- `community/placeholder.png` - Community Tank room card
- `photos/placeholder.png` - Photos & Stories room card

### Private Chat Rooms (`/images/private-chat-rooms/`)
- `saltwater/placeholder.png` - Saltwater private chat
- `freshwater/placeholder.png` - Freshwater private chat

### Profile (`/images/profile/`)
- `avatar/placeholder.png` - User avatar placeholder

### Categories (`/images/categories/`)
- `saltwater/placeholder.png` - Saltwater main category
- `freshwater/placeholder.png` - Freshwater main category
- `fish/` - Fish category images (saltwater1.png, freshwater1.png, stocking.png, etc.)
- `coral/` - Coral category images (coral1.png, sps.png, lps.png, soft.png, anemone.png, reef1.png, nano.png, large.png, mixed.png)
- `plants/` - Plant category images (plant1.png, macroalgae.png, java-fern.png, anubias.png, carpet.png, stem.png, chaeto.png, caulerpa.png, halimeda.png)
- `chemistry.png` - Water chemistry
- `aquascape.png` - Aquascapes
- `photos.png` - Photos
- `salinity.png`, `calcium.png`, `nutrients.png`, `ph.png`, `ammonia.png`, `nitrates.png`
- `tank-photos.png`, `success.png`
- `nature-style.png`, `dutch-style.png`, `iwagumi.png`
- `fish/compatibility.png`, `fish/biomass.png`, `fish/quarantine.png`
- `fish/saltwater/` - clownfish.png, tang.png, angelfish.png, wrasse.png
- `fish/freshwater/` - betta.png, tetra.png, cichlid.png, guppy.png

## Usage Instructions

1. **Replace Placeholder Images**: Drop your actual images into the corresponding folders, replacing `placeholder.png` files
2. **Naming**: For placeholder files, use the same name (`placeholder.png`) or update the code to use your filename
3. **Format**: PNG, JPG, or JPEG formats are supported
4. **Existing Images**: Some folders already contain actual images (e.g., `community-chat/communitychat.jpeg`, `private-chat/privatechat.png`). The app will use these automatically.

## Current Status

- ✅ All folders created
- ✅ Placeholder images generated
- ✅ Frontend code updated to use existing images
- ✅ Error handling in place for missing images

## Notes

- The app uses `onError` handlers to gracefully handle missing images
- Image paths are defined in:
  - `src/components/HomePage.js` - Homepage cards and hero
  - `src/components/GeneralChatPage.js` - Community chat rooms
  - `src/components/ProfilePage.js` - Profile avatars
  - `src/utils/categories.js` - Category images
- All images are served statically from `/public/images/`
