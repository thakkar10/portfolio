# Client galleries: experience and build specification

Status: working specification (October 18, 2026). A first photo-only vertical slice is implemented; the acceptance criteria below remain the full target.

## Goal

Create private, elegant galleries for delivering and proofing photography. The photographer starts by choosing files. The system creates a draft gallery and fills it as uploads finish; title, cover, sets, design, access, and download settings can be refined afterward. The client receives a focused gallery without photographer controls or the portfolio's general navigation.

The visual reference is Pixieset's client gallery experience, adapted to Heet Thakkar's own identity. Public Pixieset pages reveal presentation and interaction patterns, not its server implementation.

## Starting point and first implementation

- The original `/client-gallery` sample page was a browser-only prototype. It now redirects to the protected gallery workspace instead of appearing in public navigation.
- `/admin/galleries` creates draft galleries on file selection, uploads photos directly to Cloudinary authenticated storage, and edits title, cover, focal point, sets, order, password, downloads, and publication state.
- `/g/[slug]` is the separate client experience with cover, sets, viewer, local favorites, and permitted individual downloads.
- Gallery image requests check publication and password access on the server. See `docs/GALLERY_STORAGE.md` for the storage and delivery decision.
- The current design previews are `/admin/galleries?demo=1` and `/g/demo`; they use sample imagery and do not store files.
- Clients can now save a server-backed selection, copy its private link to restore it on another device, and submit it with a name. The admin editor shows draft and submitted lists with filenames. The selection link acts as a secret bearer token; the gallery password still applies.
- Bulk ZIP downloads, video uploads, and more advanced design controls remain to be built.

## Photographer journey

### 1. Start with files

- `New gallery` opens a full-page uploader with `Choose photos and videos` and drag-and-drop.
- File selection accepts multiple files. Valid files immediately become ordered local thumbnails while upload begins; no title is required first.
- Create a draft gallery on the first valid selection and derive a temporary title from the folder name or `Untitled gallery`.
- Show count, total bytes, per-file progress, overall progress, and clear states: queued, uploading, processing, ready, failed.
- Uploads can continue while the photographer edits the draft. Concurrency is bounded so large batches do not overload the browser.
- Failed files stay visible with a reason and `Retry`; completed files are never uploaded again during a retry.
- Navigating away during active uploads must warn that browser-based transfers may stop. Returning to the draft preserves completed media and permits selecting the remaining files.
- Avoid silently altering delivered originals. Generate display derivatives separately from the stored original where supported.
- Keep the gallery in Draft until at least one item is ready and the photographer explicitly publishes.

### 2. Review the automatically assembled gallery

- The draft editor opens as soon as upload begins. Photo cards populate as files finish processing.
- Use filename order as the initial order, then offer date taken, date uploaded, and manual drag ordering. Preserve manual order after additional uploads.
- The first ready photo becomes the provisional cover. The photographer can select any gallery image or upload a separate cover.
- Cover editing includes focal-point positioning and immediate desktop/mobile previews.
- Permit selecting multiple photos to move, reorder, or remove. Destructive removal needs a recoverable path or a clear confirmation.
- Support named sets within a gallery (for example Highlights, Getting Ready, Ceremony, Reception); allow moving photos between sets.
- Videos can sit among photos and need editable thumbnails. Existing Bunny Stream upload work can inform video handling, but gallery permissions must still be enforced.

### 3. Refine and publish

The editor should have clear sections: `Photos`, `Design`, `Access`, `Downloads`, `Proofing`, and `Activity`. Keep `Preview`, publication state, and the share action visible in the header.

- **Details:** title, optional event date, intro text, URL slug, and cover.
- **Design:** a small number of polished cover and grid variants, spacing, typography, light/dark gallery surface, and focal point. Defaults must already look finished.
- **Access:** unlisted by default, optional gallery password, optional expiry/unpublish date. A private URL is a sharing method, not proof of identity.
- **Downloads:** off, individual, or full-gallery; permitted resolution(s); optional separate download PIN. Actual file delivery must check these settings on the server.
- **Proofing:** favorites on/off, optional notes and selection limit, clear submission state.
- **Preview:** client view on desktop and phone sizes, including password entry and download/favorites states.
- **Publish:** validate cover/media readiness, then publish explicitly. Show a copyable client URL and access details. Editing a published gallery should not accidentally expose a draft-only file.
- **Activity:** favorite lists, submitted selections, and downloads with timestamps; export photo filenames for editing workflows.

## Client journey

- The client opens a unique gallery URL and, if enabled, enters the gallery password before media information or usable asset URLs are returned.
- A full-viewport cover presents the image, title, optional date, and one understated `View gallery` action. The cover's crop holds its subject on mobile.
- Inside, a restrained sticky header carries gallery identity, set navigation, favorites, and a compact menu for share/download. It should not include the portfolio's public sections or the admin editor.
- The grid preserves image proportions with consistent spacing. On desktop it can use multiple columns; on phone it should use two columns where images remain legible and collapse as needed for accessibility.
- Selecting an image opens a quiet full-screen viewer with keyboard arrows/Escape, swipe on touch, filename or caption when useful, and only enabled actions.
- Favorites require a lightweight identity (email or an access-bound client session) so selections survive devices. Clients can review, rename, and submit a list; they must see whether it is a draft or submitted.
- Downloads disclose available sizes and any required PIN before starting. Individual and gallery downloads give visible progress or a clear queued state and actionable errors.
- Every interaction needs loading, empty, failure, and success states. The client should never see a button that does nothing.

## Visual direction

- Photography dominates: edge-to-edge cover, generous breathing room, calm neutral surfaces, refined type, precise spacing, subtle motion.
- Use the photographer's branding in the gallery itself, but keep gallery styling independent from the portfolio shell so a later portfolio redesign cannot disrupt delivery pages.
- The design should feel rich through image quality, cropping, timing, and restraint rather than heavy borders, gradients, or dashboard chrome.
- Provide a consistent cover-to-grid transition, quiet hover actions, no layout shift while thumbnails load, and reduced-motion support.
- Treat mobile as a first-class gallery, not a squeezed desktop dashboard.
- Do not copy Pixieset's proprietary assets, marks, or minified code.

## Technical boundaries for this repository

- Add gallery, set, gallery-media, favorite-list, and activity records rather than reusing public portfolio `Media` records.
- Put photographer operations behind existing admin authentication with server-side authorization on every mutation. Keep admin and client routes separate.
- Store passwords as hashes, use short-lived access sessions, and deny gallery metadata/media before the access check.
- Private originals need protected storage/delivery. Public Cloudinary URLs alone cannot enforce gallery passwords or download settings; display derivatives and original downloads require an explicit asset-access design.
- Use direct/resumable uploads where appropriate, but register an asset only after server-side verification of the upload result. Limit types/sizes and bound concurrency.
- The current `/api/media` endpoint is public and portfolio-oriented; gallery endpoints need separate access logic and should not inherit its empty-array-on-error behavior.
- Generate responsive image variants, preserve aspect ratios, and lazy load below the fold. Keep original files intact for authorized downloads.
- Treat privacy, publish state, and download permissions as server checks, not UI toggles.

## Acceptance criteria

1. Photographer selects 30+ photos at once; a draft gallery appears immediately and fills as each file completes.
2. One failed file can be retried without duplicating the other 29. Refresh preserves finished uploads and settings.
3. Photographer can rename the gallery, change the cover and focal point, create sets, reorder, preview, publish, and copy its URL.
4. An unpublished or password-protected gallery does not expose its media through page HTML, gallery APIs, thumbnails, or download endpoints to an unauthorized visitor.
5. A client can browse on phone and desktop, open the viewer, create persistent favorites, submit a selection, and download only what the photographer allowed.
6. Disabled actions are absent or clearly explained; every enabled action completes or shows a useful error.
7. Gallery pages remain visually coherent with portfolio navigation hidden and when the main portfolio is redesigned later.

## Pixieset references

- Uploading: https://help.pixieset.com/hc/en-us/articles/115003740132-Uploading-to-Client-Gallery
- Collections and sets: https://help.pixieset.com/hc/en-us/articles/115003792812-Creating-collections-and-sets
- Cover and focal point: https://help.pixieset.com/hc/en-us/articles/115003793312-Changing-a-collection-s-cover
- Design: https://help.pixieset.com/hc/en-us/articles/115003795652-Design-Settings-for-Your-Collections
- Sorting: https://help.pixieset.com/hc/en-us/articles/115003776671-Sorting-photos-in-a-collection
- Presets: https://help.pixieset.com/hc/en-us/articles/115003740052-Creating-reusable-templates-with-collection-presets
- Privacy: https://help.pixieset.com/hc/en-us/articles/115003778351-Privacy-options-for-Client-Gallery
- Favorites: https://help.pixieset.com/hc/en-us/articles/115003733131-Using-favorite-lists-for-client-proofing
- Downloads: https://help.pixieset.com/hc/en-us/articles/115003795572-Collection-download-settings
- Public gallery examples: https://demo.pixieset.com/jackyandrya/ and https://chrisruth.pixieset.com/meghananddesmond/
