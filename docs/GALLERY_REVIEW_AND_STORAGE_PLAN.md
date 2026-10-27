# Client galleries: storage and review plan

## Storage choice

Use a **private Cloudflare R2 Standard bucket** for finished originals. Keep image bytes out of MongoDB and the Next.js server's filesystem. R2's free tier includes 10 GB-month of Standard storage, 1 million write-class requests, 10 million read-class requests, and free direct egress. Storage after the free allowance is currently $0.015 per GB-month. A gallery business with hundreds of large files cannot rely on unlimited free storage; this is a free starting allowance with low marginal cost.

For scale: 500 originals averaging 20 MB occupy about 10 GB before display variants. 1,000 at that size occupy about 20 GB, with roughly $0.15/month in storage above the 10 GB free allowance at current pricing, before variants or other services. This assumes a full month's storage and does not include charges from other metered services. R2 setup requires a Cloudflare account and completing its subscription checkout flow.

Proposed delivery path:

1. Admin selects hundreds of JPEG, PNG, or WebP photos. The app requests scoped, short-lived upload permission and sends originals directly from the browser to the private bucket. Use multipart upload for large files and verify each stored object's size and key before adding it to the gallery. Preserve the original bytes.
2. Generate small grid and viewer variants without making originals public. Cloudflare Images can transform images stored in R2 through a Worker binding; its Free plan currently includes 5,000 unique transformations per month. Set two or three fixed variants to keep this predictable.
3. The gallery app checks publication and password access. A Worker serves display variants only when given a short-lived gallery token. Original downloads require the app's download permission check and a short-lived R2 URL.
4. MongoDB records object keys, dimensions, sets, ordering, and access settings. Add storage usage monitoring before routine client delivery.

This is the target architecture. The current gallery implementation still uses Cloudinary authenticated assets, whose Free plan is limited to 10 MiB per image and shares 25 credits across storage, transformations, and bandwidth. Move the upload and delivery paths to R2 before using the gallery for full-resolution client deliveries. No R2 account or bucket is configured in this repository yet.

References: [R2 pricing](https://developers.cloudflare.com/r2/pricing/), [R2 upload methods](https://developers.cloudflare.com/r2/objects/upload-objects/), [Cloudflare Images pricing](https://developers.cloudflare.com/images/pricing/), [Images binding](https://developers.cloudflare.com/images/optimization/binding/), [Cloudinary billing](https://cloudinary.com/documentation/billing_and_plans).

## Review gate

The repository is public, so standard GitHub-hosted Actions runs are free. The `Gallery PR checks` workflow runs scoped gallery ESLint checks and a production build for each pull request into `main`. The PR template requires testing and explicit handling of code review findings.

Use **CodeRabbit OSS** for automated PR review. Its public-repository plan currently provides free reviews after its GitHub App is installed. CodeRabbit is advisory; its comments should be read and resolved before merge. The app needs repository access and must be connected through the owner's GitHub account. Do not enable paid CodeRabbit usage-based extras.

Protect `main` with a GitHub rule requiring a pull request and the `Gallery lint and build` check. If another collaborator can review, require one human approval too. The owner should not rely on an AI comment as an approval of their own PR. Keep the client-gallery branch and PR unmerged until both the checks and review have been considered.

The `main` ruleset is active and requires a pull request, resolved review conversations, and the passing gallery check. The PR remains a draft. During review, the inherited admin registration endpoint was found to allow public account creation, so registration now requires an existing admin token and admin JWT verification fails closed when `JWT_SECRET` is absent. CodeRabbit still needs to be connected from a signed-in GitHub browser session.

References: [GitHub public Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions), [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches), [CodeRabbit OSS](https://www.coderabbit.ai/oss).
