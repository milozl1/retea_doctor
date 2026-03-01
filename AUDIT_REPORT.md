# 🏥 Rețea Medicală — Full Codebase Audit Report

**Date:** 2026-02-28  
**Scope:** All source files in `/workspaces/retea_doctor`  
**Total files audited:** 73+

---

## FILE-BY-FILE ANALYSIS

---

### PAGES

#### `app/layout.tsx` (39 lines)
- ✅ No issues found. Clean root layout with ThemeProvider, SWRProvider, Toaster.

#### `app/(main)/layout.tsx` (56 lines)
- ✅ Well-structured with HeaderServer, SidebarServer, RightSidebar, MobileNav, ReportModal.
- ⚠️ **L46**: `RightSidebar` is rendered without any props, but it accepts optional community-related props (`communitySlug`, `communityName`, etc.). In the main layout it always renders the generic version — this is fine, but community pages never get a context-aware right sidebar since `RightSidebar` is in the layout, not the individual page.

#### `app/(main)/page.tsx` (66 lines)
- ⚠️ **L8-9**: `searchParams` is accessed synchronously. In Next.js 14.x this works, but in Next 15+ `searchParams` becomes a Promise. Current Next version is 14.2.18 — OK for now but a migration concern.
- ✅ Good Suspense fallback with skeleton loading.

#### `app/(main)/c/page.tsx` (51 lines)
- ✅ Clean communities listing page.
- ⚠️ **L35**: CSS class `glass` used (a utility class in globals.css) vs `glass-card` — inconsistent usage across pages. Some use `glass`, some use `glass-card`.

#### `app/(main)/c/[slug]/page.tsx` (105 lines)
- ✅ Well-structured community page with auth-aware join button.
- ✅ Good Suspense fallback.

#### `app/(main)/post/new/page.tsx` (37 lines)
- ⚠️ **L4**: `redirect` is imported from `next/navigation` but never used — dead import (the `requireAuth()` handles redirect internally).

#### `app/(main)/post/[id]/page.tsx` (54 lines)
- ⚠️ **L28**: `bookmarked` value is fetched but **never passed** to `PostDetail` component. The bookmark state in `PostDetail` is fetched independently via API call — the server-fetched value is wasted.
- ⚠️ **No view count increment**: When a user views a post, the `viewCount` is never incremented. The `postViews` table exists in schema but is never written to.

#### `app/(main)/u/[userId]/page.tsx` (100 lines)
- ⚠️ **L25**: `currentUserId` is fetched via `auth()` but **never used**. Dead variable — was likely intended for "is this my profile?" conditional (edit button, etc.).
- ⚠️ **Missing user flow**: No "Edit Profile" button/link even when viewing own profile.

#### `app/(main)/saved/page.tsx` (99 lines)
- ✅ Clean implementation with empty state.

#### `app/(main)/search/page.tsx` (79 lines)
- ⚠️ **Missing search filters**: The `searchSchema` validator supports `community` and `type` filters, but the search page UI only has a text input — no filter dropdowns.
- ⚠️ **No search autocomplete/suggestions** as planned in prompt.md.

#### `app/(main)/notifications/page.tsx` (15 lines)
- ✅ Clean server component that passes data to client component.

#### `app/(main)/notifications/notifications-client.tsx` (65 lines)
- ⚠️ **L21**: `const items = notifications.length > 0 ? notifications : initialNotifications;` — Incorrect logic. If SWR hasn't loaded yet, this correctly falls back. But once SWR returns an empty array (e.g., all notifications deleted), it will incorrectly show `initialNotifications` instead of the empty result. Should check `notifications !== undefined` or use a `data` check instead.
- ⚠️ **L22**: Same issue with `count` — defaults to `initialUnreadCount` when SWR returns `0`.

#### `app/(auth)/auth/login/page.tsx` (7 lines)
- 🔴 **CRITICAL**: This page just `redirect()`s to an external URL from env var `NEXT_PUBLIC_DOCTOR_APP_URL`. There is **no actual authentication flow in this app**. Users coming from the middleware redirect to `/auth/login` are immediately bounced to another app. If that env var is not set, users are redirected to `http://localhost:3000/sign-in` which may not exist.
- ⚠️ The middleware passes `?redirect=` query param to `/auth/login`, but the login page ignores it — no redirect-back after auth.

#### `app/admin/page.tsx` (117 lines)
- ✅ Admin dashboard with stats and quick links.
- ⚠️ **No admin layout**: The prompt.md mentions `admin/layout.tsx` but none exists. Admin pages don't inherit the main layout's header/sidebar — they have their own standalone UI.

#### `app/admin/reports/page.tsx` (128 lines)
- ⚠️ **No action buttons**: Reports page lists reports but has **no buttons to resolve, dismiss, or take action** on reports. It's read-only — admins can view but not manage reports.

#### `app/admin/users/page.tsx` (114 lines)
- ⚠️ **No user management actions**: No buttons to change user roles, ban users, or edit user info. Read-only table.

#### `app/admin/communities/page.tsx` (64 lines)
- ⚠️ **No community management**: No ability to create, edit, or delete communities. Read-only display.

---

### API ROUTES

#### `app/api/posts/route.ts` (106 lines)
- 🔴 **CRITICAL L69**: `RATE_LIMITS.strict` doesn't exist. The `RATE_LIMITS` object in `lib/rate-limit.ts` only defines: `vote`, `post`, `comment`, `search`, `default`. Using `.strict` will be `undefined`, causing `rateLimit()` to fall back to default config. Rate limiting for post creation is unintentionally lenient.
- ✅ Good error handling with catch block.

#### `app/api/posts/[id]/route.ts` (41 lines)
- ⚠️ **Missing PUT/DELETE handlers**: Only GET is implemented. There's no way to edit or delete a post via API. The `updatePostSchema` validator exists but is never used.
- ⚠️ **No error handling wrapper**: Missing try/catch.

#### `app/api/posts/[id]/vote/route.ts` (34 lines)
- ✅ Clean implementation with rate limiting.

#### `app/api/comments/route.ts` (104 lines)
- 🔴 **CRITICAL L30**: Same `RATE_LIMITS.strict` issue as posts route. `RATE_LIMITS.strict` is undefined.
- ✅ Good notification creation for post author and parent comment author.

#### `app/api/comments/[id]/vote/route.ts` (34 lines)
- ✅ Clean implementation.

#### `app/api/comments/[id]/route.ts` — **MISSING**
- 🔴 **MISSING FILE**: No `route.ts` exists at `app/api/comments/[id]/` — only the `vote/` subfolder exists. There is **no API endpoint to edit or delete a comment**. The prompt.md specifies `PUT, DELETE` for this route.

#### `app/api/communities/route.ts` (6 lines)
- ✅ Simple GET endpoint.
- ⚠️ **No error handling**: If `getCommunities()` throws, the error is unhandled.

#### `app/api/communities/[slug]/route.ts` (43 lines)
- ✅ Clean implementation.

#### `app/api/communities/[slug]/join/route.ts` (22 lines)
- ✅ Clean implementation.

#### `app/api/notifications/route.ts` (57 lines)
- ✅ Good implementation with count-only mode and mark-as-read.
- ⚠️ **No rate limiting** on this endpoint.

#### `app/api/bookmarks/route.ts` (49 lines)
- ✅ Both GET and POST implemented.
- ⚠️ **Missing DELETE endpoint**: The prompt.md mentions `GET + POST + DELETE` for bookmarks. The current `POST` calls `toggleBookmark` which toggles, but there's no explicit DELETE.

#### `app/api/search/route.ts` (31 lines)
- ✅ Clean with rate limiting and validation.
- ⚠️ **SQL Injection risk L27**: `searchPosts()` in `db/queries.ts` uses `ilike(posts.title, \`%${query}%\`)` — direct string interpolation in ILIKE pattern. While Drizzle parameterizes this, the `%` wildcards could allow pattern injection. Not a SQL injection per se, but a user could craft queries with `%` or `_` to match unintended patterns.

#### `app/api/user/[id]/route.ts` (27 lines)
- ✅ Clean implementation.
- ⚠️ **No PUT endpoint**: Users cannot update their profile (bio, specialization) via API.

#### `app/api/admin/reports/route.ts` (63 lines)
- ⚠️ **POST endpoint misplaced**: The POST endpoint for creating reports is on the admin route (`/api/admin/reports`). This means the ReportModal sends reports to an admin endpoint — conceptually confusing but functionally works since the POST handler doesn't check for admin role.
- ⚠️ **No PUT endpoint**: No way for admins to update report status (resolve, dismiss). Reports are read-only.

#### `app/api/auth/signout/route.ts` (7 lines)
- ✅ Clean implementation.
- ⚠️ **No redirect or cookie clearing** — just calls `supabase.auth.signOut()` and returns JSON.

---

### COMPONENTS

#### `components/layout/header.tsx` (167 lines)
- ✅ Well-built header with search, user menu, notification bell.
- ⚠️ **L86**: Keyboard shortcut `⌘K` is displayed but never wired up — no event listener for CMD+K focus.

#### `components/layout/header-server.tsx` (6 lines)
- ✅ Clean server wrapper.

#### `components/layout/sidebar.tsx` (130 lines)
- ✅ Clean sidebar with community list.
- ⚠️ **L26**: `"/?sort=hot"` nav item — `isActive` check at L46 compares `pathname === item.href` but `pathname` doesn't include query params. So this item will never show as active.

#### `components/layout/sidebar-server.tsx` (13 lines)
- ✅ Clean server wrapper.

#### `components/layout/right-sidebar.tsx` (120 lines)
- ⚠️ **L66-80**: Trending section is **hardcoded** with static data. No real trending posts are fetched.
- ⚠️ Trending items are not clickable links — they're divs with `cursor-pointer` but no `onClick` or `href`.

#### `components/layout/mobile-nav.tsx` (70 lines)
- ✅ Clean mobile navigation.

#### `components/feed/post-card.tsx` (218 lines)
- ⚠️ **L15**: `EXPERIENCE_LABELS` is imported but **never used** in the component. Dead import.
- ✅ Otherwise well-structured with good UX.

#### `components/feed/post-list.tsx` (120 lines)
- ✅ Good infinite scroll implementation with IntersectionObserver.
- ⚠️ **L62**: SWR fetcher extracts `data.posts` but the API response shape includes `{ posts, nextCursor, hasMore }`. The `nextCursor` is used in `getKey` but read from the flat posts array (last item's ID), not from the actual `nextCursor` field. This works but ignores the API's cursor field.

#### `components/feed/post-list-server.tsx` (55 lines)
- ✅ Clean server-to-client data transformation.

#### `components/feed/feed-sort-tabs.tsx` (52 lines)
- ✅ Clean sort tab implementation.

#### `components/post/post-detail.tsx` (175 lines)
- ⚠️ **L108**: Uses `text-emergency-500` class — `emergency` color is defined in Tailwind config with only `DEFAULT`, `50`, `500`, `600`, `700`. Using `text-emergency-500` should work.
- ⚠️ **No edit/delete buttons** for post author. Users cannot edit or delete their own posts from the UI.
- ⚠️ **Bookmark button** doesn't show current bookmark state — it's always the same "Save" icon regardless of whether the post is already bookmarked.

#### `components/post/post-form.tsx` (209 lines)
- ✅ Well-implemented form with tag management.
- ⚠️ **No preview mode**: Writing markdown but no way to preview before posting.

#### `components/post/post-type-badge.tsx` (38 lines)
- ⚠️ **L2**: `POST_TYPE_COLORS` is imported but **never used**. The component defines its own `colorMap` inline instead. Dead import.

#### `components/post/markdown-renderer.tsx` (25 lines)
- ⚠️ **XSS consideration**: Uses `dangerouslySetInnerHTML` with DOMPurify sanitization — this is the correct approach, but `renderMarkdown` from `lib/markdown.ts` calls `marked.parse()` which may return a Promise in newer versions of `marked`. Current code handles this with `typeof raw === "string"` check.

#### `components/comments/comment-tree.tsx` (98 lines)
- ✅ Clean tree building algorithm.

#### `components/comments/comment-item.tsx` (170 lines)
- ⚠️ **No edit/delete buttons** for comment author. The prompt specifies "Editare/ștergere comentariu propriu (în primele 15 minute)".
- ⚠️ **L11**: `MoreHorizontal` icon imported but **never used**. Dead import.

#### `components/comments/comment-form.tsx` (95 lines)
- ✅ Clean form with loading state and error handling.

#### `components/community/community-card.tsx` (55 lines)
- ✅ Clean community card.

#### `components/community/join-button.tsx` (55 lines)
- ⚠️ **L26**: Dynamically imports `joinCommunity` from `@/actions/vote-actions`. This calls a server action from a client component via dynamic import. This works in Next.js but is unconventional — typically you'd use the `"use server"` directive. It does work because `vote-actions.ts` has `"use server"` at the top.

#### `components/vote/vote-buttons.tsx` (113 lines)
- ✅ Good optimistic update implementation.

#### `components/notifications/notification-bell.tsx` (36 lines)
- ✅ Good with SWR polling every 60 seconds.
- ⚠️ Uses `bg-emergency` class — should work with Tailwind config.

#### `components/notifications/notification-list.tsx` (94 lines)
- ✅ Clean notification list.

#### `components/search/search-bar.tsx` (30 lines)
- ✅ Simple and clean.

#### `components/profile/profile-header.tsx` (81 lines)
- ⚠️ Uses `text-clinical` and `text-warning` colors — these work with Tailwind config.
- ⚠️ **No "Edit Profile" button** when viewing own profile.

#### `components/modals/report-modal.tsx` (103 lines)
- ✅ Clean modal with reason selection.

#### `components/modals/delete-confirm-modal.tsx` (56 lines)
- ⚠️ **Unused component**: This component requires an `onConfirm` prop to be passed, but it's **never rendered anywhere** in the app. The `DeleteConfirmModal` is never imported or used in any page or layout. It exists but has no integration point.

#### `components/providers/swr-provider.tsx` (16 lines)
- ✅ Clean SWR config.

#### `components/providers/theme-provider.tsx` (9 lines)
- ✅ Clean theme provider.

---

### CORE FILES

#### `db/schema.ts` (473 lines)
- ✅ Comprehensive schema with proper relations.
- ⚠️ **Missing CHECK constraint**: The `votes` table should have `CHECK (postId IS NOT NULL OR commentId IS NOT NULL)` as mentioned in prompt.md, but this constraint is not defined in Drizzle.
- ⚠️ **Missing GIN index** on `posts.tags` for efficient tag queries — mentioned in prompt.md but not implemented.
- ⚠️ **Missing hotScore index** — sorting by hotScore is used in queries but no dedicated index exists for it.

#### `db/queries.ts` (350 lines)
- ✅ Well-structured with React `cache()` for de-duplication.
- ⚠️ **Missing `getUserVotesOnComments`**: Comments are rendered without user vote state. The `CommentTree` component receives `commentData` from `getCommentsForPost` but doesn't include `userVote` per comment.
- ⚠️ **Search has no pagination**: `searchPosts` returns all results up to limit but has no cursor-based pagination.

#### `db/drizzle.ts` (13 lines)
- ✅ Clean setup.
- ⚠️ `DATABASE_URL!` non-null assertion — will crash at startup if env var is missing, with an unhelpful error.

#### `lib/auth.ts` (65 lines)
- ✅ Clean auth implementation with Supabase.
- ⚠️ **L57-58**: `requireAuth()` redirects to `/auth/login` which then redirects to external URL — double redirect.

#### `lib/supabase-server.ts` (56 lines)
- ✅ Clean Supabase server client.
- ⚠️ **`createSupabaseServiceClient` is never used** anywhere in the codebase. Dead code.

#### `lib/rate-limit.ts` (54 lines)
- 🔴 **CRITICAL**: Missing `strict` key in `RATE_LIMITS`. Two API routes reference `RATE_LIMITS.strict` which is `undefined`.
- ⚠️ **L52-53**: Comment acknowledges in-memory rate limiting doesn't work in serverless. This is a known limitation but not yet addressed.

#### `lib/hot-score.ts` (22 lines)
- ⚠️ **Duplicate logic**: Two functions `calculateHotScore` and `hotScore` do essentially the same thing but with different return value scaling. `calculateHotScore` multiplies by 10,000,000 and rounds; `hotScore` returns `toFixed(7)`. This is confusing.
- ⚠️ `calculateHotScore` is used in API route, `hotScore` is used in server action — inconsistent.

#### `lib/markdown.ts` (43 lines)
- ✅ Clean with DOMPurify sanitization.

#### `lib/utils.ts` (95 lines)
- ⚠️ **L81-88**: `POST_TYPE_COLORS` is exported but uses classes like `bg-emergency-500/20` and `text-primary-500`. While `primary-500` and `emergency-500` are defined in Tailwind, these dynamic class strings may be **purged by Tailwind** since they're constructed as template strings and not present in component markup. This is a potential styling bug.
- ✅ Otherwise clean utility functions.

#### `lib/validators.ts` (88 lines)
- ✅ Comprehensive Zod schemas.
- ⚠️ **`updatePostSchema` and `updateCommentSchema`** are defined but never used anywhere — no edit functionality exists.
- ⚠️ **`voteSchema`** is defined but never used — vote API routes parse the body manually.
- ⚠️ **`reportSchema`** is defined but never used — the report modal sends data without validation.

#### `actions/post-actions.ts` (81 lines)
- ✅ `createPost` and `deletePost` are implemented.
- ⚠️ **`createPost`** server action exists but the `PostForm` component uses the API route (`/api/posts` POST) instead. The server action is **dead code**.
- ⚠️ **`deletePost`** is implemented but **never called** from any UI component.
- ⚠️ **No `updatePost`** action — editing posts is not possible.

#### `actions/comment-actions.ts` (115 lines)
- ✅ `createComment` and `deleteComment` are implemented.
- ⚠️ **`createComment`** server action exists but `CommentForm` uses the API route (`/api/comments` POST). **Dead code**.
- ⚠️ **`deleteComment`** is implemented but **never called** from any UI.
- ⚠️ **No `updateComment`** action.

#### `actions/vote-actions.ts` (215 lines)
- ✅ `voteOnPost`, `voteOnComment`, `toggleBookmark`, `joinCommunity` all well-implemented.
- ✅ Properly prevents self-voting.
- ✅ Good karma tracking.

#### `hooks/use-comments.ts` (5 lines)
- ⚠️ **Never used**: This hook is defined but not imported anywhere in the codebase.

#### `hooks/use-notifications.ts` (43 lines)
- ✅ Used in `notifications-client.tsx`.
- ⚠️ **Silent failure**: `markAsRead` and `markAllAsRead` silently swallow errors.

#### `hooks/use-posts.ts` (73 lines)
- ⚠️ **Never used**: The `usePosts` hook duplicates the logic in `PostList` component. The component has its own inline SWR infinite implementation. This hook is **dead code**.
- ⚠️ **`usePost`** hook at the bottom is also never used.

#### `hooks/use-vote.ts` (62 lines)
- ⚠️ **Never used**: `VoteButtons` component has its own inline vote state management. This hook is **dead code**.

#### `stores/modal-store.ts` (25 lines)
- ✅ Clean Zustand store.
- ⚠️ `"createPost"` modal type is defined but never used.

---

### CONFIG FILES

#### `tailwind.config.ts` (126 lines)
- ✅ Well-configured with custom colors and animations.

#### `app/globals.css` (322 lines)
- ✅ Comprehensive glass morphism styles and animations.
- ⚠️ **L301**: Duplicate `animate-fade-in` definition — defined once at L286 and again at L321 with different animation names (`fade-in-up` vs `fade-in`).

#### `middleware.ts` (61 lines)
- ✅ Clean Supabase middleware with route protection.
- ⚠️ **L49**: Protected paths include `/admin` but don't check for admin role — only checks if user is logged in. Any authenticated user can access admin pages (the page itself checks role, but a dedicated middleware check would be better).

#### `next.config.js` (21 lines)
- ✅ Clean config.
- ⚠️ `hostname: "img.clerk.com"` in image domains — the app uses Supabase auth, not Clerk. This is leftover from a different project.

#### `config/constants.ts` (45 lines)
- ✅ Clean constants.
- ⚠️ **`EDIT_WINDOW_MINUTES = 15`** is defined but never used — no edit functionality exists.

#### `config/communities.ts` (169 lines)
- ✅ Good default community definitions.

---

## MISSING USER FLOWS

| Flow | Status | Details |
|------|--------|---------|
| **Create Account** | ❌ External | Redirects to MedLearn app. No in-app registration. |
| **Login** | ❌ External | Redirects to MedLearn app. |
| **Edit Profile** | ❌ Missing | No edit profile page or API endpoint. |
| **Edit Post** | ❌ Missing | Schema validator exists, but no API route, no server action, no UI. |
| **Delete Post** | ⚠️ Partial | Server action exists but no UI trigger (no delete button). |
| **Edit Comment** | ❌ Missing | Schema validator exists, but no implementation. |
| **Delete Comment** | ⚠️ Partial | Server action exists but no UI trigger. |
| **Admin: Resolve Report** | ❌ Missing | Reports can be viewed but not actioned. |
| **Admin: Ban User** | ❌ Missing | Users can be viewed but not managed. |
| **Admin: Manage Community** | ❌ Missing | Communities can be viewed but not created/edited. |
| **View Count** | ❌ Missing | `postViews` table exists, `viewCount` field exists, but never incremented. |
| **User Profile Tabs** | ❌ Missing | Prompt specifies Posts/Comments/Saved/Upvotes tabs, only Posts exist. |
| **Community About Page** | ❌ Missing | `c/[slug]/about/` route mentioned in prompt.md but not created. |
| **Search Filters** | ❌ Missing | Only plain text search, no community/type/author filters. |
| **Search Autocomplete** | ❌ Missing | Planned but not implemented. |

---

## PRIORITIZED ISSUE LIST

### 🔴 CRITICAL (App won't work / crashes)

| # | Issue | File | Line |
|---|-------|------|------|
| C1 | `RATE_LIMITS.strict` is `undefined` — rate limiting for post/comment creation silently broken | [lib/rate-limit.ts](lib/rate-limit.ts#L14) | 14 |
| C2 | Login page just redirects externally — no auth flow in the app; if `NEXT_PUBLIC_DOCTOR_APP_URL` is unset, redirects to potentially nonexistent localhost:3000 | [app/(auth)/auth/login/page.tsx](app/(auth)/auth/login/page.tsx#L5) | 5 |
| C3 | `RATE_LIMITS.strict` used in POST /api/posts — undefined config object passed to rateLimit() | [app/api/posts/route.ts](app/api/posts/route.ts#L69) | 69 |
| C4 | `RATE_LIMITS.strict` used in POST /api/comments — same issue | [app/api/comments/route.ts](app/api/comments/route.ts#L30) | 30 |

### 🟠 HIGH (Major features broken / missing)

| # | Issue | File | Line |
|---|-------|------|------|
| H1 | No API route to edit/delete posts (PUT/DELETE missing on `/api/posts/[id]`) | app/api/posts/[id]/route.ts | — |
| H2 | No API route to edit/delete comments — `app/api/comments/[id]/route.ts` doesn't exist | app/api/comments/[id]/ | — |
| H3 | No UI to delete own posts (deletePost action exists but no button triggers it) | components/post/post-detail.tsx | — |
| H4 | No UI to delete own comments (deleteComment action exists but no button) | components/comments/comment-item.tsx | — |
| H5 | No Edit Profile page or API — users can't set bio, specialization | app/api/user/[id]/route.ts | — |
| H6 | Admin reports page is read-only — no resolve/dismiss/action buttons | [app/admin/reports/page.tsx](app/admin/reports/page.tsx#L90) | 90 |
| H7 | Admin users page is read-only — no role changes or ban functionality | [app/admin/users/page.tsx](app/admin/users/page.tsx#L50) | 50 |
| H8 | View counts never increment — `postViews` table unused, `viewCount` always 0 | db/schema.ts | 310+ |
| H9 | Login redirect doesn't preserve `?redirect=` param — after auth, user lands on external app homepage, not back where they were | [app/(auth)/auth/login/page.tsx](app/(auth)/auth/login/page.tsx#L5) | 5 |
| H10 | Post form uses API route, but `createPost` server action is dead code that diverges | [actions/post-actions.ts](actions/post-actions.ts#L12) | 12 |
| H11 | Comment form uses API route, but `createComment` server action is dead code | [actions/comment-actions.ts](actions/comment-actions.ts#L11) | 11 |
| H12 | `notifications-client.tsx` incorrectly falls back to initial data when SWR returns empty array | [app/(main)/notifications/notifications-client.tsx](app/(main)/notifications/notifications-client.tsx#L21) | 21 |

### 🟡 MEDIUM (UX problems / missing validation)

| # | Issue | File | Line |
|---|-------|------|------|
| M1 | Bookmark button in PostDetail doesn't show current state (saved vs. not saved) | [components/post/post-detail.tsx](components/post/post-detail.tsx#L140) | 140 |
| M2 | Right sidebar has hardcoded trending section — not real data | [components/layout/right-sidebar.tsx](components/layout/right-sidebar.tsx#L66) | 66 |
| M3 | Right sidebar trending items look clickable (cursor-pointer) but have no links | [components/layout/right-sidebar.tsx](components/layout/right-sidebar.tsx#L76) | 76 |
| M4 | Sidebar "Populare" nav item (`/?sort=hot`) can never show as active — pathname check excludes query params | [components/layout/sidebar.tsx](components/layout/sidebar.tsx#L46) | 46 |
| M5 | No markdown preview in PostForm before publishing | [components/post/post-form.tsx](components/post/post-form.tsx) | — |
| M6 | No search filters (community, type, author) despite validator support | [app/(main)/search/page.tsx](app/(main)/search/page.tsx) | — |
| M7 | Comments don't include user's vote state — `userVote` is always undefined in comment tree | [db/queries.ts](db/queries.ts#L160) | 160 |
| M8 | `⌘K` keyboard shortcut displayed in header but never implemented | [components/layout/header.tsx](components/layout/header.tsx#L86) | 86 |
| M9 | Middleware protects admin routes for auth but not for admin role — any logged-in user can see admin pages briefly before server-side redirect | [middleware.ts](middleware.ts#L49) | 49 |
| M10 | `DeleteConfirmModal` component exists but is never used/rendered (except in no page) | [components/modals/delete-confirm-modal.tsx](components/modals/delete-confirm-modal.tsx) | — |
| M11 | `POST_TYPE_COLORS` imported but unused in `post-type-badge.tsx` (uses inline colorMap) | [components/post/post-type-badge.tsx](components/post/post-type-badge.tsx#L2) | 2 |
| M12 | `voteSchema`, `reportSchema` validators defined but never used in API routes | [lib/validators.ts](lib/validators.ts#L57) | 57 |
| M13 | Admin reports POST handler doesn't validate with `reportSchema` | [app/api/admin/reports/route.ts](app/api/admin/reports/route.ts#L50) | 50 |
| M14 | `img.clerk.com` in Next.js remote patterns — leftover from different auth system | [next.config.js](next.config.js#L8) | 8 |
| M15 | `POST_TYPE_COLORS` in `lib/utils.ts` uses dynamic Tailwind classes that may be purged | [lib/utils.ts](lib/utils.ts#L81) | 81 |
| M16 | Duplicate `animate-fade-in` CSS definition with different animations | [app/globals.css](app/globals.css#L286) | 286, 321 |
| M17 | `createSupabaseServiceClient` in supabase-server.ts is never used | [lib/supabase-server.ts](lib/supabase-server.ts#L31) | 31 |
| M18 | Community page right sidebar doesn't show community-specific info (props not passed from layout) | [components/layout/right-sidebar.tsx](components/layout/right-sidebar.tsx) | — |

### 🟢 LOW (Polish / nice-to-have)

| # | Issue | File | Line |
|---|-------|------|------|
| L1 | `EXPERIENCE_LABELS` imported but unused in `post-card.tsx` | [components/feed/post-card.tsx](components/feed/post-card.tsx#L15) | 15 |
| L2 | `MoreHorizontal` imported but unused in `comment-item.tsx` | [components/comments/comment-item.tsx](components/comments/comment-item.tsx#L11) | 11 |
| L3 | `redirect` imported but unused in `post/new/page.tsx` | [app/(main)/post/new/page.tsx](app/(main)/post/new/page.tsx#L1) | 1 |
| L4 | `currentUserId` fetched but unused in `u/[userId]/page.tsx` | [app/(main)/u/[userId]/page.tsx](app/(main)/u/[userId]/page.tsx#L25) | 25 |
| L5 | `useComments` hook is dead code — never imported | [hooks/use-comments.ts](hooks/use-comments.ts) | — |
| L6 | `usePosts` hook is dead code — duplicates PostList inline logic | [hooks/use-posts.ts](hooks/use-posts.ts) | — |
| L7 | `useVote` hook is dead code — VoteButtons has inline implementation | [hooks/use-vote.ts](hooks/use-vote.ts) | — |
| L8 | `usePost` hook is dead code — never imported | [hooks/use-posts.ts](hooks/use-posts.ts#L72) | 72 |
| L9 | Duplicate hot score functions: `calculateHotScore` vs `hotScore` | [lib/hot-score.ts](lib/hot-score.ts) | 1, 8 |
| L10 | `EDIT_WINDOW_MINUTES` constant defined but edit feature doesn't exist | [config/constants.ts](config/constants.ts#L9) | 9 |
| L11 | `updatePostSchema` and `updateCommentSchema` defined but never used | [lib/validators.ts](lib/validators.ts#L27) | 27, 43 |
| L12 | `createPost` modal type in store — never opened | [stores/modal-store.ts](stores/modal-store.ts#L8) | 8 |
| L13 | In-memory rate limiting won't work on serverless deployments (Vercel) | [lib/rate-limit.ts](lib/rate-limit.ts#L52) | 52 |
| L14 | Missing `c/[slug]/about/` route referenced in project spec | — | — |
| L15 | Missing admin layout for consistent admin UI | — | — |
| L16 | Missing `hotScore` index on posts table for efficient hot sort queries | [db/schema.ts](db/schema.ts#L150) | 150 |
| L17 | Missing CHECK constraint on votes table (postId OR commentId must be non-null) | [db/schema.ts](db/schema.ts#L200) | 200 |
| L18 | `PostList` SWR ignores API's `nextCursor` field, reads cursor from last post ID instead | [components/feed/post-list.tsx](components/feed/post-list.tsx#L62) | 62 |
| L19 | `bookmarked` value fetched in post page but never passed to PostDetail | [app/(main)/post/[id]/page.tsx](app/(main)/post/[id]/page.tsx#L28) | 28 |
| L20 | User profile page missing tabs (Comments/Saved/Upvotes) as specified | [app/(main)/u/[userId]/page.tsx](app/(main)/u/[userId]/page.tsx) | — |

---

## SUMMARY

| Severity | Count |
|----------|-------|
| 🔴 CRITICAL | 4 |
| 🟠 HIGH | 12 |
| 🟡 MEDIUM | 18 |
| 🟢 LOW | 20 |
| **Total** | **54** |

### Top 5 Recommendations (ordered by impact):

1. **Add `strict` to `RATE_LIMITS`** — Trivial fix, prevents undefined config from breaking rate limiting on post/comment creation.
2. **Implement edit/delete post & comment endpoints + UI** — Core Reddit-like functionality that's completely missing.
3. **Add admin action buttons** — Reports page is useless without resolve/dismiss.
4. **Fix notifications fallback logic** — SWR empty array incorrectly falls back to initial data.
5. **Clean up dead code** — 3 unused hooks, 2 unused server actions (duplicated by API routes), multiple unused imports. Reduces confusion for future development.
